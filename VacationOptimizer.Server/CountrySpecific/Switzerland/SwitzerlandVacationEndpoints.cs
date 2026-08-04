using VacationOptimizer.Server.Services;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Switzerland;

public static class SwitzerlandVacationEndpoints
{
    public static RouteGroupBuilder MapSwitzerlandVacationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/countries/CH/schema", (IPublicHolidayService holidayService) =>
        {
            var cantons = holidayService
                .GetStates("CH")
                .Select(canton => new OptimizationStateOption(canton.Code, canton.Name))
                .ToArray();

            return Results.Ok(new SwitzerlandCountrySchema(
                CountryCode: "CH",
                Component: "switzerland",
                YearRange: CountrySpecificSchemaDefaults.CreateYearRange(),
                Defaults: CountrySpecificSchemaDefaults.CreateDefaults(),
                CantonSelectionRequired: true,
                Cantons: cantons));
        });

        api.MapPost("/countries/CH/optimize", (SwitzerlandOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
        {
            if (string.IsNullOrWhiteSpace(request.CantonCode))
            {
                return Results.BadRequest(new { error = "Switzerland optimizations require a cantonCode." });
            }

            var canton = holidayService
                .GetStates("CH")
                .FirstOrDefault(entry => string.Equals(entry.Code, request.CantonCode, StringComparison.OrdinalIgnoreCase));

            if (canton is null)
            {
                return Results.BadRequest(new { error = $"Unsupported canton code '{request.CantonCode}' for country 'CH'." });
            }

            return CountrySpecificEndpointHelper.Optimize(
                request,
                "CH",
                canton.Code,
                new SwitzerlandOptimizationScope("canton", canton.Code, canton.Name),
                optimizer);
        });

        return api;
    }
}
