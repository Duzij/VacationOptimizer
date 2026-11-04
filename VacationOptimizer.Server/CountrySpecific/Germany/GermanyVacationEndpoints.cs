using VacationOptimizer.Server.Services;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Germany;

public static class GermanyVacationEndpoints
{
    public static RouteGroupBuilder MapGermanyVacationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/countries/DE/schema", (IPublicHolidayService holidayService) =>
        {
            var states = holidayService
                .GetStates("DE")
                .Select(state => new OptimizationStateOption(state.Code, state.Name))
                .ToArray();

            return Results.Ok(new GermanyCountrySchema(
                CountryCode: "DE",
                Component: "germany",
                YearRange: CountrySpecificSchemaDefaults.CreateYearRange(),
                Defaults: CountrySpecificSchemaDefaults.CreateDefaults(),
                StateSelectionRequired: true,
                States: states));
        });

        api.MapPost("/countries/DE/optimize", (GermanyOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
        {
            if (string.IsNullOrWhiteSpace(request.StateCode))
            {
                return Results.BadRequest(new { error = "Germany optimizations require a stateCode." });
            }

            var state = holidayService
                .GetStates("DE")
                .FirstOrDefault(entry => string.Equals(entry.Code, request.StateCode, StringComparison.OrdinalIgnoreCase));

            if (state is null)
            {
                return Results.BadRequest(new { error = $"Unsupported state code '{request.StateCode}' for country 'DE'." });
            }

            return CountrySpecificEndpointHelper.Optimize(
                request,
                "DE",
                state.Code,
                new GermanyOptimizationScope("state", state.Code, state.Name),
                optimizer);
        });

        return api;
    }
}
