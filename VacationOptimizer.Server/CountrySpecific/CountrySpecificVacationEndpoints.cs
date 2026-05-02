using VacationOptimizer.Server.CountrySpecific.India;
using VacationOptimizer.Server.CountrySpecific.Spain;
using VacationOptimizer.Server.CountrySpecific.Switzerland;

namespace VacationOptimizer.Server.CountrySpecific;

public static class CountrySpecificVacationEndpoints
{
    public static readonly IReadOnlySet<string> CountryCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "IN",
        "ES",
        "CH",
    };

    public static bool RequiresCountrySpecificEndpoint(string countryCode) => CountryCodes.Contains(countryCode);

    public static string GetCountrySpecificOptimizePath(string countryCode) =>
        $"/api/vacations/countries/{countryCode.ToUpperInvariant()}/optimize";

    public static string GetCountrySpecificSchemaPath(string countryCode) =>
        $"/api/vacations/countries/{countryCode.ToUpperInvariant()}/schema";

    public static RouteGroupBuilder MapCountrySpecificVacationEndpoints(this RouteGroupBuilder api)
    {
        api.MapIndiaVacationEndpoints();
        api.MapSpainVacationEndpoints();
        api.MapSwitzerlandVacationEndpoints();

        return api;
    }
}
