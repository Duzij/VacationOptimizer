using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Services;

namespace VacationOptimizer.Test;

public class HolidayYearSupportTests
{
    private const int SupportedYear = 2027;

    private readonly IPublicHolidayService _holidayService;

    public HolidayYearSupportTests()
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
    public void GetHolidays_2027_IsSupportedForEveryAvailableCountry()
    {
        var countryCodes = _holidayService.GetSupportedCountries();

        Assert.NotEmpty(countryCodes);

        foreach (var countryCode in countryCodes)
        {
            IList<HolidayInfo>? holidays = null;
            var exception = Record.Exception(() => holidays = _holidayService.GetHolidays(countryCode, SupportedYear));

            Assert.True(exception is null, $"Country '{countryCode}' does not support {SupportedYear}: {exception}");
            Assert.NotNull(holidays);
            Assert.All(holidays, holiday => Assert.Equal(SupportedYear, holiday.Date.Year));
        }
    }

    [Theory]
    [InlineData("ES-CT-BCN")]
    [InlineData("ES-MD-MAD")]
    public void GetHolidays_2027_IsSupportedForEverySpainCityScope(string cityCode)
    {
        var holidays = _holidayService.GetHolidays("ES", SupportedYear, cityCode);

        Assert.All(holidays, holiday => Assert.Equal(SupportedYear, holiday.Date.Year));
    }

    [Theory]
    [InlineData("ES-CT-BCN", "2026-05-25", "Whit Monday")]
    [InlineData("ES-CT-BCN", "2026-09-24", "La Merce")]
    [InlineData("ES-MD-MAD", "2026-05-15", "San Isidro")]
    [InlineData("ES-MD-MAD", "2026-11-09", "Virgin of Almudena")]
    public void GetHolidays_SpainCityScope_IncludesCityHoliday(string cityCode, string date, string holidayName)
    {
        var holidays = _holidayService.GetHolidays("ES", 2026, cityCode);

        Assert.Contains(holidays, holiday =>
            holiday.Date == DateOnly.Parse(date)
            && holiday.Name == holidayName);
    }
}
