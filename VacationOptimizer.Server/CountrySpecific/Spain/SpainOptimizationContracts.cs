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

public record SpainOptimizeRequest : CountrySpecificOptimizeRequestBase
{
    public string? StateCode { get; init; }
    public string? CityCode { get; init; }
}

public record SpainOptimizationScope(
    string Type,
    string? StateCode,
    string? StateName,
    string? CityCode,
    string? CityName
);
