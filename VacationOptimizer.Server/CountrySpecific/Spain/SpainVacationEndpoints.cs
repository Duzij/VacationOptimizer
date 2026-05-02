using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;
using VacationOptimizer.Server.CountrySpecific;

namespace VacationOptimizer.Server.CountrySpecific.Spain;

public static class SpainVacationEndpoints
{
    public static RouteGroupBuilder MapSpainVacationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/countries/ES/schema", (IPublicHolidayService holidayService) =>
        {
            var allStates = holidayService.GetStates("ES");
            var states = allStates
                .Where(state => !IsSpainCityCode(state.Code))
                .Select(state => new OptimizationStateOption(state.Code, state.Name))
                .ToArray();
            var cities = allStates
                .Where(state => IsSpainCityCode(state.Code))
                .Select(state => new SpainCityOption(state.Code, state.Name, GetSpainParentStateCode(state.Code)!))
                .ToArray();

            return Results.Ok(new SpainCountrySchema(
                CountryCode: "ES",
                Component: "spain",
                YearRange: CountrySpecificSchemaDefaults.CreateYearRange(),
                Defaults: CountrySpecificSchemaDefaults.CreateDefaults(),
                States: states,
                Cities: cities));
        });

        api.MapPost("/countries/ES/optimize", (SpainOptimizeRequest request, IPublicHolidayService holidayService, VacationOptimizerService optimizer) =>
        {
            try
            {
                var availableStates = holidayService.GetStates("ES");
                var stateMap = availableStates.ToDictionary(state => state.Code, StringComparer.OrdinalIgnoreCase);

                string? normalizedStateCode = string.IsNullOrWhiteSpace(request.StateCode) ? null : request.StateCode.Trim().ToUpperInvariant();
                string? normalizedCityCode = string.IsNullOrWhiteSpace(request.CityCode) ? null : request.CityCode.Trim().ToUpperInvariant();

                if (normalizedStateCode is not null && (!stateMap.TryGetValue(normalizedStateCode, out var selectedRegion) || IsSpainCityCode(selectedRegion.Code)))
                {
                    return Results.BadRequest(new { error = $"Unsupported state code '{request.StateCode}' for country 'ES'." });
                }

                if (normalizedCityCode is not null)
                {
                    if (!stateMap.TryGetValue(normalizedCityCode, out var selectedCity) || !IsSpainCityCode(selectedCity.Code))
                    {
                        return Results.BadRequest(new { error = $"Unsupported city code '{request.CityCode}' for country 'ES'." });
                    }

                    normalizedStateCode = GetSpainParentStateCode(normalizedCityCode);
                }

                var result = optimizer.Optimize(new OptimizeRequest(
                    Country: "ES",
                    Year: request.Year,
                    VacationDays: request.VacationDays,
                    MinimumDaysPerRange: request.MinimumDaysPerRange,
                    MaximumDaysPerRange: request.MaximumDaysPerRange,
                    CustomFreeDays: request.CustomFreeDays,
                    State: normalizedCityCode ?? normalizedStateCode,
                    IgnoredHolidayDates: request.IgnoredHolidayDates,
                    UsedResultTokens: request.UsedResultTokens));

                stateMap.TryGetValue(normalizedStateCode ?? string.Empty, out var selectedState);
                stateMap.TryGetValue(normalizedCityCode ?? string.Empty, out var selectedCityResult);

                return Results.Ok(new SpainOptimizeResult(
                    CountryCode: "ES",
                    Scope: new SpainOptimizationScope(
                        Type: normalizedCityCode is not null ? "city" : normalizedStateCode is not null ? "state" : "national",
                        StateCode: normalizedStateCode,
                        StateName: selectedState?.Name,
                        CityCode: normalizedCityCode,
                        CityName: selectedCityResult?.Name),
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

    private static bool IsSpainCityCode(string code) => code is "ES-CT-BCN" or "ES-MD-MAD";

    private static string? GetSpainParentStateCode(string code) => code switch
    {
        "ES-CT-BCN" => "ES-CT",
        "ES-MD-MAD" => "ES-MD",
        _ => null,
    };
}
