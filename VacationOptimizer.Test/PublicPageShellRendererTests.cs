using VacationOptimizer.Server.Hosting;
using Xunit;

namespace VacationOptimizer.Test;

public class PublicPageShellRendererTests
{
    private const string Template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Homepage title</title>
          <meta name="description" content="Homepage description" />
          <link rel="canonical" href="https://longvacation.eu/" />
          <meta property="og:url" content="https://longvacation.eu/" />
          <meta property="og:title" content="Homepage title" />
          <meta property="og:description" content="Homepage description" />
          <meta name="twitter:title" content="Homepage title" />
          <meta name="twitter:description" content="Homepage description" />
        </head>
        <body>
          <div id="root">
            <main><h1>Homepage fallback</h1></main>
            <footer>Static footer</footer>
          </div>
          <script type="module" src="/assets/app.js"></script>
        </body>
        </html>
        """;

    [Fact]
    public void Render_ReplacesRouteMetadataAndMainContent()
    {
        var metadata = new PublicPageMetadata(
            "/about",
            "About Long Vacation",
            "About description",
            "About heading",
            "About intro");

        var html = PublicPageShellRenderer.Render(Template, metadata);

        Assert.Contains("<title>About Long Vacation</title>", html);
        Assert.Contains("<meta name=\"description\" content=\"About description\" />", html);
        Assert.Contains("<link rel=\"canonical\" href=\"https://longvacation.eu/about\" />", html);
        Assert.Contains("<meta property=\"og:url\" content=\"https://longvacation.eu/about\" />", html);
        Assert.Contains("<meta property=\"og:title\" content=\"About Long Vacation\" />", html);
        Assert.Contains("<meta name=\"twitter:title\" content=\"About Long Vacation\" />", html);
        Assert.Contains("<h1 style=\"font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.1; margin: 0 0 16px\">About heading</h1>", html);
        Assert.Contains("About intro", html);
        Assert.Contains("<footer>Static footer</footer>", html);
        Assert.Contains("<script type=\"module\" src=\"/assets/app.js\"></script>", html);
        Assert.DoesNotContain("Homepage fallback", html);
    }

    [Theory]
    [InlineData("/app", "/app")]
    [InlineData("/app/", "/app")]
    [InlineData("/about", "/about")]
    [InlineData("/about/", "/about")]
    [InlineData("/unknown", null)]
    public void Catalog_ResolvesKnownPublicRoutes(string path, string? expectedPath)
    {
        var found = PublicPageMetadataCatalog.TryGet(path, out var metadata);

        Assert.Equal(expectedPath is not null, found);
        if (expectedPath is not null)
        {
            Assert.Equal(expectedPath, metadata.Path);
        }
    }
}
