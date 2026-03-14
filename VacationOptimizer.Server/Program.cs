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
    var states = holidayService.GetStates(countryCode);
    return states.Count == 0 ? Results.NotFound() : Results.Ok(states);
});

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

public partial class Program { }
