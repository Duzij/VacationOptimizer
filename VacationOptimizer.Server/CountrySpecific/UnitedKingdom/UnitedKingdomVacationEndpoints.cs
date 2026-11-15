using VacationOptimizer.Server.Services;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.UnitedKingdom;

public static class UnitedKingdomVacationEndpoints
{
    public static RouteGroupBuilder MapUnitedKingdomVacationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/countries/GB/schema", (IPublicHolidayService holidayService) =>
        {
            var nations = holidayService
                .GetStates("GB")
                .Select(nation => new OptimizationStateOption(nation.Code, nation.Name))
                .ToArray();

            return Results.Ok(new UnitedKingdomCountrySchema(
                CountryCode: "GB",
                Component: "unitedKingdom",
                YearRange: CountrySpecificSchemaDefaults.CreateYearRange(),
                Defaults: CountrySpecificSchemaDefaults.CreateDefaults(),
                NationSelectionRequired: true,
                Nations: nations));
        });

        api.MapPost("/countries/GB/optimize", (UnitedKingdomOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
        {
            if (string.IsNullOrWhiteSpace(request.NationCode))
            {
                return Results.BadRequest(new { error = "United Kingdom optimizations require a nationCode." });
            }

            var nation = holidayService
                .GetStates("GB")
                .FirstOrDefault(entry => string.Equals(entry.Code, request.NationCode, StringComparison.OrdinalIgnoreCase));

            if (nation is null)
            {
                return Results.BadRequest(new { error = $"Unsupported nation code '{request.NationCode}' for country 'GB'." });
            }

            return CountrySpecificEndpointHelper.Optimize(
                request,
                "GB",
                nation.Code,
                new UnitedKingdomOptimizationScope("nation", nation.Code, nation.Name),
                optimizer);
        });

        return api;
    }
}
