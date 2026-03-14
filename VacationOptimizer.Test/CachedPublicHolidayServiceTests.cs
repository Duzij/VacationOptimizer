using Microsoft.Extensions.Caching.Memory;
using VacationOptimizer.Server.Services;

namespace VacationOptimizer.Test;

public class CachedPublicHolidayServiceTests
{
    [Fact]
    public void GetCountries_ReturnsCachedDataAfterFirstCall()
    {
        var inner = new CountingPublicHolidayService
        {
            Countries = [new CountryInfo("ES", "Spain")]
        };
        var service = CreateService(inner);

        var first = service.GetCountries();
        var second = service.GetCountries();

        Assert.Single(first);
        Assert.Single(second);
        Assert.Equal(1, inner.GetCountriesCalls);
    }

    [Fact]
    public void GetStates_UsesDistinctCacheEntriesPerCountry()
    {
        var inner = new CountingPublicHolidayService();
        inner.StatesByCountry["US"] = [new StateInfo("US-CA", "California")];
        inner.StatesByCountry["DE"] = [new StateInfo("DE-BE", "Berlin")];
        var service = CreateService(inner);

        var usFirst = service.GetStates("US");
        var usSecond = service.GetStates("US");
        var deFirst = service.GetStates("DE");

        Assert.Single(usFirst);
        Assert.Single(usSecond);
        Assert.Single(deFirst);
        Assert.Equal(1, inner.GetStatesCallsByCountry["US"]);
        Assert.Equal(1, inner.GetStatesCallsByCountry["DE"]);
    }

    [Fact]
    public void GetHolidays_ReturnsCachedDataAfterFirstCall()
    {
        var inner = new CountingPublicHolidayService();
        inner.HolidaysByRequest[("ES", 2026, null)] = [new HolidayInfo(new DateOnly(2026, 1, 1), "New Year")];
        var service = CreateService(inner);

        var first = service.GetHolidays("ES", 2026);
        var second = service.GetHolidays("ES", 2026);

        Assert.Single(first);
        Assert.Single(second);
        Assert.Equal(1, inner.GetHolidayCallsByRequest[("ES", 2026, null)]);
    }

    [Fact]
    public void GetHolidays_UsesDistinctCacheEntriesPerYearAndState()
    {
        var inner = new CountingPublicHolidayService();
        inner.HolidaysByRequest[("ES", 2026, null)] = [new HolidayInfo(new DateOnly(2026, 1, 1), "New Year")];
        inner.HolidaysByRequest[("ES", 2027, null)] = [new HolidayInfo(new DateOnly(2027, 1, 1), "New Year")];
        inner.HolidaysByRequest[("US", 2026, "US-CA")] = [new HolidayInfo(new DateOnly(2026, 7, 4), "Independence Day")];
        var service = CreateService(inner);

        service.GetHolidays("ES", 2026);
        service.GetHolidays("ES", 2026);
        service.GetHolidays("ES", 2027);
        service.GetHolidays("US", 2026, "US-CA");
        service.GetHolidays("US", 2026, "US-CA");

        Assert.Equal(1, inner.GetHolidayCallsByRequest[("ES", 2026, null)]);
        Assert.Equal(1, inner.GetHolidayCallsByRequest[("ES", 2027, null)]);
        Assert.Equal(1, inner.GetHolidayCallsByRequest[("US", 2026, "US-CA")]);
    }

    [Fact]
    public void GetHolidays_DoesNotCacheExceptions()
    {
        var inner = new CountingPublicHolidayService
        {
            ThrowOnHolidayRequests = true
        };
        var service = CreateService(inner);

        Assert.Throws<ArgumentException>(() => service.GetHolidays("XX", 2026));
        Assert.Throws<ArgumentException>(() => service.GetHolidays("XX", 2026));
        Assert.Equal(2, inner.GetHolidayCallsByRequest[("XX", 2026, null)]);
    }

    private static CachedPublicHolidayService CreateService(CountingPublicHolidayService inner)
    {
        return new CachedPublicHolidayService(inner, new MemoryCache(new MemoryCacheOptions()));
    }

    private sealed class CountingPublicHolidayService : IPublicHolidayService
    {
        public int GetCountriesCalls { get; private set; }
        public Dictionary<string, int> GetStatesCallsByCountry { get; } = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<(string CountryCode, int Year, string? StateCode), int> GetHolidayCallsByRequest { get; } = new();
        public IList<CountryInfo> Countries { get; set; } = [];
        public Dictionary<string, IList<StateInfo>> StatesByCountry { get; } = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<(string CountryCode, int Year, string? StateCode), IList<HolidayInfo>> HolidaysByRequest { get; } = new();
        public bool ThrowOnHolidayRequests { get; set; }

        public IList<HolidayInfo> GetHolidays(string countryCode, int year, string? stateCode = null)
        {
            var key = (countryCode, year, stateCode);
            GetHolidayCallsByRequest[key] = GetHolidayCallsByRequest.GetValueOrDefault(key) + 1;

            if (ThrowOnHolidayRequests)
            {
                throw new ArgumentException($"Unsupported country code: {countryCode}");
            }

            return HolidaysByRequest.TryGetValue(key, out var holidays) ? holidays : [];
        }

        public IList<string> GetSupportedCountries()
        {
            return Countries.Select(country => country.Code).ToList();
        }

        public IList<CountryInfo> GetCountries()
        {
            GetCountriesCalls++;
            return Countries;
        }

        public IList<StateInfo> GetStates(string countryCode)
        {
            GetStatesCallsByCountry[countryCode] = GetStatesCallsByCountry.GetValueOrDefault(countryCode) + 1;
            return StatesByCountry.TryGetValue(countryCode, out var states) ? states : [];
        }
    }
}
