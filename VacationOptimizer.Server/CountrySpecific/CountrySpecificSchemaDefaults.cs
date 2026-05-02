using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.CountrySpecific;

public static class CountrySpecificSchemaDefaults
{
    public static OptimizationYearRange CreateYearRange() =>
        new(OptimizationDefaults.MinimumYear, OptimizationDefaults.MaximumYear);

    public static OptimizationFormDefaults CreateDefaults() =>
        new(
            OptimizationDefaults.VacationDays,
            OptimizationDefaults.MinimumDaysPerRange,
            OptimizationDefaults.MaximumDaysPerRange);
}
