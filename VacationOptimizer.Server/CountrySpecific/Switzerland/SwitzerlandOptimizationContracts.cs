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

public record SwitzerlandOptimizeRequest : CountrySpecificOptimizeRequestBase
{
    public string CantonCode { get; init; } = "";
}

public record SwitzerlandOptimizationScope(
    string Type,
    string CantonCode,
    string CantonName
);
