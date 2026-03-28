using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Data.SeedData;
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
}
