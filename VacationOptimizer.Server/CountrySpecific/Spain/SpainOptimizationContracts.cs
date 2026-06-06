using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Spain;

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
    List<DateOnly>? NeverHolidayDates = null,
    List<string>? UsedResultTokens = null,
    List<DateOnly>? LockedVacationDates = null
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
