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
