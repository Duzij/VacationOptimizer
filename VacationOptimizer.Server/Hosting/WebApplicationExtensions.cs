using Microsoft.AspNetCore.Http.Headers;
using Microsoft.Net.Http.Headers;

namespace VacationOptimizer.Server.Hosting;

public static class WebApplicationExtensions
{
    public static WebApplication UseVacationOptimizerHosting(
        this WebApplication app,
        bool isRunningInContainer)
    {
        app.UseForwardedHeaders();

        if (!app.Environment.IsDevelopment() || !isRunningInContainer)
        {
            app.UseHttpsRedirection();
        }

        app.UseDefaultFiles();
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
                            headers.CacheControl = new CacheControlHeaderValue
                            {
                                Public = true,
                                MaxAge = TimeSpan.FromDays(365)
                            };
                        }
                        else
                        {
                            headers.CacheControl = new CacheControlHeaderValue
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
                        headers.CacheControl = new CacheControlHeaderValue
                        {
                            NoCache = true,
                            NoStore = true,
                            MustRevalidate = true
                        };
                    }
                };
            }
        });

        return app;
    }
}
