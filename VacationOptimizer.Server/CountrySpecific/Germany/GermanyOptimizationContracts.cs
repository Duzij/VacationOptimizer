using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Germany;

public record GermanyCountrySchema(
    string CountryCode,
    string Component,
    OptimizationYearRange YearRange,
    OptimizationFormDefaults Defaults,
    bool StateSelectionRequired,
    IReadOnlyList<OptimizationStateOption> States
);

public record GermanyOptimizeRequest : CountrySpecificOptimizeRequestBase
{
    public string StateCode { get; init; } = "";
}

public record GermanyOptimizationScope(
    string Type,
    string StateCode,
    string StateName
);
