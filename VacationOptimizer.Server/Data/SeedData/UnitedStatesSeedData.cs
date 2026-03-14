using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class UnitedStatesSeedData
{
    public static Country Country => new()
    {
        Id = 3,
        Name = "United States",
        IsoCode = "US"
    };

    public static IReadOnlyList<State> States => new[]
    {
        new State
        {
            Id = 3,
            Name = "California",
            Code = "US-CA",
            CountryId = Country.Id
        }
    };

    public static IReadOnlyList<Holiday> Holidays => new[]
    {
        new Holiday
        {
            Id = 3,
            CountryId = Country.Id,
            StateId = null,
            Date = new DateOnly(2026, 1, 1),
            Name = "New Year's Day"
        },
        new Holiday
        {
            Id = 4,
            CountryId = Country.Id,
            StateId = 3,
            Date = new DateOnly(2026, 3, 31),
            Name = "Cesar Chavez Day"
        }
    };
}
