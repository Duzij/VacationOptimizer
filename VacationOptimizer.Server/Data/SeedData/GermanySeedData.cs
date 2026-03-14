using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class GermanySeedData
{
    public static Country Country => new()
    {
        Id = 2,
        Name = "Germany",
        IsoCode = "DE"
    };

    public static IReadOnlyList<State> States => new[]
    {
        new State
        {
            Id = 2,
            Name = "Bavaria",
            Code = "DE-BY",
            CountryId = Country.Id
        }
    };

    public static IReadOnlyList<Holiday> Holidays => new[]
    {
        new Holiday
        {
            Id = 2,
            CountryId = Country.Id,
            StateId = 2,
            Date = new DateOnly(2026, 1, 6),
            Name = "Epiphany"
        }
    };
}
