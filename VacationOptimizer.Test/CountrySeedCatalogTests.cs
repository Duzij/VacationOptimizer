using VacationOptimizer.Server.Data.SeedData;

namespace VacationOptimizer.Test;

public class CountrySeedCatalogTests
{
    [Fact]
    public void BuildHolidays_NormalizesCanadaNationalAndProvincialScopes()
    {
        var nationalCanadaDay = CountrySeedCatalog.Holidays.Single(holiday =>
            holiday.CountryId == CanadaSeedData.Country.Id
            && holiday.StateId == null
            && holiday.Date == new DateOnly(2026, 7, 1));
        var yukon = CountrySeedCatalog.States.Single(state => state.Code == "CA-YT");
        var discoveryDay = CountrySeedCatalog.Holidays.Single(holiday =>
            holiday.CountryId == CanadaSeedData.Country.Id
            && holiday.Date == new DateOnly(2026, 8, 17));

        Assert.Null(nationalCanadaDay.StateId);
        Assert.Equal(yukon.Id, discoveryDay.StateId);
        Assert.Equal("Discovery Day", discoveryDay.Name);
    }

    [Fact]
    public void BuildHolidays_NormalizesGermanyNationalAndRegionalScopes()
    {
        var germanUnity = CountrySeedCatalog.Holidays.Single(holiday =>
            holiday.CountryId == GermanySeedData.Country.Id
            && holiday.StateId == null
            && holiday.Date == new DateOnly(2027, 10, 3));
        var bavaria = CountrySeedCatalog.States.Single(state => state.Code == "DE-BY");
        var epiphany = CountrySeedCatalog.Holidays
            .Where(holiday => holiday.CountryId == GermanySeedData.Country.Id && holiday.Date == new DateOnly(2027, 1, 6))
            .ToList();

        Assert.Null(germanUnity.StateId);
        Assert.Equal(3, epiphany.Count);
        Assert.Contains(epiphany, holiday => holiday.StateId == bavaria.Id);
        Assert.All(epiphany, holiday => Assert.NotNull(holiday.StateId));
    }

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
