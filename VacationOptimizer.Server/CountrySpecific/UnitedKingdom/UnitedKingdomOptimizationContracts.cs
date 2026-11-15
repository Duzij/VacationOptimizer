using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.UnitedKingdom;

public record UnitedKingdomCountrySchema(
    string CountryCode,
    string Component,
    OptimizationYearRange YearRange,
    OptimizationFormDefaults Defaults,
    bool NationSelectionRequired,
    IReadOnlyList<OptimizationStateOption> Nations
);

public record UnitedKingdomOptimizeRequest : CountrySpecificOptimizeRequestBase
{
    public string NationCode { get; init; } = "";
}

public record UnitedKingdomOptimizationScope(
    string Type,
    string NationCode,
    string NationName
);
