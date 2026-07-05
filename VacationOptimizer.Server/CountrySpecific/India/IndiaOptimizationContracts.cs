using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.India;

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
    List<DateOnly>? NeverHolidayDates = null,
    List<string>? UsedResultTokens = null,
    List<DateOnly>? LockedVacationDates = null,
    string? SeedToken = null
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
    string ResultToken,
    string PlannerSeed
);
