using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Sockets;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.Extensions.Caching.Memory;
using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;

var builder = WebApplication.CreateBuilder(args);
var isRunningInContainer = string.Equals(
    Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER"),
    "true",
    StringComparison.OrdinalIgnoreCase);

builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

if (builder.Environment.IsDevelopment() && !isRunningInContainer)
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenLocalhost(8080, listenOptions =>
        {
            listenOptions.UseHttps();
        });
    });
}
else
{
    builder.Services.AddSpaStaticFiles(configuration =>
    {
        configuration.RootPath = "wwwroot/dist";
    });
}

// Add DB Context (using connection string from appsettings or env)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=vacation_optimizer;Username=postgres;Password=postgres";
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    options.UseVacationOptimizerSeeding();

    if (!builder.Environment.IsDevelopment())
    {
        options.ConfigureWarnings(warnings =>
            warnings.Log(RelationalEventId.PendingModelChangesWarning));
    }
});

// Register services
builder.Services.AddScoped<PublicHolidayService>();
builder.Services.AddScoped<IPublicHolidayService>(serviceProvider =>
    new CachedPublicHolidayService(
        serviceProvider.GetRequiredService<PublicHolidayService>(),
        serviceProvider.GetRequiredService<IMemoryCache>()));
builder.Services.AddScoped<CalendarService>();
builder.Services.AddScoped<VacationOptimizerService>();

builder.Services.AddEndpointsApiExplorer().AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    o.JsonSerializerOptions.WriteIndented = true;
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();
const string robotsTxt = """
User-agent: *
Allow: /app/
Allow: /app/manifest.json
Allow: /app/icons/
""";
const string adsTxt = """
google.com, pub-9485445500768000, DIRECT, f08c47fec0942fa0
""";

// Run migrations automatically on startup if not testing
if (!app.Environment.IsEnvironment("Testing"))
{
    const int maxAttempts = 10;
    var delay = TimeSpan.FromSeconds(3);

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            if (db.Database.IsRelational())
            {
                db.Database.Migrate();
            }

            break;
        }
        catch (Exception ex) when (attempt < maxAttempts && IsTransientDbStartupException(ex))
        {
            app.Logger.LogWarning(ex, "Database is not ready yet (attempt {Attempt}/{MaxAttempts}). Retrying in {DelaySeconds}s.", attempt, maxAttempts, delay.TotalSeconds);
            Thread.Sleep(delay);
        }
    }
}

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!builder.Environment.IsDevelopment() || !isRunningInContainer)
{
    app.UseHttpsRedirection();
}

// API Endpoints
var api = app.MapGroup("/api/vacations");

