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

                var testState = new State { Id = 999, Name = "Testville", Code = "XX-TV", CountryId = 999 };
                db.States.Add(testState);

                db.Holidays.Add(new Holiday { Id = 998, CountryId = 999, StateId = null, Date = new DateOnly(2026, 1, 1), Name = "National Test Day" });
                db.Holidays.Add(new Holiday { Id = 999, CountryId = 999, StateId = 999, Date = new DateOnly(2026, 7, 4), Name = "Test Independence Day" });

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

    [Fact]
    public async Task GetStates_ReturnsStatesForCountry()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/countries/XX/states");

        response.EnsureSuccessStatusCode();
        var jsonString = await response.Content.ReadAsStringAsync();
        Assert.Contains("XX-TV", jsonString);
        Assert.Contains("Testville", jsonString);
    }

    [Fact]
    public async Task GetStates_Returns404WhenCountryHasNoStates()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/countries/ES/states");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetDetectedCountry_ReturnsMatchingSupportedCountryFromHeaders()
    {
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/vacations/detected-country");
        request.Headers.Add("CF-IPCountry", "XX");

        var response = await client.SendAsync(request);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"hasGeoHeaders\":true", json);
        Assert.Contains("\"countryCode\":\"XX\"", json);
    }

    [Fact]
    public async Task GetDetectedCountry_ReturnsNullCountryWhenHeadersDoNotMatchSupportedCountry()
    {
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/vacations/detected-country");
        request.Headers.Add("CF-IPCountry", "ZZ");

        var response = await client.SendAsync(request);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"hasGeoHeaders\":true", json);
        Assert.Contains("\"countryCode\":null", json);
    }

    [Fact]
    public async Task GetDetectedCountry_ReturnsNoHeadersWhenGeoHeadersAreMissing()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/detected-country");

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"hasGeoHeaders\":false", json);
        Assert.Contains("\"countryCode\":null", json);
    }
}
