using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class CanadaSeedData
{
    public static Country Country => new()
    {
        Id = 7,
        Name = "Canada",
        IsoCode = "CA"
    };

    public static IReadOnlyList<State> States => new[]
    {
        new State { Id = 1, Name = "Alberta", Code = "CA-AB", CountryId = Country.Id },
        new State { Id = 2, Name = "British Columbia", Code = "CA-BC", CountryId = Country.Id },
        new State { Id = 3, Name = "Manitoba", Code = "CA-MB", CountryId = Country.Id },
        new State { Id = 4, Name = "Newfoundland and Labrador", Code = "CA-NL", CountryId = Country.Id },
        new State { Id = 5, Name = "New Brunswick", Code = "CA-NB", CountryId = Country.Id },
        new State { Id = 6, Name = "Northwest Territories", Code = "CA-NT", CountryId = Country.Id },
        new State { Id = 7, Name = "Nova Scotia", Code = "CA-NS", CountryId = Country.Id },
        new State { Id = 8, Name = "Nunavut", Code = "CA-NU", CountryId = Country.Id },
        new State { Id = 9, Name = "Ontario", Code = "CA-ON", CountryId = Country.Id },
        new State { Id = 10, Name = "Prince Edward Island", Code = "CA-PE", CountryId = Country.Id },
        new State { Id = 11, Name = "Quebec", Code = "CA-QC", CountryId = Country.Id },
        new State { Id = 12, Name = "Saskatchewan", Code = "CA-SK", CountryId = Country.Id },
        new State { Id = 13, Name = "Yukon", Code = "CA-YT", CountryId = Country.Id },
    };

    public static IReadOnlyList<Holiday> Holidays => BuildHolidays();

    private static IReadOnlyList<Holiday> BuildHolidays()
    {
        var holidays = new List<Holiday>();

        AddHolidays(holidays, null,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 3, 27), "Good Friday"),
            (new DateOnly(2026, 4, 6), "Easter Monday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 6, 24), "Saint-Jean-Baptiste Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Civic Holiday"),
            (new DateOnly(2026, 9, 7), "Labour Day"),
            (new DateOnly(2026, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 1,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 2,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "BC Day"),
            (new DateOnly(2026, 9, 7), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 3,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 2, 16), "Louis Riel Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 9, 7), "Labour Day"),
            (new DateOnly(2026, 9, 30), "Orange Shirt Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 4,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 5,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 6,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 7,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 8,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 9,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 10,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 11,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 4, 6), "Easter Monday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 6, 24), "Saint-Jean-Baptiste Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 9, 7), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 12,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 3), "Labour Day"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, 13,
            (new DateOnly(2026, 1, 1), "New Year’s Day"),
            (new DateOnly(2026, 4, 3), "Good Friday"),
            (new DateOnly(2026, 5, 18), "Victoria Day"),
            (new DateOnly(2026, 6, 21), "National Indigenous Peoples Day"),
            (new DateOnly(2026, 7, 1), "Canada Day"),
            (new DateOnly(2026, 8, 17), "Discovery Day"),
            (new DateOnly(2026, 9, 7), "Labour Day"),
            (new DateOnly(2026, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2026, 10, 12), "Thanksgiving Day"),
            (new DateOnly(2026, 11, 11), "Remembrance Day"),
            (new DateOnly(2026, 12, 25), "Christmas Day"),
            (new DateOnly(2026, 12, 26), "Boxing Day"));

        AddHolidays(holidays, null,
            (new DateOnly(2027, 12, 27), "Christmas Day (Substitute Day)"),
            (new DateOnly(2027, 12, 28), "Boxing Day (Substitute Day)"));

        AddHolidays(holidays, 1,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Family Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "Heritage Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));

        AddHolidays(holidays, 2,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Family Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "British Columbia Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));
        AddHolidays(holidays, 3,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Louis Riel Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "Terry Fox Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));
        AddHolidays(holidays, 4,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 7, 1), "Memorial Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));

        AddHolidays(holidays, 5,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Family Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "New Brunswick Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));

        AddHolidays(holidays, 6,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 6, 21), "National Indigenous Peoples Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "Civic Holiday"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));
        AddHolidays(holidays, 7,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Heritage Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "Natal Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));

        AddHolidays(holidays, 8,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 7, 9), "Nunavut Day"),
            (new DateOnly(2027, 8, 2), "Civic Holiday"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));
        AddHolidays(holidays, 9,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Family Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "Civic Holiday"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));

        AddHolidays(holidays, 10,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Islander Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));

        AddHolidays(holidays, 11,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 3, 29), "Easter Monday"),
            (new DateOnly(2027, 5, 24), "National Patriots' Day"),
            (new DateOnly(2027, 6, 24), "Saint-Jean-Baptiste Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));
        AddHolidays(holidays, 12,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 2, 15), "Family Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 2), "Saskatchewan Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));
        AddHolidays(holidays, 13,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 5, 24), "Victoria Day"),
            (new DateOnly(2027, 6, 21), "National Indigenous Peoples Day"),
            (new DateOnly(2027, 7, 1), "Canada Day"),
            (new DateOnly(2027, 8, 16), "Discovery Day"),
            (new DateOnly(2027, 9, 6), "Labour Day"),
            (new DateOnly(2027, 9, 30), "National Day for Truth and Reconciliation"),
            (new DateOnly(2027, 10, 11), "Thanksgiving Day"),
            (new DateOnly(2027, 11, 11), "Remembrance Day"));
        return holidays
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

    private static void AddHolidays(
        ICollection<Holiday> holidays,
        int? stateId,
        params (DateOnly Date, string Name)[] entries)
    {
        foreach (var entry in entries)
        {
            holidays.Add(new Holiday
            {
                CountryId = Country.Id,
                StateId = stateId,
                Date = entry.Date,
                Name = entry.Name,
            });
        }
    }
}
