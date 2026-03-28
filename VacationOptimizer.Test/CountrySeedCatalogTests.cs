using VacationOptimizer.Server.Data.SeedData;

namespace VacationOptimizer.Test;

public class CountrySeedCatalogTests
{
    [Fact]
    public void BuildHolidays_NormalizesIndiaNationalHolidaysToCountryScope()
    {
        var republicDay = CountrySeedCatalog.Holidays
            .Where(holiday => holiday.CountryId == IndiaSeedData.Country.Id && holiday.Date == new DateOnly(2026, 1, 26))
            .ToList();

        Assert.Single(republicDay);
        Assert.Null(republicDay[0].StateId);
        Assert.Equal("Republic Day (National)", republicDay[0].Name);
    }

    [Fact]
    public void BuildHolidays_KeepsStateScopedIndiaHolidaysAsStateRows()
    {
        var pongal = CountrySeedCatalog.Holidays
            .Where(holiday => holiday.CountryId == IndiaSeedData.Country.Id && holiday.Date == new DateOnly(2026, 1, 14))
            .ToList();

        Assert.All(pongal, holiday => Assert.NotNull(holiday.StateId));
        Assert.Contains(pongal, holiday => holiday.Name == "Pongal");
    }
}
