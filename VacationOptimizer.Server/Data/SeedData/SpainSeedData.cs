using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class SpainSeedData
{
    private const int AndalusiaStateId = 1;
    private const int AragonStateId = 2;
    private const int AsturiasStateId = 3;
    private const int CanaryIslandsStateId = 4;
    private const int CantabriaStateId = 5;
    private const int CastileAndLeonStateId = 6;
    private const int CastileLaManchaStateId = 7;
    private const int CataloniaStateId = 8;
    private const int CommunityOfMadridStateId = 9;
    private const int ValencianCommunityStateId = 10;
    private const int ExtremaduraStateId = 11;
    private const int GaliciaStateId = 12;
    private const int BalearicIslandsStateId = 13;
    private const int LaRiojaStateId = 14;
    private const int RegionOfMurciaStateId = 15;
    private const int BarcelonaCityStateId = 16;
    private const int MadridCityStateId = 17;

    public static Country Country => new()
    {
        Id = 5,
        Name = "Spain",
        IsoCode = "ES"
    };

    public static IReadOnlyList<State> States => new[]
    {
        new State { Id = AndalusiaStateId, Name = "Andalusia", Code = "ES-AN", CountryId = Country.Id },
        new State { Id = AragonStateId, Name = "Aragon", Code = "ES-AR", CountryId = Country.Id },
        new State { Id = AsturiasStateId, Name = "Asturias", Code = "ES-AS", CountryId = Country.Id },
        new State { Id = CanaryIslandsStateId, Name = "Canary Islands", Code = "ES-CN", CountryId = Country.Id },
        new State { Id = CantabriaStateId, Name = "Cantabria", Code = "ES-CB", CountryId = Country.Id },
        new State { Id = CastileAndLeonStateId, Name = "Castile and Leon", Code = "ES-CL", CountryId = Country.Id },
        new State { Id = CastileLaManchaStateId, Name = "Castilla-La Mancha", Code = "ES-CM", CountryId = Country.Id },
        new State { Id = CataloniaStateId, Name = "Catalonia", Code = "ES-CT", CountryId = Country.Id },
        new State { Id = CommunityOfMadridStateId, Name = "Community of Madrid", Code = "ES-MD", CountryId = Country.Id },
        new State { Id = ValencianCommunityStateId, Name = "Valencian Community", Code = "ES-VC", CountryId = Country.Id },
        new State { Id = ExtremaduraStateId, Name = "Extremadura", Code = "ES-EX", CountryId = Country.Id },
        new State { Id = GaliciaStateId, Name = "Galicia", Code = "ES-GA", CountryId = Country.Id },
        new State { Id = BalearicIslandsStateId, Name = "Balearic Islands", Code = "ES-IB", CountryId = Country.Id },
        new State { Id = LaRiojaStateId, Name = "La Rioja", Code = "ES-RI", CountryId = Country.Id },
        new State { Id = RegionOfMurciaStateId, Name = "Region of Murcia", Code = "ES-MC", CountryId = Country.Id },
        new State { Id = BarcelonaCityStateId, Name = "Barcelona", Code = "ES-CT-BCN", CountryId = Country.Id },
        new State { Id = MadridCityStateId, Name = "Madrid", Code = "ES-MD-MAD", CountryId = Country.Id },
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

        new Holiday { Id = 9, CountryId = Country.Id, StateId = AndalusiaStateId, Date = new DateOnly(2026, 2, 28), Name = "Andalusia Day" },
        new Holiday { Id = 10, CountryId = Country.Id, StateId = AndalusiaStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },

        new Holiday { Id = 11, CountryId = Country.Id, StateId = AragonStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 12, CountryId = Country.Id, StateId = AragonStateId, Date = new DateOnly(2026, 4, 23), Name = "Aragon Day" },

        new Holiday { Id = 13, CountryId = Country.Id, StateId = AsturiasStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 14, CountryId = Country.Id, StateId = AsturiasStateId, Date = new DateOnly(2026, 9, 8), Name = "Asturias Day" },

        new Holiday { Id = 15, CountryId = Country.Id, StateId = CanaryIslandsStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 16, CountryId = Country.Id, StateId = CanaryIslandsStateId, Date = new DateOnly(2026, 5, 30), Name = "Canary Islands Day" },

        new Holiday { Id = 17, CountryId = Country.Id, StateId = CantabriaStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 18, CountryId = Country.Id, StateId = CantabriaStateId, Date = new DateOnly(2026, 7, 28), Name = "Cantabria Institutions Day" },
        new Holiday { Id = 19, CountryId = Country.Id, StateId = CantabriaStateId, Date = new DateOnly(2026, 9, 15), Name = "Our Lady of La Bien Aparecida" },

        new Holiday { Id = 20, CountryId = Country.Id, StateId = CastileAndLeonStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 21, CountryId = Country.Id, StateId = CastileAndLeonStateId, Date = new DateOnly(2026, 4, 23), Name = "Castile and Leon Day" },

        new Holiday { Id = 22, CountryId = Country.Id, StateId = CastileLaManchaStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 23, CountryId = Country.Id, StateId = CastileLaManchaStateId, Date = new DateOnly(2026, 4, 6), Name = "Substitute Holiday for St Joseph's Day" },
        new Holiday { Id = 24, CountryId = Country.Id, StateId = CastileLaManchaStateId, Date = new DateOnly(2026, 5, 31), Name = "Castilla-La Mancha Day" },
        new Holiday { Id = 25, CountryId = Country.Id, StateId = CastileLaManchaStateId, Date = new DateOnly(2026, 6, 4), Name = "Corpus Christi" },

        new Holiday { Id = 26, CountryId = Country.Id, StateId = CataloniaStateId, Date = new DateOnly(2026, 4, 6), Name = "Easter Monday" },
        new Holiday { Id = 27, CountryId = Country.Id, StateId = CataloniaStateId, Date = new DateOnly(2026, 6, 24), Name = "Sant Joan" },
        new Holiday { Id = 28, CountryId = Country.Id, StateId = CataloniaStateId, Date = new DateOnly(2026, 9, 11), Name = "Catalan National Day" },
        new Holiday { Id = 29, CountryId = Country.Id, StateId = CataloniaStateId, Date = new DateOnly(2026, 12, 26), Name = "St Stephen's Day" },

        new Holiday { Id = 30, CountryId = Country.Id, StateId = CommunityOfMadridStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 31, CountryId = Country.Id, StateId = CommunityOfMadridStateId, Date = new DateOnly(2026, 5, 2), Name = "Community of Madrid Day" },
        new Holiday { Id = 32, CountryId = Country.Id, StateId = CommunityOfMadridStateId, Date = new DateOnly(2026, 7, 25), Name = "Saint James' Day" },
        new Holiday { Id = 33, CountryId = Country.Id, StateId = CommunityOfMadridStateId, Date = new DateOnly(2026, 11, 2), Name = "All Saints' Day Holiday" },
        new Holiday { Id = 34, CountryId = Country.Id, StateId = CommunityOfMadridStateId, Date = new DateOnly(2026, 12, 7), Name = "Constitution Day Holiday" },

        new Holiday { Id = 35, CountryId = Country.Id, StateId = ValencianCommunityStateId, Date = new DateOnly(2026, 3, 19), Name = "St Joseph's Day" },
        new Holiday { Id = 36, CountryId = Country.Id, StateId = ValencianCommunityStateId, Date = new DateOnly(2026, 4, 6), Name = "Easter Monday" },
        new Holiday { Id = 37, CountryId = Country.Id, StateId = ValencianCommunityStateId, Date = new DateOnly(2026, 6, 24), Name = "St John's Day" },
        new Holiday { Id = 38, CountryId = Country.Id, StateId = ValencianCommunityStateId, Date = new DateOnly(2026, 10, 9), Name = "Day of the Valencian Community" },

        new Holiday { Id = 39, CountryId = Country.Id, StateId = ExtremaduraStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 40, CountryId = Country.Id, StateId = ExtremaduraStateId, Date = new DateOnly(2026, 9, 8), Name = "Extremadura Day" },

        new Holiday { Id = 41, CountryId = Country.Id, StateId = GaliciaStateId, Date = new DateOnly(2026, 3, 19), Name = "St Joseph's Day" },
        new Holiday { Id = 42, CountryId = Country.Id, StateId = GaliciaStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 43, CountryId = Country.Id, StateId = GaliciaStateId, Date = new DateOnly(2026, 6, 24), Name = "St John's Day" },
        new Holiday { Id = 44, CountryId = Country.Id, StateId = GaliciaStateId, Date = new DateOnly(2026, 7, 25), Name = "National Day of Galicia" },

        new Holiday { Id = 45, CountryId = Country.Id, StateId = BalearicIslandsStateId, Date = new DateOnly(2026, 3, 2), Name = "Day of the Balearic Islands" },
        new Holiday { Id = 46, CountryId = Country.Id, StateId = BalearicIslandsStateId, Date = new DateOnly(2026, 4, 2), Name = "Maundy Thursday" },
        new Holiday { Id = 47, CountryId = Country.Id, StateId = BalearicIslandsStateId, Date = new DateOnly(2026, 4, 6), Name = "Easter Monday" },
        new Holiday { Id = 48, CountryId = Country.Id, StateId = BalearicIslandsStateId, Date = new DateOnly(2026, 12, 26), Name = "St Stephen's Day" },

        new Holiday { Id = 49, CountryId = Country.Id, StateId = LaRiojaStateId, Date = new DateOnly(2026, 6, 9), Name = "La Rioja Day" },

        new Holiday { Id = 50, CountryId = Country.Id, StateId = RegionOfMurciaStateId, Date = new DateOnly(2026, 3, 19), Name = "St Joseph's Day" },
        new Holiday { Id = 51, CountryId = Country.Id, StateId = RegionOfMurciaStateId, Date = new DateOnly(2026, 6, 9), Name = "Day of the Region of Murcia" },

        new Holiday { Id = 52, CountryId = Country.Id, StateId = BarcelonaCityStateId, Date = new DateOnly(2026, 5, 25), Name = "Whit Monday" },
        new Holiday { Id = 53, CountryId = Country.Id, StateId = BarcelonaCityStateId, Date = new DateOnly(2026, 9, 24), Name = "La Merce" },

        new Holiday { Id = 54, CountryId = Country.Id, StateId = MadridCityStateId, Date = new DateOnly(2026, 5, 15), Name = "San Isidro" },
        new Holiday { Id = 55, CountryId = Country.Id, StateId = MadridCityStateId, Date = new DateOnly(2026, 11, 9), Name = "Virgin of Almudena" },
    };
}
