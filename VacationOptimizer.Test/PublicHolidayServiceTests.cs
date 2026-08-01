using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Data.SeedData;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;
using Xunit;

namespace VacationOptimizer.Test;

public class PublicHolidayServiceTests
{
    private readonly IPublicHolidayService _holidayService;

    private const string DefaultCountry = "ES";
    private readonly int DefaultYear = DateTime.Now.Year + 1;

    public PublicHolidayServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .UseVacationOptimizerSeeding()
            .Options;
        var dbContext = new AppDbContext(options);
        dbContext.Database.EnsureCreated();

        _holidayService = new PublicHolidayService(dbContext);
    }

    [Fact]
    public void SupportedCountries_ReturnsNonEmptyList()
    {
        var countries = _holidayService.GetSupportedCountries();
        Assert.NotEmpty(countries);
        Assert.Contains("ES", countries);
        Assert.Contains("DE", countries);
        Assert.Contains("US", countries);
        Assert.Contains("ID", countries);
    }

    [Fact]
    public void GetHolidays_Spain2026_ReturnsHolidays()
    {
        var holidays = _holidayService.GetHolidays(DefaultCountry, DefaultYear);
        Assert.NotEmpty(holidays);

        // New Year's Day should always be there
        Assert.Contains(holidays, h => h.Date == new DateOnly(DefaultYear, 1, 1));
    }

    [Fact]
    public void GetHolidays_InvalidCountry_Throws()
    {
        Assert.Throws<ArgumentException>(() => _holidayService.GetHolidays("XX", DefaultYear));
    }

    [Fact]
    public void GetStates_India_ReturnsSeededState()
    {
        var states = _holidayService.GetStates("IN");

        Assert.Contains(states, s => s.Code == "IN-KA" && s.Name == "Karnātaka");
    }

    [Fact]
    public void GetStates_Switzerland_ReturnsPackageBackedCantons()
    {
        var states = _holidayService.GetStates("CH");

        Assert.Contains(states, s => s.Code == "CH-ZH" && s.Name == "Zurich");
        Assert.Contains(states, s => s.Code == "CH-GE" && s.Name == "Geneva");
    }

    [Fact]
    public void GetHolidays_SwitzerlandWithCanton_ReturnsCantonHolidays()
    {
        var holidays = _holidayService.GetHolidays("CH", 2026, "CH-ZH");

        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 1, 1));
        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 4, 6));
    }

    [Fact]
    public void GetHolidays_IndiaWithoutState_ReturnsNormalizedNationalHolidays()
    {
        var holidays = _holidayService.GetHolidays("IN", 2026);

        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 1, 26) && h.Name == "Republic Day (National)");
        Assert.DoesNotContain(holidays, h => h.Date == new DateOnly(2026, 1, 14) && h.Name == "Pongal");
    }

    [Fact]
    public void GetHolidays_IndiaWithState_ReturnsNationalAndStateScopedHolidays()
    {
        var andhraPradesh = CountrySeedCatalog.States.First(state => state.Code == "IN-AP");

        var holidays = _holidayService.GetHolidays("IN", 2026, andhraPradesh.Code);

        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 1, 26) && h.Name == "Republic Day (National)");
        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 1, 14) && h.Name == "Pongal");
    }

    [Fact]
    public void GetHolidays_SpainWithRegion_ReturnsNationalAndRegionalHolidays()
    {
        var holidays = _holidayService.GetHolidays("ES", 2026, "ES-GA");

        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 1, 1) && h.Name == "New Year's Day");
        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 3, 19) && h.Name == "St Joseph's Day");
        Assert.Contains(holidays, h => h.Date == new DateOnly(2026, 7, 25) && h.Name == "National Day of Galicia");
    }

    [Fact]
    public void GetHolidays_Indonesia_ReturnsCountryHolidaysAndCollectiveLeaveDays()
    {
        var holidays = _holidayService.GetHolidays("ID", 2026);

        Assert.Equal(25, holidays.Count);
        Assert.Contains(holidays, holiday =>
            holiday.Date == new DateOnly(2026, 2, 16)
            && holiday.Name == "Imlek Holiday"
            && holiday.Type == DayType.CollectiveLeave);
        Assert.Contains(holidays, holiday =>
            holiday.Date == new DateOnly(2026, 2, 17)
            && holiday.Name == "Imlek"
            && holiday.Type == DayType.PublicHoliday);
    }

    [Fact]
    public void GetHolidays_Indonesia2027_ReturnsNationalHolidaysWithoutCollectiveLeaveDays()
    {
        var holidays = _holidayService.GetHolidays("ID", 2027);

        Assert.Equal(16, holidays.Count);
        Assert.All(holidays, holiday => Assert.Equal(DayType.PublicHoliday, holiday.Type));
        Assert.Contains(holidays, holiday =>
            holiday.Date == new DateOnly(2027, 12, 25)
            && holiday.Name == "Christmas Day / Isra Miraj");
    }
}
