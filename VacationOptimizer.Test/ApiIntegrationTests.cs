using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Text.Json;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Models;
using Xunit;

namespace VacationOptimizer.Test;

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureTestServices(services =>
            {
                // Remove the app's AppDbContext registration completely
                services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
                services.RemoveAll(typeof(DbContextOptions));

                // Create a new service provider for EF's internal use to isolate InMemory from Npgsql
                var efProvider = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                // Add AppDbContext using an in-memory database for testing.
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                    options.UseInternalServiceProvider(efProvider);
                });
                
                // We also need to seed the in-memory DB as it won't run migrations
                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<AppDbContext>();

                db.Database.EnsureCreated();

                // Clear any seeded data that EnsureCreated might add and add our specific test data
                db.Countries.RemoveRange(db.Countries);
                db.States.RemoveRange(db.States);
                db.Holidays.RemoveRange(db.Holidays);
                db.SaveChanges();

                var testCountry = new Country { Id = 999, Name = "TestLand", IsoCode = "XX" };
                db.Countries.Add(testCountry);

                var testState = new State { Id = 999, Name = "Testville", CountryId = 999 };
                db.States.Add(testState);

                var testHoliday = new Holiday { Id = 999, StateId = 999, Date = new DateOnly(2026, 7, 4), Name = "Test Independence Day" };
                db.Holidays.Add(testHoliday);

                db.SaveChanges();
            });
        });
    }

    [Fact]
    public async Task GetCountries_ReturnsSeededDatabaseCountriesAndFallback()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/vacations/countries");

        // Assert
        response.EnsureSuccessStatusCode(); 
        var jsonString = await response.Content.ReadAsStringAsync();
        
        // Deserialize and check
        Assert.Contains("XX", jsonString);
        Assert.Contains("TestLand", jsonString);
    }
}
