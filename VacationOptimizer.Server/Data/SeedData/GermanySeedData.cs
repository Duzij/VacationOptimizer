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
        new State { Id = 1, Name = "Baden-Württemberg", Code = "DE-BW", CountryId = Country.Id },
        new State { Id = 2, Name = "Bavaria", Code = "DE-BY", CountryId = Country.Id },
        new State { Id = 3, Name = "Berlin", Code = "DE-BE", CountryId = Country.Id },
        new State { Id = 4, Name = "Brandenburg", Code = "DE-BB", CountryId = Country.Id },
        new State { Id = 5, Name = "Bremen", Code = "DE-HB", CountryId = Country.Id },
        new State { Id = 6, Name = "Hamburg", Code = "DE-HH", CountryId = Country.Id },
        new State { Id = 7, Name = "Hesse", Code = "DE-HE", CountryId = Country.Id },
        new State { Id = 8, Name = "Mecklenburg-Western Pomerania", Code = "DE-MV", CountryId = Country.Id },
        new State { Id = 9, Name = "Lower Saxony", Code = "DE-NI", CountryId = Country.Id },
        new State { Id = 10, Name = "North Rhine-Westphalia", Code = "DE-NW", CountryId = Country.Id },
        new State { Id = 11, Name = "Rhineland-Palatinate", Code = "DE-RP", CountryId = Country.Id },
        new State { Id = 12, Name = "Saarland", Code = "DE-SL", CountryId = Country.Id },
        new State { Id = 13, Name = "Saxony", Code = "DE-SN", CountryId = Country.Id },
        new State { Id = 14, Name = "Saxony-Anhalt", Code = "DE-ST", CountryId = Country.Id },
        new State { Id = 15, Name = "Schleswig-Holstein", Code = "DE-SH", CountryId = Country.Id },
        new State { Id = 16, Name = "Thuringia", Code = "DE-TH", CountryId = Country.Id },
    };

    public static IReadOnlyList<Holiday> Holidays => BuildHolidays();

    private static IReadOnlyList<Holiday> BuildHolidays()
    {
        var holidays = new List<Holiday>();

        AddHolidays(holidays, null,
            (new DateOnly(2027, 1, 1), "New Year's Day"),
            (new DateOnly(2027, 3, 26), "Good Friday"),
            (new DateOnly(2027, 3, 29), "Easter Monday"),
            (new DateOnly(2027, 5, 1), "Labour Day"),
            (new DateOnly(2027, 5, 6), "Ascension Day"),
            (new DateOnly(2027, 5, 16), "Whit Sunday"),
            (new DateOnly(2027, 5, 17), "Whit Monday"),
            (new DateOnly(2027, 10, 3), "Day of German Unity"),
            (new DateOnly(2027, 12, 25), "Christmas Day"),
            (new DateOnly(2027, 12, 26), "Boxing Day"));

        AddHolidayForStates(holidays, new DateOnly(2027, 1, 6), "Epiphany", 1, 2, 14);
        AddHolidayForStates(holidays, new DateOnly(2027, 3, 8), "International Women's Day", 3, 8);
        AddHolidayForStates(holidays, new DateOnly(2027, 3, 28), "Easter Sunday", 4);
        AddHolidayForStates(holidays, new DateOnly(2027, 5, 27), "Corpus Christi", 1, 2, 7, 10, 11, 12, 13, 16);
        AddHolidayForStates(holidays, new DateOnly(2027, 8, 15), "Assumption Day", 2, 12);
        AddHolidayForStates(holidays, new DateOnly(2027, 9, 20), "World Children's Day", 16);
        AddHolidayForStates(holidays, new DateOnly(2027, 10, 31), "Reformation Day", 4, 5, 6, 8, 9, 13, 14, 15, 16);
        AddHolidayForStates(holidays, new DateOnly(2027, 11, 1), "All Saints' Day", 1, 2, 10, 11, 12);
        AddHolidayForStates(holidays, new DateOnly(2027, 11, 17), "Day of Prayer and Repentance", 13);

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

    private static void AddHolidayForStates(
        ICollection<Holiday> holidays,
        DateOnly date,
        string name,
        params int[] stateIds)
    {
        foreach (var stateId in stateIds)
        {
            AddHolidays(holidays, stateId, (date, name));
        }
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
