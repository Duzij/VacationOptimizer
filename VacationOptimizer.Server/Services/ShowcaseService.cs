using Microsoft.Extensions.Caching.Memory;
using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Services;

public static class ShowcaseDefaults
{
    // Hardcoded showcase year for the landing page country rotation.
    public const int Year = 2026;
    public const int VacationDays = 25;
    // Mirrors the planner defaults (optimizerDefaults.ts) so the showcased
    // number matches what the planner produces out of the box.
    public const int MinimumDaysPerRange = 4;
    public const int MaximumDaysPerRange = 14;
    // Region-requiring countries get a hardcoded default region for the showcase.
    public const string DefaultIndiaStateCode = "IN-KA";
    public const string DefaultSwitzerlandCantonCode = "CH-ZH";
}

/// <summary>
/// Computes the single "overall days off" number shown on the landing page
/// showcase by running the real optimizer, caching per country/year/PTO count.
/// </summary>
public class ShowcaseService(
    VacationOptimizerService optimizer,
    IPublicHolidayService holidayService,
    IMemoryCache cache)
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);

    public int GetTotalDaysOff(string countryCode, int? year, int? vacationDays)
    {
        var normalizedCountry = countryCode.Trim().ToUpperInvariant();
        var resolvedYear = year ?? ShowcaseDefaults.Year;
        var resolvedVacationDays = vacationDays ?? ShowcaseDefaults.VacationDays;
        var state = ResolveDefaultState(normalizedCountry);

        var cacheKey = $"showcase:{normalizedCountry}:{state ?? "ALL"}:{resolvedYear}:{resolvedVacationDays}";
        return cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;

            var maxResults = optimizer.GenerateMaxAttemptResults(new OptimizeRequest(
                Country: normalizedCountry,
                Year: resolvedYear,
                VacationDays: resolvedVacationDays,
                MinimumDaysPerRange: ShowcaseDefaults.MinimumDaysPerRange,
                MaximumDaysPerRange: ShowcaseDefaults.MaximumDaysPerRange,
                State: state), [], string.Empty);

            return maxResults.OrderByDescending(r => r.TotalDaysOff).First().TotalDaysOff;
        })!;
    }

    private string? ResolveDefaultState(string countryCode) => countryCode switch
    {
        "IN" => ResolveStateOrThrow("IN", ShowcaseDefaults.DefaultIndiaStateCode),
        "CH" => ResolveStateOrThrow("CH", ShowcaseDefaults.DefaultSwitzerlandCantonCode),
        _ => null,
    };

    private string ResolveStateOrThrow(string countryCode, string stateCode)
    {
        var state = holidayService
            .GetStates(countryCode)
            .FirstOrDefault(entry => string.Equals(entry.Code, stateCode, StringComparison.OrdinalIgnoreCase));

        return state?.Code
            ?? throw new ArgumentException($"Showcase default region '{stateCode}' is not available for country '{countryCode}'.");
    }
}
