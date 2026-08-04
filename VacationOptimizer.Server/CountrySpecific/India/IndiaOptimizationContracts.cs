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

public record IndiaOptimizeRequest : CountrySpecificOptimizeRequestBase
{
    public string StateCode { get; init; } = "";
}

public record IndiaOptimizationScope(
    string Type,
    string StateCode,
    string StateName
);
