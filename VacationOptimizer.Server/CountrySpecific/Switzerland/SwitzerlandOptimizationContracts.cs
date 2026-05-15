using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Switzerland;

public record SwitzerlandCountrySchema(
    string CountryCode,
    string Component,
    OptimizationYearRange YearRange,
    OptimizationFormDefaults Defaults,
    bool CantonSelectionRequired,
    IReadOnlyList<OptimizationStateOption> Cantons
);

public record SwitzerlandOptimizeRequest(
    string CantonCode,
    int Year,
    int VacationDays,
    int MinimumDaysPerRange = OptimizationDefaults.MinimumDaysPerRange,
    int MaximumDaysPerRange = OptimizationDefaults.MaximumDaysPerRange,
    List<CustomFreeDay>? CustomFreeDays = null,
    List<DateOnly>? IgnoredHolidayDates = null,
    List<DateOnly>? NeverHolidayDates = null,
    List<string>? UsedResultTokens = null
);

public record SwitzerlandOptimizationScope(
    string Type,
    string CantonCode,
    string CantonName
);

public record SwitzerlandOptimizeResult(
    string CountryCode,
    SwitzerlandOptimizationScope Scope,
    CalendarData Calendar,
    List<DateOnly> SelectedVacationDays,
    List<VacationRange> Ranges,
    int TotalDaysOff,
    int VacationDaysUsed,
    int PublicHolidaysCount,
    string ResultToken
);
