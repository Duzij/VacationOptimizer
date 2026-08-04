using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.CountrySpecific;

public record OptimizationYearRange(
    int Min,
    int Max
);

public record OptimizationFormDefaults(
    int VacationDays,
    int MinimumDaysPerRange,
    int MaximumDaysPerRange
);

public record OptimizationStateOption(
    string Code,
    string Name
);

public record CountrySpecificOptimizeRequestBase
{
    public int Year { get; init; }
    public int VacationDays { get; init; }
    public int MinimumDaysPerRange { get; init; } = OptimizationDefaults.MinimumDaysPerRange;
    public int MaximumDaysPerRange { get; init; } = OptimizationDefaults.MaximumDaysPerRange;
    public Dictionary<string, int>? MaxNumberOfVacationsPerMonth { get; init; }
    public List<CustomFreeDay>? CustomFreeDays { get; init; }
    public List<DateOnly>? IgnoredHolidayDates { get; init; }
    public List<DateOnly>? NeverHolidayDates { get; init; }
    public List<string>? UsedResultTokens { get; init; }
    public List<DateOnly>? LockedVacationDates { get; init; }
    public string? SeedToken { get; init; }

    public OptimizeRequest ToOptimizeRequest(string country, string? state)
    {
        var monthlyLimits = MaxNumberOfVacationsPerMonth is null
            ? null
            : MaxNumberOfVacationsPerMonth.ToDictionary(
                entry => Enum.Parse<Month>(entry.Key, ignoreCase: true),
                entry => entry.Value);

        return new OptimizeRequest(
            Country: country,
            Year: Year,
            VacationDays: VacationDays,
            MinimumDaysPerRange: MinimumDaysPerRange,
            MaximumDaysPerRange: MaximumDaysPerRange,
            MaxNumberOfVacationsPerMonth: monthlyLimits,
            CustomFreeDays: CustomFreeDays,
            State: state,
            IgnoredHolidayDates: IgnoredHolidayDates,
            NeverHolidayDates: NeverHolidayDates,
            UsedResultTokens: UsedResultTokens,
            LockedVacationDates: LockedVacationDates,
            SeedToken: SeedToken);
    }
}

public record CountrySpecificOptimizeResult<TScope>(
    string CountryCode,
    TScope Scope,
    CalendarData Calendar,
    List<DateOnly> SelectedVacationDays,
    List<VacationRange> Ranges,
    int TotalDaysOff,
    int VacationDaysUsed,
    int PublicHolidaysCount,
    string ResultToken,
    string PlannerSeed
);
