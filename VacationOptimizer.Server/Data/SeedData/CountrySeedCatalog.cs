using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class CountrySeedCatalog
{
    public static IReadOnlyList<Country> Countries => new[]
    {
        AustriaSeedData.Country,
        GermanySeedData.Country,
        UnitedStatesSeedData.Country,
        IndiaSeedData.Country
    };

    private static readonly IReadOnlyList<State> NormalizedStates = BuildStates();
    private static readonly IReadOnlyList<Holiday> NormalizedHolidays = BuildHolidays(NormalizedStates);

    public static IReadOnlyList<State> States => NormalizedStates;

    public static IReadOnlyList<Holiday> Holidays => NormalizedHolidays;

    private static IReadOnlyList<State> BuildStates()
    {
        var localStates = AustriaSeedData.States
            .Concat(GermanySeedData.States)
            .Concat(UnitedStatesSeedData.States)
            .Concat(IndiaSeedData.States)
            .ToList();

        return localStates
            .Select((state, index) => new State
            {
                Id = index + 1,
                Name = state.Name,
                Code = state.Code,
                CountryId = state.CountryId,
            })
            .ToArray();
    }

    private static IReadOnlyList<Holiday> BuildHolidays(IReadOnlyList<State> normalizedStates)
    {
        var stateIdMap = AustriaSeedData.States
            .Concat(GermanySeedData.States)
            .Concat(UnitedStatesSeedData.States)
            .Concat(IndiaSeedData.States)
            .Zip(normalizedStates, (local, normalized) => new
            {
                local.CountryId,
                LocalStateId = local.Id,
                NormalizedStateId = normalized.Id,
            })
            .ToDictionary(
                item => (item.CountryId, item.LocalStateId),
                item => item.NormalizedStateId);

        var localHolidays = AustriaSeedData.Holidays
            .Concat(GermanySeedData.Holidays)
            .Concat(UnitedStatesSeedData.Holidays)
            .Concat(IndiaSeedData.Holidays);

        return localHolidays
            .Select(holiday => new Holiday
            {
                CountryId = holiday.CountryId,
                StateId = holiday.StateId is int localStateId
                    ? stateIdMap[(holiday.CountryId, localStateId)]
                    : null,
                Date = holiday.Date,
                Name = holiday.Name,
            })
            .DistinctBy(holiday => new { holiday.CountryId, holiday.Date, holiday.StateId })
            .Select((holiday, index) => new Holiday
            {
                Id = index + 1,
                CountryId = holiday.CountryId,
                StateId = holiday.StateId,
                Date = holiday.Date,
                Name = holiday.Name,
            })
            .ToArray();
    }
}
