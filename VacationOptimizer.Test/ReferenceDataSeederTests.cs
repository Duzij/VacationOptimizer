using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;

namespace VacationOptimizer.Test;

public class ReferenceDataSeederTests
{
    [Fact]
    public void EnsureCreated_WithVacationOptimizerSeeding_AddsCountryReferenceData()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .UseVacationOptimizerSeeding()
            .Options;

        using var dbContext = new AppDbContext(options);

        dbContext.Database.EnsureCreated();

        var indiaCountry = Assert.Single(dbContext.Countries.Where(country => country.IsoCode == "IN"));
        var spainCountry = Assert.Single(dbContext.Countries.Where(country => country.IsoCode == "ES"));
        var indonesiaCountry = Assert.Single(dbContext.Countries.Where(country => country.IsoCode == "ID"));

        Assert.Contains(dbContext.States, state => state.Code == "IN-KA");
        Assert.Contains(dbContext.States, state => state.Code == "ES-AN");
        Assert.Contains(dbContext.States, state => state.Code == "ES-CT");
        Assert.Contains(dbContext.States, state => state.Code == "ES-CT-BCN");
        Assert.Contains(dbContext.States, state => state.Code == "ES-GA");
        Assert.Contains(dbContext.States, state => state.Code == "ES-MC");
        Assert.Contains(dbContext.Holidays, holiday => holiday.CountryId == indiaCountry.Id);
        Assert.Contains(dbContext.Holidays, holiday => holiday.CountryId == spainCountry.Id);
        Assert.Contains(dbContext.Holidays, holiday => holiday.CountryId == indonesiaCountry.Id);
    }
}
