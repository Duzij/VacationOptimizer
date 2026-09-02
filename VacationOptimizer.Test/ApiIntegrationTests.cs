using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;
using Xunit;

namespace VacationOptimizer.Test;

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string DatabaseSecurityHealthAccessToken = "e144dedc-25cf-4f29-ba36-ff6e9f2b0eb1";
    private readonly WebApplicationFactory<Program> _factory;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureAppConfiguration((_, configuration) =>
            {
                configuration.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["DatabaseSecurityHealthCheck:AccessToken"] = DatabaseSecurityHealthAccessToken
                });
            });
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
    public async Task GetHomepage_ReturnsAgentDiscoveryLinkHeaders()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.True(response.Headers.TryGetValues("Link", out var linkValues));
        var link = Assert.Single(linkValues);
        Assert.Contains("rel=\"api-catalog\"", link);
        Assert.Contains("rel=\"service-desc\"", link);
        Assert.Contains("rel=\"service-doc\"", link);
        Assert.Contains("rel=\"describedby\"", link);
        Assert.Contains(".well-known/api-catalog.json", link);
        Assert.Contains("llms.txt", link);
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
    public async Task DatabaseSecurityHealthReport_HidesTheEndpointWithoutItsAccessToken()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/internal/database-security?accessKey=00000000-0000-0000-0000-000000000000");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DatabaseSecurityHealthReport_AcceptsTheConfiguredAccessToken()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync($"/api/internal/database-security?accessKey={DatabaseSecurityHealthAccessToken}");

        // Hosted checks are disabled in the in-memory test host, so a valid request proves
        // authentication by reaching the no-report-yet response rather than a 404.
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.True(response.Headers.CacheControl?.NoStore);
        Assert.True(response.Headers.CacheControl?.NoCache);
        Assert.True(response.Headers.CacheControl?.MustRevalidate);
        Assert.Equal("no-referrer", response.Headers.GetValues("Referrer-Policy").Single());
    }

    [Fact]
    public async Task Sitemap_ListsPublicPagesAndPlanner()
    {
        // The sitemap is a static file served from wwwroot/public (copied to dist
        // at build time), not an API endpoint, so this test verifies the file itself.
        using var scope = _factory.Services.CreateScope();
        var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
        var sitemapPath = Path.Combine(environment.ContentRootPath, "wwwroot", "public", "sitemap.xml");

        Assert.True(File.Exists(sitemapPath), $"Static sitemap not found at {sitemapPath}");

        var xml = await File.ReadAllTextAsync(sitemapPath);
        Assert.Contains("https://longvacation.eu/", xml);
        Assert.Contains("https://longvacation.eu/about/", xml);
        Assert.Contains("https://longvacation.eu/contact/", xml);
        Assert.Contains("https://longvacation.eu/app/", xml);
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
    public async Task GetSwitzerlandSchema_ReturnsCantonContract()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/countries/CH/schema");

        response.EnsureSuccessStatusCode();
        var schema = await response.Content.ReadFromJsonAsync<SwitzerlandSchemaResponse>();

        Assert.NotNull(schema);
        Assert.Equal("CH", schema.CountryCode);
        Assert.Equal("switzerland", schema.Component);
        Assert.True(schema.CantonSelectionRequired);
        Assert.Contains(schema.Cantons, canton => canton.Code == "CH-ZH");
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
        Assert.Contains("\"publicHolidaysCount\":", json);
        Assert.Contains("\"plannerSeed\":\"", json);
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
        Assert.Contains("\"publicHolidaysCount\":", json);
        Assert.Contains("\"plannerSeed\":\"", json);
    }

    [Fact]
    public async Task OptimizeSwitzerland_WithCanton_ReturnsSwitzerlandSpecificScope()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            cantonCode = "CH-ZH",
            year = 2026,
            vacationDays = 5,
            minimumDaysPerRange = 1,
            maximumDaysPerRange = 14,
        });

        var response = await client.PostAsync("/api/vacations/countries/CH/optimize", payload);

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"countryCode\":\"CH\"", json);
        Assert.Contains("\"type\":\"canton\"", json);
        Assert.Contains("\"cantonCode\":\"CH-ZH\"", json);
        Assert.Contains("\"publicHolidaysCount\":", json);
        Assert.Contains("\"plannerSeed\":\"", json);
    }

    [Fact]
    public async Task OptimizeSpain_WithCity_RejectsLockedDaysExceedingMonthlyCap()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            stateCode = "ES-CT",
            cityCode = "ES-CT-BCN",
            year = 2027,
            vacationDays = 5,
            minimumDaysPerRange = 1,
            maximumDaysPerRange = 14,
            maxNumberOfVacationsPerMonth = new Dictionary<string, int> { { "July", 1 } },
            lockedVacationDates = new[] { "2027-07-01", "2027-07-02" },
        });

        var response = await client.PostAsync("/api/vacations/countries/ES/optimize", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Locked vacation days exceed the July monthly limit of 1.", json);
    }

    [Fact]
    public async Task OptimizeIndia_RejectsLockedDaysExceedingMonthlyCap()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            stateCode = "IN-KA",
            year = 2027,
            vacationDays = 5,
            minimumDaysPerRange = 1,
            maximumDaysPerRange = 14,
            maxNumberOfVacationsPerMonth = new Dictionary<string, int> { { "July", 1 } },
            lockedVacationDates = new[] { "2027-07-01", "2027-07-02" },
        });

        var response = await client.PostAsync("/api/vacations/countries/IN/optimize", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Locked vacation days exceed the July monthly limit of 1.", json);
    }

    [Fact]
    public async Task OptimizeSwitzerland_RejectsLockedDaysExceedingMonthlyCap()
    {
        var client = _factory.CreateClient();
        var payload = JsonContent.Create(new
        {
            cantonCode = "CH-ZH",
            year = 2027,
            vacationDays = 5,
            minimumDaysPerRange = 1,
            maximumDaysPerRange = 14,
            maxNumberOfVacationsPerMonth = new Dictionary<string, int> { { "July", 1 } },
            lockedVacationDates = new[] { "2027-07-01", "2027-07-02" },
        });

        var response = await client.PostAsync("/api/vacations/countries/CH/optimize", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Locked vacation days exceed the July monthly limit of 1.", json);
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

    [Fact]
    public async Task DecodeSeed_ReturnsDayTypes()
    {
        var client = _factory.CreateClient();
        using var scope = _factory.Services.CreateScope();
        var calendarSeed = scope.ServiceProvider.GetRequiredService<CalendarSeed>();
        
        var seedString = calendarSeed.GetCalendarSeed(new List<CalendarDay> { new CalendarDay { Type = DayType.Vacation } });
        
        var payload = JsonContent.Create(new { seedToken = seedString });
        var response = await client.PostAsync("/api/vacations/decode-seed", payload);
        
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Vacation", json);
    }

    [Fact]
    public async Task Showcase_ReturnsSingleNumberForGenericCountry()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/showcase?country=XX&year=2026&vacationDays=25");

        response.EnsureSuccessStatusCode();
        var totalDaysOff = await response.Content.ReadFromJsonAsync<int>();
        Assert.True(totalDaysOff > 25, $"Expected more total days off than the 25 PTO days, got {totalDaysOff}.");
    }

    [Fact]
    public async Task Showcase_UsesHardcodedDefaultsWhenParametersAreOmitted()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/showcase?country=XX");

        response.EnsureSuccessStatusCode();
        var totalDaysOff = await response.Content.ReadFromJsonAsync<int>();
        Assert.True(totalDaysOff > 0);
    }

    [Fact]
    public async Task Showcase_RequiresCountry()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/showcase");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Showcase_RejectsUnknownCountry()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/showcase?country=ZZ&year=2026");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Showcase_UsesDefaultStateForIndia()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/showcase?country=IN&year=2026&vacationDays=25");

        response.EnsureSuccessStatusCode();
        var totalDaysOff = await response.Content.ReadFromJsonAsync<int>();
        Assert.True(totalDaysOff > 25, $"Expected more total days off than the 25 PTO days, got {totalDaysOff}.");
    }

    [Fact]
    public async Task Showcase_Returns200ForEverySupportedCountry()
    {
        var client = _factory.CreateClient();
        var countries = await client.GetFromJsonAsync<List<CountryResponse>>("/api/vacations/countries");

        Assert.NotNull(countries);
        Assert.NotEmpty(countries);

        foreach (var country in countries)
        {
            var response = await client.GetAsync($"/api/vacations/showcase?country={country.Code}&year=2026&vacationDays=25");
            var body = await response.Content.ReadAsStringAsync();

            Assert.True(
                response.StatusCode == HttpStatusCode.OK,
                $"Showcase failed for {country.Code}: {(int)response.StatusCode} {body}");

            var totalDaysOff = JsonSerializer.Deserialize<int>(body);
            Assert.True(
                totalDaysOff > 25,
                $"Expected more total days off than the 25 PTO days for {country.Code}, got {totalDaysOff}.");
        }
    }

    [Fact]
    public async Task Showcase_UsesDefaultCantonForSwitzerland()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/vacations/showcase?country=CH&year=2026&vacationDays=25");

        response.EnsureSuccessStatusCode();
        var totalDaysOff = await response.Content.ReadFromJsonAsync<int>();
        Assert.True(totalDaysOff > 25, $"Expected more total days off than the 25 PTO days, got {totalDaysOff}.");
    }

    private sealed record CountryResponse(string Code, string Name);

    private sealed record StateResponse(string Code, string Name);

    private sealed record CityResponse(string Code, string Name, string StateCode);

    private sealed record SpainSchemaResponse(
        string CountryCode,
        string Component,
        List<StateResponse> States,
        List<CityResponse> Cities);

    private sealed record SwitzerlandSchemaResponse(
        string CountryCode,
        string Component,
        bool CantonSelectionRequired,
        List<StateResponse> Cantons);
}
