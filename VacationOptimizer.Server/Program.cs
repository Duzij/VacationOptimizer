using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Sockets;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.Extensions.Caching.Memory;
using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;
using VacationOptimizer.Server.CountrySpecific;
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
var sitemapPages = new[]
{
    new SitemapPage("/", new DateOnly(2026, 4, 6), "weekly", 1.0m),
    new SitemapPage("/about", new DateOnly(2026, 4, 6), "monthly", 0.8m),
    new SitemapPage("/contact", new DateOnly(2026, 4, 6), "monthly", 0.7m),
    new SitemapPage("/privacy", new DateOnly(2026, 4, 6), "monthly", 0.6m),
    new SitemapPage("/terms", new DateOnly(2026, 4, 6), "monthly", 0.6m),
    new SitemapPage("/app", new DateOnly(2026, 4, 6), "weekly", 0.9m),
};

const string robotsTxt = """
User-agent: *
Allow: /
Allow: /app/
Allow: /manifest.json
Allow: /icons/
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /sitemap.xml

Sitemap: https://longvacation.eu/sitemap.xml
""";
const string adsTxt = """
google.com, pub-9485445500768000, DIRECT, f08c47fec0942fa0
""";
var sitemapXml = BuildSitemapXml(sitemapPages);

// Run migrations automatically on startup if not testing
// if (!app.Environment.IsEnvironment("Testing"))
// {
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
                db.Database.EnsureCreated();
            }

            break;
        }
        catch (Exception ex) when (attempt < maxAttempts && IsTransientDbStartupException(ex))
        {
            app.Logger.LogWarning(ex, "Database is not ready yet (attempt {Attempt}/{MaxAttempts}). Retrying in {DelaySeconds}s.", attempt, maxAttempts, delay.TotalSeconds);
            Thread.Sleep(delay);
        }
    }
// }

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

api.MapGet("/countries", (IPublicHolidayService holidayService) =>
{
    return holidayService.GetCountries();
});

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

api.MapGet("/detected-country", (IDetectCountryService detectCountryService) =>
{
    return detectCountryService.DetectCountry();
});

app.MapGet("/robots.txt", () => Results.Text(robotsTxt, "text/plain"));
app.MapGet("/app/robots.txt", () => Results.Text(robotsTxt, "text/plain"));
app.MapGet("/ads.txt", () => Results.Text(adsTxt, "text/plain"));
app.MapGet("/app/ads.txt", () => Results.Text(adsTxt, "text/plain"));
app.MapGet("/sitemap.xml", () => Results.Text(sitemapXml, "application/xml"));
app.MapGet("/app/sitemap.xml", () => Results.Text(sitemapXml, "application/xml"));

// SPA hosting
app.UseStaticFiles();
app.UseRouting();

app.UseSpa(spa =>
{
    if (app.Environment.IsProduction())
    {
        app.UseSpaStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = ctx =>
            {
                ResponseHeaders headers = ctx.Context.Response.GetTypedHeaders();
                if (ctx.Context.Request.Path.Value?.StartsWith("/assets/", StringComparison.OrdinalIgnoreCase) == true)
                {
                    headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromDays(365)
                    };
                }
                else
                {
                    headers.CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromHours(1)
                    };
                }
            }
        });
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

static string BuildSitemapXml(IEnumerable<SitemapPage> pages)
{
    var entries = string.Join(Environment.NewLine, pages.Select(page => $"""
  <url>
    <loc>https://longvacation.eu{page.Path}/</loc>
    <lastmod>{page.LastModified:yyyy-MM-dd}</lastmod>
    <changefreq>{page.ChangeFrequency}</changefreq>
    <priority>{page.Priority:0.0}</priority>
  </url>
""".Replace($"{page.Path}//", $"{page.Path}/").Replace("https://longvacation.eu//", "https://longvacation.eu/")));

    return $$"""
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{{entries}}
</urlset>
""";
}

public sealed record SitemapPage(string Path, DateOnly LastModified, string ChangeFrequency, decimal Priority);

public partial class Program { }
