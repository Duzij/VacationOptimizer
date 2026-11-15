using System.Net;
using System.Text.RegularExpressions;

namespace VacationOptimizer.Server.Hosting;

public static class PublicPageShellRenderer
{
    private const string SiteUrl = "https://longvacation.eu";

    public static string Render(string template, PublicPageMetadata metadata)
    {
        var canonicalUrl = $"{SiteUrl}{metadata.Path}";
        var title = WebUtility.HtmlEncode(metadata.Title);
        var description = WebUtility.HtmlEncode(metadata.Description);

        var html = template;
        html = Regex.Replace(html, @"<title>[\s\S]*?</title>", $"<title>{title}</title>", RegexOptions.IgnoreCase);
        html = Regex.Replace(
            html,
            @"<meta\s+name=""description""[\s\S]*?/>",
            $"<meta name=\"description\" content=\"{description}\" />",
            RegexOptions.IgnoreCase);
        html = Regex.Replace(
            html,
            @"<link\s+rel=""canonical""[\s\S]*?/>",
            $"<link rel=\"canonical\" href=\"{canonicalUrl}\" />",
            RegexOptions.IgnoreCase);
        html = Regex.Replace(
            html,
            @"<meta\s+property=""og:url""[\s\S]*?/>",
            $"<meta property=\"og:url\" content=\"{canonicalUrl}\" />",
            RegexOptions.IgnoreCase);
        html = Regex.Replace(
            html,
            @"<meta\s+property=""og:title""[\s\S]*?/>",
            $"<meta property=\"og:title\" content=\"{title}\" />",
            RegexOptions.IgnoreCase);
        html = Regex.Replace(
            html,
            @"<meta\s+property=""og:description""[\s\S]*?/>",
            $"<meta property=\"og:description\" content=\"{description}\" />",
            RegexOptions.IgnoreCase);
        html = Regex.Replace(
            html,
            @"<meta\s+name=""twitter:title""[\s\S]*?/>",
            $"<meta name=\"twitter:title\" content=\"{title}\" />",
            RegexOptions.IgnoreCase);
        html = Regex.Replace(
            html,
            @"<meta\s+name=""twitter:description""[\s\S]*?/>",
            $"<meta name=\"twitter:description\" content=\"{description}\" />",
            RegexOptions.IgnoreCase);

        var heading = WebUtility.HtmlEncode(metadata.Heading);
        var intro = WebUtility.HtmlEncode(metadata.Intro);
        var fallbackMain = $"""
            <main style="max-width: 960px; margin: 0 auto; padding: 32px 16px 48px; font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: var(--color-text, #222)">
              <h1 style="font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.1; margin: 0 0 16px">{heading}</h1>
              <p style="max-width: 720px; font-size: 1.05rem; margin: 0 0 16px">{intro}</p>
              <p style="max-width: 720px; font-size: 1.05rem; margin: 0 0 16px">
                <a href="/app">Open the free vacation planner</a> or <a href="/blog/">browse the 2027 planning guides</a>.
              </p>
            </main>
            """;

        return Regex.Replace(html, @"<main\b[\s\S]*?</main>", fallbackMain, RegexOptions.IgnoreCase);
    }
}
