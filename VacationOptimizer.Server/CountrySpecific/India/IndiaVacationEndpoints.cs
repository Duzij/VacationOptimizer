using VacationOptimizer.Server.Models;
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
            try
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

                var result = optimizer.Optimize(new OptimizeRequest(
                    Country: "IN",
                    Year: request.Year,
                    VacationDays: request.VacationDays,
                    MinimumDaysPerRange: request.MinimumDaysPerRange,
                    MaximumDaysPerRange: request.MaximumDaysPerRange,
                    CustomFreeDays: request.CustomFreeDays,
                    State: state.Code,
                    IgnoredHolidayDates: request.IgnoredHolidayDates,
                    NeverHolidayDates: request.NeverHolidayDates,
                    UsedResultTokens: request.UsedResultTokens));

                return Results.Ok(new IndiaOptimizeResult(
                    CountryCode: "IN",
                    Scope: new IndiaOptimizationScope("state", state.Code, state.Name),
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
