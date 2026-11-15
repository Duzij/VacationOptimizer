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

        // RFC 8288 / RFC 9727 agent discovery: point bots hitting the homepage at
        // machine-readable resources via Link response headers. The values mirror the
        // nginx edge config so the headers survive regardless of hosting path.
        app.Use(async (context, next) =>
        {
            var path = context.Request.Path.Value ?? string.Empty;
            if (path == "/" || path == "/index.html" || path == "/fetch" || path == "/fetch/")
            {
                context.Response.Headers.Append("Link",
                    "</openapi/v1.json>; rel=\"service-desc\", " +
                    "</.well-known/api-catalog.json>; rel=\"api-catalog\", " +
                    "</llms.txt>; rel=\"describedby\", " +
                    "</fetch/>; rel=\"service-doc\"");
            }

            await next(context);
        });

        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UsePublicPageMetadata(app.Environment);
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

    private static IApplicationBuilder UsePublicPageMetadata(
        this IApplicationBuilder app,
        IWebHostEnvironment environment)
    {
        if (!environment.IsProduction())
        {
            return app;
        }

        var webRootPath = environment.WebRootPath
            ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var indexPath = Path.Combine(webRootPath, "dist", "index.html");
        if (!File.Exists(indexPath))
        {
            return app;
        }

        var template = File.ReadAllText(indexPath);

        return app.Use(async (context, next) =>
        {
            if (!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method))
            {
                await next(context);
                return;
            }

            var path = context.Request.Path.Value ?? "/";
            if (!PublicPageMetadataCatalog.TryGet(path, out var metadata))
            {
                await next(context);
                return;
            }

            if (path.Length > 1 && path.EndsWith('/'))
            {
                context.Response.StatusCode = StatusCodes.Status301MovedPermanently;
                context.Response.Headers.Location = $"{metadata.Path}{context.Request.QueryString}";
                return;
            }

            var html = PublicPageShellRenderer.Render(template, metadata);
            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "text/html; charset=utf-8";
            context.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";

            if (HttpMethods.IsHead(context.Request.Method))
            {
                context.Response.ContentLength = System.Text.Encoding.UTF8.GetByteCount(html);
                return;
            }

            await context.Response.WriteAsync(html);
        });
    }
}
