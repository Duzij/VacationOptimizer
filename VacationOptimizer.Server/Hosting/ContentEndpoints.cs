namespace VacationOptimizer.Server.Hosting;

public static class ContentEndpoints
{
    private const string RobotsTxt = """
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

    private const string AdsTxt = """
google.com, pub-9485445500768000, DIRECT, f08c47fec0942fa0
""";

    public static IEndpointRouteBuilder MapContentEndpoints(this IEndpointRouteBuilder app)
    {
        var sitemapPages = new[]
        {
            new SitemapPage("/", new DateOnly(2026, 8, 4), "weekly", 1.0m),
            new SitemapPage("/about", new DateOnly(2026, 8, 4), "monthly", 0.8m),
            new SitemapPage("/contact", new DateOnly(2026, 8, 4), "monthly", 0.7m),
            new SitemapPage("/privacy", new DateOnly(2026, 8, 4), "monthly", 0.6m),
            new SitemapPage("/terms", new DateOnly(2026, 8, 4), "monthly", 0.6m),
            new SitemapPage("/app", new DateOnly(2026, 8, 4), "weekly", 0.9m),
            new SitemapPage("/blog", new DateOnly(2026, 8, 4), "weekly", 0.8m),
        };
        var sitemapXml = BuildSitemapXml(sitemapPages);

        app.MapGet("/robots.txt", () => Results.Text(RobotsTxt, "text/plain"));
        app.MapGet("/app/robots.txt", () => Results.Text(RobotsTxt, "text/plain"));
        app.MapGet("/ads.txt", () => Results.Text(AdsTxt, "text/plain"));
        app.MapGet("/app/ads.txt", () => Results.Text(AdsTxt, "text/plain"));
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

        return app;
    }

    private static string BuildSitemapXml(IEnumerable<SitemapPage> pages)
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

    private sealed record SitemapPage(string Path, DateOnly LastModified, string ChangeFrequency, decimal Priority);
}
