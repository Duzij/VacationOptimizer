using Microsoft.Extensions.Caching.Memory;

namespace VacationOptimizer.Server.Services;

public class CachedPublicHolidayService : IPublicHolidayService
{
    private static readonly TimeSpan CountriesCacheDuration = TimeSpan.FromHours(12);
    private static readonly TimeSpan StatesCacheDuration = TimeSpan.FromHours(12);
    private static readonly TimeSpan HolidaysCacheDuration = TimeSpan.FromHours(12);

    private readonly IPublicHolidayService _inner;
    private readonly IMemoryCache _cache;

    public CachedPublicHolidayService(IPublicHolidayService inner, IMemoryCache cache)
    {
        _inner = inner;
        _cache = cache;
    }

    public IList<HolidayInfo> GetHolidays(string countryCode, int year, string? stateCode = null)
    {
        var cacheKey = $"public-holidays:{countryCode.ToUpperInvariant()}:{year}:{stateCode?.ToUpperInvariant() ?? "ALL"}";
        var cached = _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = HolidaysCacheDuration;
            return _inner.GetHolidays(countryCode, year, stateCode).ToArray();
        });

        return cached?.ToList() ?? [];
    }

    public IList<string> GetSupportedCountries()
    {
        var cached = _cache.GetOrCreate("supported-countries", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CountriesCacheDuration;
            return _inner.GetSupportedCountries().ToArray();
        });

        return cached?.ToList() ?? [];
    }

    public IList<CountryInfo> GetCountries()
    {
        var cached = _cache.GetOrCreate("countries", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CountriesCacheDuration;
            return _inner.GetCountries().ToArray();
        });

        return cached?.ToList() ?? [];
    }

    public IList<StateInfo> GetStates(string countryCode)
    {
        var cacheKey = $"states:{countryCode.ToUpperInvariant()}";
        var cached = _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = StatesCacheDuration;
            return _inner.GetStates(countryCode).ToArray();
        });

        return cached?.ToList() ?? [];
    }
}
