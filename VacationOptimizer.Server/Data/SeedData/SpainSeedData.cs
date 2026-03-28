using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class SpainSeedData
{
    public static Country Country => new()
    {
        Id = 5,
        Name = "Spain",
        IsoCode = "ES"
    };

    public static IReadOnlyList<State> States => new[]
    {
        new State { Id = 1, Name = "Catalonia", Code = "ES-CT", CountryId = Country.Id },
        new State { Id = 2, Name = "Community of Madrid", Code = "ES-MD", CountryId = Country.Id },
        new State { Id = 3, Name = "Barcelona", Code = "ES-CT-BCN", CountryId = Country.Id },
        new State { Id = 4, Name = "Madrid", Code = "ES-MD-MAD", CountryId = Country.Id },
    };

    public static IReadOnlyList<Holiday> Holidays => new[]
    {
        new Holiday { Id = 1, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 1, 1), Name = "New Year's Day" },
        new Holiday { Id = 2, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 1, 6), Name = "Epiphany" },
        new Holiday { Id = 3, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 4, 3), Name = "Good Friday" },
        new Holiday { Id = 4, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 5, 1), Name = "Labour Day" },
        new Holiday { Id = 5, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 8, 15), Name = "Assumption of Mary" },
        new Holiday { Id = 6, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 10, 12), Name = "National Day of Spain" },
        new Holiday { Id = 7, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 12, 8), Name = "Feast of the Immaculate Conception" },
        new Holiday { Id = 8, CountryId = Country.Id, StateId = null, Date = new DateOnly(2026, 12, 25), Name = "Christmas" },

        new Holiday { Id = 9, CountryId = Country.Id, StateId = 1, Date = new DateOnly(2026, 4, 6), Name = "Easter Monday" },
        new Holiday { Id = 10, CountryId = Country.Id, StateId = 1, Date = new DateOnly(2026, 6, 24), Name = "Sant Joan" },
        new Holiday { Id = 11, CountryId = Country.Id, StateId = 1, Date = new DateOnly(2026, 9, 11), Name = "Catalan National Day" },
        new Holiday { Id = 12, CountryId = Country.Id, StateId = 1, Date = new DateOnly(2026, 12, 26), Name = "Boxing Day" },

        new Holiday { Id = 13, CountryId = Country.Id, StateId = 3, Date = new DateOnly(2026, 5, 25), Name = "Whit Monday" },
        new Holiday { Id = 14, CountryId = Country.Id, StateId = 3, Date = new DateOnly(2026, 9, 24), Name = "Mare de Deu de la Merce" },

        new Holiday { Id = 15, CountryId = Country.Id, StateId = 2, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 16, CountryId = Country.Id, StateId = 2, Date = new DateOnly(2026, 5, 2), Name = "Madrid Regional Holiday" },
        new Holiday { Id = 17, CountryId = Country.Id, StateId = 2, Date = new DateOnly(2026, 7, 25), Name = "Saint James' Day" },
        new Holiday { Id = 18, CountryId = Country.Id, StateId = 2, Date = new DateOnly(2026, 11, 2), Name = "All Saints' Day Holiday" },
        new Holiday { Id = 19, CountryId = Country.Id, StateId = 2, Date = new DateOnly(2026, 12, 7), Name = "Constitution Day Holiday" },

        new Holiday { Id = 20, CountryId = Country.Id, StateId = 4, Date = new DateOnly(2026, 5, 15), Name = "San Isidro" },
        new Holiday { Id = 21, CountryId = Country.Id, StateId = 4, Date = new DateOnly(2026, 11, 9), Name = "Virgin of Almudena" },
    };
}
