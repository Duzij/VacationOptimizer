using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Canada;

public record CanadaCountrySchema(
    string CountryCode,
    string Component,
    OptimizationYearRange YearRange,
    OptimizationFormDefaults Defaults,
    bool ProvinceSelectionRequired,
    IReadOnlyList<OptimizationStateOption> Provinces
);

public record CanadaOptimizeRequest : CountrySpecificOptimizeRequestBase
{
    public string ProvinceCode { get; init; } = "";
}

public record CanadaOptimizationScope(
    string Type,
    string ProvinceCode,
    string ProvinceName
);
