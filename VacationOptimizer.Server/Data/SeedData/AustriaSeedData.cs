using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class AustriaSeedData
{
    public static Country Country => new()
    {
        Id = 1,
        Name = "Austria",
        IsoCode = "AT"
    };

    public static IReadOnlyList<State> States => new[]
    {
        new State
        {
            Id = 1,
            Name = "Vienna",
            Code = "AT-9",
            CountryId = Country.Id
        }
    };

    public static IReadOnlyList<Holiday> Holidays => new[]
    {
        new Holiday
        {
            Id = 1,
            CountryId = Country.Id,
            StateId = null,
            Date = new DateOnly(2026, 1, 1),
            Name = "New Year's Day"
        }
    };
}
