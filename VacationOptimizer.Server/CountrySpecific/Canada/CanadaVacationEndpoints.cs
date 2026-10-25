using VacationOptimizer.Server.Services;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Canada;

public static class CanadaVacationEndpoints
{
    public static RouteGroupBuilder MapCanadaVacationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/countries/CA/schema", (IPublicHolidayService holidayService) =>
        {
            var provinces = holidayService
                .GetStates("CA")
                .Select(province => new OptimizationStateOption(province.Code, province.Name))
                .ToArray();

            return Results.Ok(new CanadaCountrySchema(
                CountryCode: "CA",
                Component: "canada",
                YearRange: CountrySpecificSchemaDefaults.CreateYearRange(),
                Defaults: CountrySpecificSchemaDefaults.CreateDefaults(),
                ProvinceSelectionRequired: true,
                Provinces: provinces));
        });

        api.MapPost("/countries/CA/optimize", (CanadaOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
        {
            if (string.IsNullOrWhiteSpace(request.ProvinceCode))
            {
                return Results.BadRequest(new { error = "Canada optimizations require a provinceCode." });
            }

            var province = holidayService
                .GetStates("CA")
                .FirstOrDefault(entry => string.Equals(entry.Code, request.ProvinceCode, StringComparison.OrdinalIgnoreCase));

            if (province is null)
            {
                return Results.BadRequest(new { error = $"Unsupported province code '{request.ProvinceCode}' for country 'CA'." });
            }

            return CountrySpecificEndpointHelper.Optimize(
                request,
                "CA",
                province.Code,
                new CanadaOptimizationScope("province", province.Code, province.Name),
                optimizer);
        });

        return api;
    }
}
