using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;

namespace VacationOptimizer.Server.CountrySpecific;

public static class CountrySpecificEndpointHelper
{
    public static IResult Optimize<TScope>(
        CountrySpecificOptimizeRequestBase request,
        string countryCode,
        string? state,
        TScope scope,
        VacationOptimizerService optimizer)
    {
        try
        {
            var result = optimizer.Optimize(request.ToOptimizeRequest(countryCode, state));

            return Results.Ok(new CountrySpecificOptimizeResult<TScope>(
                CountryCode: countryCode,
                Scope: scope,
                Calendar: result.Calendar,
                SelectedVacationDays: result.SelectedVacationDays,
                Ranges: result.Ranges,
                TotalDaysOff: result.TotalDaysOff,
                VacationDaysUsed: result.VacationDaysUsed,
                PublicHolidaysCount: result.PublicHolidaysCount,
                ResultToken: result.ResultToken,
                PlannerSeed: result.PlannerSeed));
        }
        catch (OptimizationResultUnavailableException ex)
        {
            return Results.Conflict(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }
}
