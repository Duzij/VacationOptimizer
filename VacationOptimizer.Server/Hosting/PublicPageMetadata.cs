namespace VacationOptimizer.Server.Hosting;

public sealed record PublicPageMetadata(
    string Path,
    string Title,
    string Description,
    string Heading,
    string Intro);

public static class PublicPageMetadataCatalog
{
    private static readonly IReadOnlyDictionary<string, PublicPageMetadata> Pages =
        new Dictionary<string, PublicPageMetadata>(StringComparer.OrdinalIgnoreCase)
        {
            ["/app"] = new(
                "/app",
                "PTO Planner & Time Off Planner | Long Vacation",
                "Use this free holiday optimizer to compare vacation-day scenarios around public holidays, weekends, and custom free days.",
                "Vacation planner",
                "Enter your country and vacation-day rules, then generate ranked suggestions for longer breaks around public holidays, weekends, and custom free days."),
            ["/about"] = new(
                "/about",
                "About Long Vacation - Vacation Optimizer",
                "Learn what Long Vacation - Vacation Optimizer is, who it helps, and how it combines public guidance with an interactive vacation-day planning tool.",
                "About Long Vacation - Vacation Optimizer",
                "Long Vacation is a vacation planning site built to help people use vacation days more deliberately by comparing breaks around public holidays, weekends, and local calendar rules."),
            ["/contact"] = new(
                "/contact",
                "Contact Long Vacation - Vacation Optimizer",
                "Use the same feedback channel as the planner to report product issues, data corrections, accessibility concerns, or feature requests.",
                "Contact Long Vacation - Vacation Optimizer",
                "Use this page to report product issues, holiday-data corrections, planner feedback, or questions about how the site works."),
            ["/privacy"] = new(
                "/privacy",
                "Privacy Policy | Long Vacation - Vacation Optimizer",
                "Read how Long Vacation - Vacation Optimizer uses browser storage, PostHog analytics, cookies, and consent choices.",
                "Privacy Policy",
                "This page explains what browser data the planner stores, what infrastructure providers may process visitor traffic, and how users can remove locally stored planner data."),
            ["/terms"] = new(
                "/terms",
                "Terms of Use | Long Vacation - Vacation Optimizer",
                "Read the Long Vacation - Vacation Optimizer terms overview, including informational use, holiday data limitations, and user responsibility.",
                "Terms of Use",
                "Long Vacation - Vacation Optimizer provides informational planning support. Users remain responsible for verifying holiday accuracy, employer policy, and final travel or leave decisions."),
        };

    public static bool TryGet(string path, out PublicPageMetadata metadata)
    {
        var normalizedPath = path.Length > 1 ? path.TrimEnd('/') : path;
        return Pages.TryGetValue(normalizedPath, out metadata!);
    }
}
