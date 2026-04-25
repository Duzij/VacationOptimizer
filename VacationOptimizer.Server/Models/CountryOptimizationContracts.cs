namespace VacationOptimizer.Server.Models;

public static class OptimizationDefaults
{
    public const int VacationDays = 25;
    public const int MinimumDaysPerRange = 4;
    public const int MaximumDaysPerRange = 14;

    public static int MinimumYear => DateTime.Today.Year;
    public static int MaximumYear => DateTime.Today.Year + 5;
}

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

public record IndiaCountrySchema(
    string CountryCode,
    string Component,
    OptimizationYearRange YearRange,
    OptimizationFormDefaults Defaults,
    bool StateSelectionRequired,
    IReadOnlyList<OptimizationStateOption> States
);

public record IndiaOptimizeRequest(
    string StateCode,
    int Year,
    int VacationDays,
    int MinimumDaysPerRange = OptimizationDefaults.MinimumDaysPerRange,
    int MaximumDaysPerRange = OptimizationDefaults.MaximumDaysPerRange,
    List<CustomFreeDay>? CustomFreeDays = null,
    List<DateOnly>? IgnoredHolidayDates = null,
    List<string>? UsedResultTokens = null
);

public record IndiaOptimizationScope(
    string Type,
    string StateCode,
    string StateName
);

public record IndiaOptimizeResult(
    string CountryCode,
    IndiaOptimizationScope Scope,
    CalendarData Calendar,
    List<DateOnly> SelectedVacationDays,
    List<VacationRange> Ranges,
    int TotalDaysOff,
    int VacationDaysUsed,
    int PublicHolidaysCount,
    string ResultToken
);

public record SpainCityOption(
    string Code,
    string Name,
    string StateCode
);

public record SpainCountrySchema(
    string CountryCode,
    string Component,
    OptimizationYearRange YearRange,
    OptimizationFormDefaults Defaults,
    IReadOnlyList<OptimizationStateOption> States,
    IReadOnlyList<SpainCityOption> Cities
);

public record SpainOptimizeRequest(
    string? StateCode,
    string? CityCode,
    int Year,
    int VacationDays,
    int MinimumDaysPerRange = OptimizationDefaults.MinimumDaysPerRange,
    int MaximumDaysPerRange = OptimizationDefaults.MaximumDaysPerRange,
    List<CustomFreeDay>? CustomFreeDays = null,
    List<DateOnly>? IgnoredHolidayDates = null,
    List<string>? UsedResultTokens = null
);

public record SpainOptimizationScope(
    string Type,
    string? StateCode,
    string? StateName,
    string? CityCode,
    string? CityName
);

public record SpainOptimizeResult(
    string CountryCode,
    SpainOptimizationScope Scope,
    CalendarData Calendar,
    List<DateOnly> SelectedVacationDays,
    List<VacationRange> Ranges,
    int TotalDaysOff,
    int VacationDaysUsed,
    int PublicHolidaysCount,
    string ResultToken
);
