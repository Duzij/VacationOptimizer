using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;
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
                var databaseName = $"InMemoryDbForTesting-{Guid.NewGuid()}";

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
                    options.UseInMemoryDatabase(databaseName);
                    options.UseInternalServiceProvider(efProvider);
                    options.UseVacationOptimizerSeeding();
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

                var india = new Country { Id = 1000, Name = "India", IsoCode = "IN" };
                db.Countries.Add(india);

                var indiaState = new State { Id = 1000, Name = "Karnataka", Code = "IN-KA", CountryId = 1000 };
                db.States.Add(indiaState);

                var spain = new Country { Id = 1001, Name = "Spain", IsoCode = "ES" };
                db.Countries.Add(spain);

                var catalonia = new State { Id = 1001, Name = "Catalonia", Code = "ES-CT", CountryId = 1001 };
                var barcelona = new State { Id = 1002, Name = "Barcelona", Code = "ES-CT-BCN", CountryId = 1001 };
                db.States.AddRange(catalonia, barcelona);

                db.Holidays.Add(new Holiday { Id = 998, CountryId = 999, StateId = null, Date = new DateOnly(2026, 9, 1), Name = "National Test Day" });
                db.Holidays.Add(new Holiday { Id = 999, CountryId = 999, StateId = 999, Date = new DateOnly(2026, 9, 4), Name = "Test Independence Day" });
                db.Holidays.Add(new Holiday { Id = 1000, CountryId = 1000, StateId = null, Date = new DateOnly(2026, 10, 2), Name = "Mahatma Gandhi Jayanti (National)" });
                db.Holidays.Add(new Holiday { Id = 1001, CountryId = 1000, StateId = 1000, Date = new DateOnly(2026, 9, 14), Name = "Ganesh Chaturthi" });
                db.Holidays.Add(new Holiday { Id = 1002, CountryId = 1001, StateId = null, Date = new DateOnly(2026, 10, 12), Name = "National Day of Spain" });
                db.Holidays.Add(new Holiday { Id = 1003, CountryId = 1001, StateId = 1001, Date = new DateOnly(2026, 9, 11), Name = "Catalan National Day" });
                db.Holidays.Add(new Holiday { Id = 1004, CountryId = 1001, StateId = 1002, Date = new DateOnly(2026, 9, 24), Name = "Mare de Deu de la Merce" });

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
    public async Task GetStates_ReturnsEmptyArrayWhenCountryHasNoStates()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/countries/FR/states");

        response.EnsureSuccessStatusCode();
        var jsonString = await response.Content.ReadAsStringAsync();
        Assert.Equal("[]", jsonString.Trim());
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

    [Fact]
    public async Task GetIndiaSchema_ReturnsIndiaSpecificContract()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/countries/IN/schema");

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"countryCode\":\"IN\"", json);
        Assert.Contains("\"component\":\"india\"", json);
        Assert.Contains("\"stateSelectionRequired\":true", json);
        Assert.Contains("\"code\":\"IN-KA\"", json);
    }

    [Fact]
    public async Task GetSpainSchema_ReturnsSpainSpecificContract()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/countries/ES/schema");

        response.EnsureSuccessStatusCode();
        var schema = await response.Content.ReadFromJsonAsync<SpainSchemaResponse>();

        Assert.NotNull(schema);
        Assert.Equal("ES", schema.CountryCode);
        Assert.Equal("spain", schema.Component);
        Assert.Contains(schema.States, state => state.Code == "ES-CT");
        Assert.Contains(schema.Cities, city => city.Code == "ES-CT-BCN");
        Assert.NotEmpty(schema.States);
        Assert.NotEmpty(schema.Cities);
    }

    [Fact]
    public async Task GetSpainSchema_ReturnsEmptyStateAndCityOptionsWhenSpainExistsOnlyViaFallbackProvider()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var spainCountry = db.Countries.Single(country => country.IsoCode == "ES");
            var spainStateIds = db.States
                .Where(state => state.CountryId == spainCountry.Id)
                .Select(state => state.Id)
                .ToArray();

            db.Holidays.RemoveRange(db.Holidays.Where(holiday => holiday.CountryId == spainCountry.Id || (holiday.StateId.HasValue && spainStateIds.Contains(holiday.StateId.Value))));
            db.States.RemoveRange(db.States.Where(state => state.CountryId == spainCountry.Id));
            db.Countries.Remove(spainCountry);
            db.SaveChanges();
        }

        var client = _factory.CreateClient();

        var countriesResponse = await client.GetAsync("/api/vacations/countries");
        countriesResponse.EnsureSuccessStatusCode();
        var countries = await countriesResponse.Content.ReadFromJsonAsync<List<CountryResponse>>();

        var schemaResponse = await client.GetAsync("/api/vacations/countries/ES/schema");
        schemaResponse.EnsureSuccessStatusCode();
        var schema = await schemaResponse.Content.ReadFromJsonAsync<SpainSchemaResponse>();

        Assert.NotNull(countries);
        Assert.Contains(countries, country => country.Code == "ES");
        Assert.NotNull(schema);
        Assert.Empty(schema.States);
        Assert.Empty(schema.Cities);
    }

    [Fact]
    public async Task OptimizeIndia_RequiresStateCode()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            year = 2026,
            vacationDays = 5,
        });

        var response = await client.PostAsync("/api/vacations/countries/IN/optimize", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("stateCode", json);
    }

    [Fact]
    public async Task OptimizeIndia_ReturnsIndiaSpecificScope()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            stateCode = "IN-KA",
            year = 2026,
            vacationDays = 5,
            minimumDaysPerRange = 1,
            maximumDaysPerRange = 14,
        });

        var response = await client.PostAsync("/api/vacations/countries/IN/optimize", payload);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"countryCode\":\"IN\"", json);
        Assert.Contains("\"stateCode\":\"IN-KA\"", json);
        Assert.Contains("\"stateName\":\"Karnataka\"", json);
        Assert.Contains("\"publicHolidaysCount\":2", json);
    }

    [Fact]
    public async Task OptimizeSpain_WithCity_ReturnsSpainSpecificScope()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            stateCode = "ES-CT",
            cityCode = "ES-CT-BCN",
            year = 2026,
            vacationDays = 5,
            minimumDaysPerRange = 1,
            maximumDaysPerRange = 14,
        });

        var response = await client.PostAsync("/api/vacations/countries/ES/optimize", payload);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"countryCode\":\"ES\"", json);
        Assert.Contains("\"type\":\"city\"", json);
        Assert.Contains("\"stateCode\":\"ES-CT\"", json);
        Assert.Contains("\"cityCode\":\"ES-CT-BCN\"", json);
        Assert.Contains("\"publicHolidaysCount\":3", json);
    }

    [Fact]
    public async Task OptimizeLegacyEndpoint_StillWorksForNonIndiaCountries()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            country = "XX",
            year = 2026,
            vacationDays = 5,
            minimumDaysPerRange = 1,
            maximumDaysPerRange = 14,
        });

        var response = await client.PostAsync("/api/vacations/optimize", payload);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"publicHolidaysCount\":1", json);
    }

    private sealed record CountryResponse(string Code, string Name);

    private sealed record StateResponse(string Code, string Name);

    private sealed record CityResponse(string Code, string Name, string StateCode);

    private sealed record SpainSchemaResponse(
        string CountryCode,
        string Component,
        List<StateResponse> States,
        List<CityResponse> Cities);
}
