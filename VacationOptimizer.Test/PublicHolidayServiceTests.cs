using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;
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
}
