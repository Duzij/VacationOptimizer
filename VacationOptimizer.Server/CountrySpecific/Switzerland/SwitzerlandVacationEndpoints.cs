using VacationOptimizer.Server.Models;
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
            try
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

                var result = optimizer.Optimize(new OptimizeRequest(
                    Country: "CH",
                    Year: request.Year,
                    VacationDays: request.VacationDays,
                    MinimumDaysPerRange: request.MinimumDaysPerRange,
                    MaximumDaysPerRange: request.MaximumDaysPerRange,
                    CustomFreeDays: request.CustomFreeDays,
                    State: canton.Code,
                    IgnoredHolidayDates: request.IgnoredHolidayDates,
                    UsedResultTokens: request.UsedResultTokens));

                return Results.Ok(new SwitzerlandOptimizeResult(
                    CountryCode: "CH",
                    Scope: new SwitzerlandOptimizationScope("canton", canton.Code, canton.Name),
                    Calendar: result.Calendar,
                    SelectedVacationDays: result.SelectedVacationDays,
                    Ranges: result.Ranges,
                    TotalDaysOff: result.TotalDaysOff,
                    VacationDaysUsed: result.VacationDaysUsed,
                    PublicHolidaysCount: result.PublicHolidaysCount,
                    ResultToken: result.ResultToken));
            }
            catch (OptimizationResultUnavailableException ex)
            {
                return Results.Conflict(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        });

        return api;
    }
}
