using VacationOptimizer.Server.Services;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.India;

public static class IndiaVacationEndpoints
{
    public static RouteGroupBuilder MapIndiaVacationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/countries/IN/schema", (IPublicHolidayService holidayService) =>
        {
            var states = holidayService
                .GetStates("IN")
                .Select(state => new OptimizationStateOption(state.Code, state.Name))
                .ToArray();

            return Results.Ok(new IndiaCountrySchema(
                CountryCode: "IN",
                Component: "india",
                YearRange: CountrySpecificSchemaDefaults.CreateYearRange(),
                Defaults: CountrySpecificSchemaDefaults.CreateDefaults(),
                StateSelectionRequired: true,
                States: states));
        });

        api.MapPost("/countries/IN/optimize", (IndiaOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
        {
            if (string.IsNullOrWhiteSpace(request.StateCode))
            {
                return Results.BadRequest(new { error = "India optimizations require a stateCode." });
            }

            var state = holidayService
                .GetStates("IN")
                .FirstOrDefault(entry => string.Equals(entry.Code, request.StateCode, StringComparison.OrdinalIgnoreCase));

            if (state is null)
            {
                return Results.BadRequest(new { error = $"Unsupported state code '{request.StateCode}' for country 'IN'." });
            }

            return CountrySpecificEndpointHelper.Optimize(
                request,
                "IN",
                state.Code,
                new IndiaOptimizationScope("state", state.Code, state.Name),
                optimizer);
        });

        return api;
    }
}
