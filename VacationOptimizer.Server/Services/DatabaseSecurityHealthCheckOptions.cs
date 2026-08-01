namespace VacationOptimizer.Server.Services;

public sealed class DatabaseSecurityHealthCheckOptions
{
    public const string SectionName = "DatabaseSecurityHealthCheck";

    // This must be a UUID supplied through configuration; do not add a default value here.
    public string? AccessToken { get; set; }

    public string[] ExpectedLoginRoles { get; set; } = ["postgres"];

    public int MaximumInvalidAttempts { get; set; } = 3;

    public int AccessCooldownMinutes { get; set; } = 15;
}
