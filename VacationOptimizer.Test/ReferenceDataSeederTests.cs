using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;

namespace VacationOptimizer.Test;

public class ReferenceDataSeederTests
{
    [Fact]
    public void EnsureCreated_WithVacationOptimizerSeeding_AddsIndiaAndSpainReferenceData()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .UseVacationOptimizerSeeding()
            .Options;

        using var dbContext = new AppDbContext(options);

        dbContext.Database.EnsureCreated();

        var indiaCountry = Assert.Single(dbContext.Countries.Where(country => country.IsoCode == "IN"));
        var spainCountry = Assert.Single(dbContext.Countries.Where(country => country.IsoCode == "ES"));

        Assert.Contains(dbContext.States, state => state.Code == "IN-KA");
        Assert.Contains(dbContext.States, state => state.Code == "ES-CT");
        Assert.Contains(dbContext.States, state => state.Code == "ES-CT-BCN");
        Assert.Contains(dbContext.Holidays, holiday => holiday.CountryId == indiaCountry.Id);
        Assert.Contains(dbContext.Holidays, holiday => holiday.CountryId == spainCountry.Id);
    }
}
