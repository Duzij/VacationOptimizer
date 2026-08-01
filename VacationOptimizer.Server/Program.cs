using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net;
using System.Net.Sockets;
using System.IO;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.AspNetCore.HttpOverrides;
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
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Docker Compose assigns services an address from one of these private ranges. Restricting
    // forwarded-header trust to them prevents direct callers from choosing their own client IP.
    options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("10.0.0.0"), 8));
    options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("172.16.0.0"), 12));
});

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
app.UseForwardedHeaders();
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

app.MapGet("/robots.txt", () => Results.Text(robotsTxt, "text/plain"));
app.MapGet("/app/robots.txt", () => Results.Text(robotsTxt, "text/plain"));
app.MapGet("/ads.txt", () => Results.Text(adsTxt, "text/plain"));
app.MapGet("/app/ads.txt", () => Results.Text(adsTxt, "text/plain"));
app.MapGet("/sitemap.xml", () => Results.Text(sitemapXml, "application/xml"));
app.MapGet("/app/sitemap.xml", () => Results.Text(sitemapXml, "application/xml"));
app.MapGet("/api/blog", (IWebHostEnvironment environment) =>
{
    var candidatePaths = new[]
    {
        Path.Combine(environment.ContentRootPath, "wwwroot", "dist", "blog", "index.json"),
        Path.Combine(environment.ContentRootPath, "wwwroot", "public", "blog", "index.json"),
    };

    var jsonPath = candidatePaths.FirstOrDefault(File.Exists);

    if (jsonPath is null)
    {
        return Results.NotFound(new { error = "Blog index is not available." });
    }

    return Results.File(jsonPath, "application/json");
});

// SPA hosting
app.UseDefaultFiles();   // rewrites directory-style requests to look for index.html
app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.MapFallbackToFile("index.html");
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

static IResult CooldownResponse(HttpContext context, TimeSpan? retryAfter)
{
    if (retryAfter is { } remaining)
    {
        context.Response.Headers["Retry-After"] = Math.Max(1, (int)Math.Ceiling(remaining.TotalSeconds)).ToString();
    }

    return Results.StatusCode(StatusCodes.Status429TooManyRequests);
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

public record DecodeSeedRequest(string SeedToken);

public partial class Program { }
