using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Caching.Memory;
using Scalar.AspNetCore;
using VacationOptimizer.Server.CountrySpecific;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Hosting;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;

var builder = WebApplication.CreateBuilder(args);
var isRunningInContainer = string.Equals(
    Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER"),
    "true",
    StringComparison.OrdinalIgnoreCase);

builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();

builder.AddVacationOptimizerHosting(isRunningInContainer);

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
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<PublicHolidayService>();
builder.Services.AddScoped<IPublicHolidayService>(serviceProvider =>
    new CachedPublicHolidayService(
        serviceProvider.GetRequiredService<PublicHolidayService>(),
        serviceProvider.GetRequiredService<IMemoryCache>()));
builder.Services.AddScoped<CalendarService>();
var resultTokenSigningKey = builder.Configuration["Optimization:ResultTokenSigningKey"];
if (builder.Environment.IsProduction() && string.IsNullOrWhiteSpace(resultTokenSigningKey))
{
    throw new InvalidOperationException("Optimization:ResultTokenSigningKey must be configured in Production.");
}

builder.Services.AddSingleton<IResultTokenService>(
    new ResultTokenService(resultTokenSigningKey ?? "development-result-token-signing-key"));
builder.Services.AddScoped<VacationOptimizerService>();
builder.Services.AddScoped<IDetectCountryService, DetectedCountryService>();
builder.Services.AddScoped<CalendarSeed>();
builder.Services.Configure<DatabaseSecurityHealthCheckOptions>(
    builder.Configuration.GetSection(DatabaseSecurityHealthCheckOptions.SectionName));
builder.Services.AddSingleton<DatabaseSecurityHealthEndpointAccessGuard>();
builder.Services.AddSingleton<DatabaseSecurityHealthReportStore>();
builder.Services.AddScoped<IDatabaseSecurityHealthCheck, DatabaseSecurityHealthCheck>();
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddHostedService<DatabaseSecurityHealthCheckWorker>();
}

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

PersistenceInitializer.Initialize(app);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// API Endpoints
var api = app.MapGroup("/api/vacations");

api.MapPost("/optimize", (OptimizeRequest request, VacationOptimizerService optimizer) =>
{
    try
    {
        if (CountrySpecificVacationEndpoints.RequiresCountrySpecificEndpoint(request.Country))
        {
            return Results.BadRequest(new { error = $"{request.Country.ToUpperInvariant()} optimizations must use {CountrySpecificVacationEndpoints.GetCountrySpecificOptimizePath(request.Country)}." });
        }

        var result = optimizer.Optimize(request);
        return Results.Ok(result);
    }
    catch (OptimizationResultUnavailableException ex)
    {
        return Results.Conflict(new { error = ex.Message });
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

api.MapPost("/decode-seed", (DecodeSeedRequest request, CalendarSeed calendarSeed) =>
{
    try
    {
        var days = calendarSeed.GetCalendarDaysFromSeed(request.SeedToken);
        return Results.Ok(days.Select(d => d.Type));
    }
    catch (FormatException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

api.MapGet("/countries", (IPublicHolidayService holidayService) => holidayService.GetCountries());

api.MapGet("/countries/{countryCode}/states", (string countryCode, IPublicHolidayService holidayService) =>
{
    if (CountrySpecificVacationEndpoints.RequiresCountrySpecificEndpoint(countryCode))
    {
        return Results.BadRequest(new { error = $"{countryCode.ToUpperInvariant()} options are exposed through {CountrySpecificVacationEndpoints.GetCountrySpecificSchemaPath(countryCode)}." });
    }

    var states = holidayService.GetStates(countryCode);
    return Results.Ok(states);
});

api.MapCountrySpecificVacationEndpoints();

api.MapGet("/detected-country", (IDetectCountryService detectCountryService) => detectCountryService.DetectCountry());

app.MapGet("/api/internal/database-security", (
    HttpContext context,
    DatabaseSecurityHealthEndpointAccessGuard accessGuard,
    DatabaseSecurityHealthReportStore reportStore) =>
{
    context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
    context.Response.Headers["Pragma"] = "no-cache";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["X-Robots-Tag"] = "noindex, nofollow, noarchive";

    var accessDecision = accessGuard.Authorize(context, context.Request.Query["accessKey"].ToString());
    return accessDecision.Result switch
    {
        DatabaseSecurityHealthEndpointAccessResult.Granted when reportStore.LatestReport is { } report =>
            report.Status == DatabaseSecurityHealthStatus.Unhealthy
                ? Results.Json(report, statusCode: StatusCodes.Status503ServiceUnavailable)
                : Results.Ok(report),
        DatabaseSecurityHealthEndpointAccessResult.Granted =>
            Results.StatusCode(StatusCodes.Status503ServiceUnavailable),
        DatabaseSecurityHealthEndpointAccessResult.CoolingDown => CooldownResponse(context, accessDecision.RetryAfter),
        _ => Results.NotFound()
    };
}).WithMetadata(new DisableCorsAttribute());

app.MapContentEndpoints();
app.UseVacationOptimizerHosting(isRunningInContainer);

app.Run();

static IResult CooldownResponse(HttpContext context, TimeSpan? retryAfter)
{
    if (retryAfter is { } remaining)
    {
        context.Response.Headers["Retry-After"] = Math.Max(1, (int)Math.Ceiling(remaining.TotalSeconds)).ToString();
    }

    return Results.StatusCode(StatusCodes.Status429TooManyRequests);
}

public record DecodeSeedRequest(string SeedToken);

public partial class Program { }