api.MapPost("/optimize", (OptimizeRequest request, VacationOptimizerService optimizer) =>
{
    try
    {
        if (string.Equals(request.Country, "IN", StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(new { error = "India optimizations must use /api/vacations/countries/IN/optimize." });
        }

        if (string.Equals(request.Country, "ES", StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(new { error = "Spain optimizations must use /api/vacations/countries/ES/optimize." });
        }

        var result = optimizer.Optimize(request);
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

api.MapGet("/countries", (IPublicHolidayService holidayService) =>
{
    return holidayService.GetCountries();
});

api.MapGet("/countries/{countryCode}/states", (string countryCode, IPublicHolidayService holidayService) =>
{
    if (string.Equals(countryCode, "IN", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { error = "India state options are exposed through /api/vacations/countries/IN/schema." });
    }

    if (string.Equals(countryCode, "ES", StringComparison.OrdinalIgnoreCase))
    {
        return Results.BadRequest(new { error = "Spain region and city options are exposed through /api/vacations/countries/ES/schema." });
    }

    var states = holidayService.GetStates(countryCode);
    return Results.Ok(states);
});

api.MapGet("/countries/IN/schema", (IPublicHolidayService holidayService) =>
{
    var states = holidayService
        .GetStates("IN")
        .Select(state => new OptimizationStateOption(state.Code, state.Name))
        .ToArray();

    return Results.Ok(new IndiaCountrySchema(
        CountryCode: "IN",
        Component: "india",
        YearRange: new OptimizationYearRange(
            OptimizationDefaults.MinimumYear,
            OptimizationDefaults.MaximumYear),
        Defaults: new OptimizationFormDefaults(
            OptimizationDefaults.VacationDays,
            OptimizationDefaults.MinimumDaysPerRange,
            OptimizationDefaults.MaximumDaysPerRange),
        StateSelectionRequired: true,
        States: states));
});

api.MapPost("/countries/IN/optimize", (IndiaOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.StateCode))
        {
            return Results.BadRequest(new { error = "India optimizations require a stateCode." });
        }

        var state = holidayService
            .GetStates("IN")
            .FirstOrDefault(entry => string.Equals(entry.Code, request.StateCode, StringComparison.OrdinalIgnoreCase));

        if (state is null)
        {
            return Results.BadRequest(new { error = $"Unsupported state code '{request.StateCode}' for country 'IN'." });
        }

        var internalRequest = new OptimizeRequest(
            Country: "IN",
            Year: request.Year,
            VacationDays: request.VacationDays,
            MinimumDaysPerRange: request.MinimumDaysPerRange,
            MaximumDaysPerRange: request.MaximumDaysPerRange,
            CustomFreeDays: request.CustomFreeDays,
            State: state.Code,
            IgnoredHolidayDates: request.IgnoredHolidayDates);

        var result = optimizer.Optimize(internalRequest);

        return Results.Ok(new IndiaOptimizeResult(
            CountryCode: "IN",
            Scope: new IndiaOptimizationScope(
                Type: "state",
                StateCode: state.Code,
                StateName: state.Name),
            Calendar: result.Calendar,
            SelectedVacationDays: result.SelectedVacationDays,
            Ranges: result.Ranges,
            TotalDaysOff: result.TotalDaysOff,
            VacationDaysUsed: result.VacationDaysUsed,
            PublicHolidaysCount: result.PublicHolidaysCount));
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

api.MapGet("/countries/ES/schema", (IPublicHolidayService holidayService) =>
{
    var allStates = holidayService.GetStates("ES");
    var states = allStates
        .Where(state => !IsSpainCityCode(state.Code))
        .Select(state => new OptimizationStateOption(state.Code, state.Name))
        .ToArray();
    var cities = allStates
        .Where(state => IsSpainCityCode(state.Code))
        .Select(state => new SpainCityOption(
            state.Code,
            state.Name,
            GetSpainParentStateCode(state.Code)!))
        .ToArray();

    return Results.Ok(new SpainCountrySchema(
        CountryCode: "ES",
        Component: "spain",
        YearRange: new OptimizationYearRange(
            OptimizationDefaults.MinimumYear,
            OptimizationDefaults.MaximumYear),
        Defaults: new OptimizationFormDefaults(
            OptimizationDefaults.VacationDays,
            OptimizationDefaults.MinimumDaysPerRange,
            OptimizationDefaults.MaximumDaysPerRange),
        States: states,
        Cities: cities));
});

api.MapPost("/countries/ES/optimize", (SpainOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
{
    try
    {
        var availableStates = holidayService.GetStates("ES");
        var stateMap = availableStates.ToDictionary(state => state.Code, StringComparer.OrdinalIgnoreCase);

        string? normalizedStateCode = string.IsNullOrWhiteSpace(request.StateCode) ? null : request.StateCode.Trim().ToUpperInvariant();
        string? normalizedCityCode = string.IsNullOrWhiteSpace(request.CityCode) ? null : request.CityCode.Trim().ToUpperInvariant();

        if (normalizedStateCode is not null && (!stateMap.TryGetValue(normalizedStateCode, out var selectedRegion) || IsSpainCityCode(selectedRegion.Code)))
        {
            return Results.BadRequest(new { error = $"Unsupported state code '{request.StateCode}' for country 'ES'." });
        }

        if (normalizedCityCode is not null)
        {
            if (!stateMap.TryGetValue(normalizedCityCode, out var selectedCity) || !IsSpainCityCode(selectedCity.Code))
            {
                return Results.BadRequest(new { error = $"Unsupported city code '{request.CityCode}' for country 'ES'." });
            }

            normalizedStateCode = GetSpainParentStateCode(normalizedCityCode);
        }

        var effectiveStateCode = normalizedCityCode ?? normalizedStateCode;
        var internalRequest = new OptimizeRequest(
            Country: "ES",
            Year: request.Year,
            VacationDays: request.VacationDays,
            MinimumDaysPerRange: request.MinimumDaysPerRange,
            MaximumDaysPerRange: request.MaximumDaysPerRange,
            CustomFreeDays: request.CustomFreeDays,
            State: effectiveStateCode,
            IgnoredHolidayDates: request.IgnoredHolidayDates);

        var result = optimizer.Optimize(internalRequest);
        stateMap.TryGetValue(normalizedStateCode ?? string.Empty, out var selectedState);
        stateMap.TryGetValue(normalizedCityCode ?? string.Empty, out var selectedCityResult);

        return Results.Ok(new SpainOptimizeResult(
            CountryCode: "ES",
            Scope: new SpainOptimizationScope(
                Type: normalizedCityCode is not null ? "city" : normalizedStateCode is not null ? "state" : "national",
                StateCode: normalizedStateCode,
                StateName: selectedState?.Name,
                CityCode: normalizedCityCode,
                CityName: selectedCityResult?.Name),
            Calendar: result.Calendar,
            SelectedVacationDays: result.SelectedVacationDays,
            Ranges: result.Ranges,
            TotalDaysOff: result.TotalDaysOff,
            VacationDaysUsed: result.VacationDaysUsed,
            PublicHolidaysCount: result.PublicHolidaysCount));
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

api.MapGet("/detected-country", (HttpContext httpContext, IPublicHolidayService holidayService) =>
{
    var rawHeaderValues = new[]
    {
        httpContext.Request.Headers["X-Country-Code"].FirstOrDefault(),
        httpContext.Request.Headers["CF-IPCountry"].FirstOrDefault(),
        httpContext.Request.Headers["x-vercel-ip-country"].FirstOrDefault(),
        httpContext.Request.Headers["Fastly-Client-Country"].FirstOrDefault(),
    }
    .Where(value => !string.IsNullOrWhiteSpace(value))
    .Select(value => value!.Trim().ToUpperInvariant())
    .ToArray();

    var hasGeoHeaders = rawHeaderValues.Length > 0;
    var supportedCountryCodes = holidayService
        .GetCountries()
        .Select(country => country.Code)
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    var detectedCountryCode = rawHeaderValues.FirstOrDefault(supportedCountryCodes.Contains);

    return Results.Ok(new
    {
        hasGeoHeaders,
        countryCode = detectedCountryCode,
    });
});

app.MapGet("/robots.txt", () => Results.Text(robotsTxt, "text/plain"));
app.MapGet("/app/robots.txt", () => Results.Text(robotsTxt, "text/plain"));
app.MapGet("/ads.txt", () => Results.Text(adsTxt, "text/plain"));
app.MapGet("/app/ads.txt", () => Results.Text(adsTxt, "text/plain"));

// SPA hosting
app.UseStaticFiles();
app.UseRouting();

var spaPath = "/app";
app.UseSpa(spa =>
{
    if (app.Environment.IsProduction())
    {
        app.Use(async (context, next) =>
        {
            if (context.Request.Path == "/")
            {
                context.Response.Redirect("/app");
                return;
            }
            await next();
        });
        app.UsePathBase(spaPath);
        app.UseSpaStaticFiles();
        spa.Options.SourcePath = "wwwroot/dist";
        spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions
        {
            OnPrepareResponse = ctx =>
            {
                ResponseHeaders headers = ctx.Context.Response.GetTypedHeaders();
                headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                {
                    NoCache = true,
                    NoStore = true,
                    MustRevalidate = true
                };
            }
        };
    }
});

app.Run();

static bool IsTransientDbStartupException(Exception ex)
{
    if (ex is NpgsqlException)
    {
        return true;
    }

    var current = ex;
    while (current != null)
    {
        if (current is SocketException)
        {
            return true;
        }

        current = current.InnerException;
    }

    return false;
}

static bool IsSpainCityCode(string code) => code is "ES-CT-BCN" or "ES-MD-MAD";

static string? GetSpainParentStateCode(string code) => code switch
{
    "ES-CT-BCN" => "ES-CT",
    "ES-MD-MAD" => "ES-MD",
    _ => null,
};

public partial class Program { }
