using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class IndonesiaSeedData
{
    public static Country Country => new()
    {
        Id = 6,
        Name = "Indonesia",
        IsoCode = "ID"
    };

    // Indonesia's collective leave is announced annually. Add the 2027 dates here once announced.
    private static readonly HashSet<DateOnly> CollectiveLeaveDates =
    [
        new(2026, 2, 16),
        new(2026, 3, 18),
        new(2026, 3, 20),
        new(2026, 3, 23),
        new(2026, 3, 24),
        new(2026, 5, 15),
        new(2026, 5, 28),
        new(2026, 12, 24),
    ];

    public static IReadOnlyList<State> States => [];

    public static IReadOnlyList<Holiday> Holidays =>
    [
        new() { Id = 1, CountryId = Country.Id, Date = new DateOnly(2026, 1, 1), Name = "New Year's Day" },
        new() { Id = 2, CountryId = Country.Id, Date = new DateOnly(2026, 1, 16), Name = "Isra Miraj" },
        new() { Id = 3, CountryId = Country.Id, Date = new DateOnly(2026, 2, 16), Name = "Imlek Holiday" },
        new() { Id = 4, CountryId = Country.Id, Date = new DateOnly(2026, 2, 17), Name = "Imlek" },
        new() { Id = 5, CountryId = Country.Id, Date = new DateOnly(2026, 3, 18), Name = "Hari Raya Nyepi Holiday" },
        new() { Id = 6, CountryId = Country.Id, Date = new DateOnly(2026, 3, 19), Name = "Hari Raya Nyepi" },
        new() { Id = 7, CountryId = Country.Id, Date = new DateOnly(2026, 3, 20), Name = "Hari Raya Puasa Holiday" },
        new() { Id = 8, CountryId = Country.Id, Date = new DateOnly(2026, 3, 21), Name = "Hari Raya Puasa" },
        new() { Id = 9, CountryId = Country.Id, Date = new DateOnly(2026, 3, 22), Name = "Hari Raya Puasa Holiday" },
        new() { Id = 10, CountryId = Country.Id, Date = new DateOnly(2026, 3, 23), Name = "Hari Raya Puasa Holiday" },
        new() { Id = 11, CountryId = Country.Id, Date = new DateOnly(2026, 3, 24), Name = "Hari Raya Puasa Holiday" },
        new() { Id = 12, CountryId = Country.Id, Date = new DateOnly(2026, 4, 3), Name = "Good Friday" },
        new() { Id = 13, CountryId = Country.Id, Date = new DateOnly(2026, 4, 5), Name = "Easter Day" },
        new() { Id = 14, CountryId = Country.Id, Date = new DateOnly(2026, 5, 1), Name = "Labour Day" },
        new() { Id = 15, CountryId = Country.Id, Date = new DateOnly(2026, 5, 14), Name = "Ascension Day" },
        new() { Id = 16, CountryId = Country.Id, Date = new DateOnly(2026, 5, 15), Name = "Ascension Day Holiday" },
        new() { Id = 17, CountryId = Country.Id, Date = new DateOnly(2026, 5, 27), Name = "Idul Adha" },
        new() { Id = 18, CountryId = Country.Id, Date = new DateOnly(2026, 5, 28), Name = "Idul Adha Holiday" },
        new() { Id = 19, CountryId = Country.Id, Date = new DateOnly(2026, 5, 31), Name = "Waisak Day" },
        new() { Id = 20, CountryId = Country.Id, Date = new DateOnly(2026, 6, 1), Name = "Pancasila Day" },
        new() { Id = 21, CountryId = Country.Id, Date = new DateOnly(2026, 6, 16), Name = "Muharram" },
        new() { Id = 22, CountryId = Country.Id, Date = new DateOnly(2026, 8, 17), Name = "Independence Day" },
        new() { Id = 23, CountryId = Country.Id, Date = new DateOnly(2026, 8, 25), Name = "Maulidur Rasul" },
        new() { Id = 24, CountryId = Country.Id, Date = new DateOnly(2026, 12, 24), Name = "Christmas Holiday" },
        new() { Id = 25, CountryId = Country.Id, Date = new DateOnly(2026, 12, 25), Name = "Christmas Day" },

        new() { Id = 26, CountryId = Country.Id, Date = new DateOnly(2027, 1, 1), Name = "New Year's Day" },
        new() { Id = 27, CountryId = Country.Id, Date = new DateOnly(2027, 1, 5), Name = "Isra Miraj" },
        new() { Id = 28, CountryId = Country.Id, Date = new DateOnly(2027, 2, 6), Name = "Imlek" },
        new() { Id = 29, CountryId = Country.Id, Date = new DateOnly(2027, 3, 9), Name = "Hari Raya Nyepi / Hari Raya Puasa" },
        new() { Id = 30, CountryId = Country.Id, Date = new DateOnly(2027, 3, 10), Name = "Hari Raya Puasa Holiday" },
        new() { Id = 31, CountryId = Country.Id, Date = new DateOnly(2027, 3, 26), Name = "Good Friday" },
        new() { Id = 32, CountryId = Country.Id, Date = new DateOnly(2027, 3, 28), Name = "Easter Day" },
        new() { Id = 33, CountryId = Country.Id, Date = new DateOnly(2027, 5, 1), Name = "Labour Day" },
        new() { Id = 34, CountryId = Country.Id, Date = new DateOnly(2027, 5, 6), Name = "Ascension Day" },
        new() { Id = 35, CountryId = Country.Id, Date = new DateOnly(2027, 5, 16), Name = "Idul Adha" },
        new() { Id = 36, CountryId = Country.Id, Date = new DateOnly(2027, 5, 20), Name = "Waisak Day" },
        new() { Id = 37, CountryId = Country.Id, Date = new DateOnly(2027, 6, 1), Name = "Pancasila Day" },
        new() { Id = 38, CountryId = Country.Id, Date = new DateOnly(2027, 6, 6), Name = "Muharram" },
        new() { Id = 39, CountryId = Country.Id, Date = new DateOnly(2027, 8, 15), Name = "Maulidur Rasul" },
        new() { Id = 40, CountryId = Country.Id, Date = new DateOnly(2027, 8, 17), Name = "Independence Day" },
        new() { Id = 41, CountryId = Country.Id, Date = new DateOnly(2027, 12, 25), Name = "Christmas Day / Isra Miraj" },
    ];

    public static DayType GetDayType(DateOnly date) =>
        CollectiveLeaveDates.Contains(date) ? DayType.CollectiveLeave : DayType.PublicHoliday;
}
