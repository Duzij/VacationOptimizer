using PublicHoliday;
using System.Reflection;
using VacationOptimizer.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace VacationOptimizer.Server.Services;

public record HolidayInfo(DateOnly Date, string Name);
public record StateInfo(string Code, string Name);
public record CountryInfo(string Code, string Name);

public interface IPublicHolidayService
{
    IList<HolidayInfo> GetHolidays(string countryCode, int year, string? stateCode = null);
    IList<string> GetSupportedCountries();
    IList<CountryInfo> GetCountries();
    IList<StateInfo> GetStates(string countryCode);
}

public class PublicHolidayService : IPublicHolidayService
{
    private readonly AppDbContext _dbContext;
    private readonly Dictionary<string, Func<IPublicHolidays>> _countryFactories;

    // Maps known class names to ISO 3166-1 alpha-2 codes
    private static readonly Dictionary<string, string> ClassNameToCountryCode = new(StringComparer.OrdinalIgnoreCase)
    {
        { "AustriaPublicHoliday", "AT" },
        { "AustraliaPublicHoliday", "AU" },
        { "BelgiumPublicHoliday", "BE" },
        { "BrazilPublicHoliday", "BR" },
        { "CanadaPublicHoliday", "CA" },
        { "CzechRepublicPublicHoliday", "CZ" },
        { "DenmarkPublicHoliday", "DK" },
        { "DutchPublicHoliday", "NL" },
        { "EcuadorPublicHoliday", "EC" },
        { "EstoniaPublicHoliday", "EE" },
        { "FinlandPublicHoliday", "FI" },
        { "FrancePublicHoliday", "FR" },
        { "GermanPublicHoliday", "DE" },
        { "GreekPublicHoliday", "GR" },
        { "HungaryPublicHoliday", "HU" },
        { "IrelandPublicHoliday", "IE" },
        { "ItalyPublicHoliday", "IT" },
        { "JapanPublicHoliday", "JP" },
        { "KazakhstanPublicHoliday", "KZ" },
        { "LithuaniaPublicHoliday", "LT" },
        { "LuxembourgPublicHoliday", "LU" },
        { "MexicoPublicHoliday", "MX" },
        { "NewZealandPublicHoliday", "NZ" },
        { "NorwayPublicHoliday", "NO" },
        { "PolandPublicHoliday", "PL" },
        { "PortugalPublicHoliday", "PT" },
        { "RomaniaPublicHoliday", "RO" },
        { "SlovakiaPublicHoliday", "SK" },
        { "SloveniaPublicHoliday", "SI" },
        { "SouthAfricaPublicHoliday", "ZA" },
        { "SpainPublicHoliday", "ES" },
        { "SwedenPublicHoliday", "SE" },
        { "SwitzerlandPublicHoliday", "CH" },
        { "TurkeyPublicHoliday", "TR" },
        { "UKBankHoliday", "GB" },
        { "USAPublicHoliday", "US" },
        { "ColombiaPublicHoliday", "CO" },
        { "CroatiaPublicHoliday", "HR" },
        { "LatviaPublicHoliday", "LV" },
        { "MontenegroPublicHoliday", "ME" },
    };

    // Friendly country names for the API
    private static readonly Dictionary<string, string> CountryNames = new()
    {
        { "AT", "Austria" }, { "AU", "Australia" }, { "BE", "Belgium" },
        { "BR", "Brazil" }, { "CA", "Canada" }, { "CH", "Switzerland" },
        { "CO", "Colombia" }, { "CZ", "Czech Republic" }, { "DE", "Germany" },
        { "DK", "Denmark" }, { "EC", "Ecuador" }, { "EE", "Estonia" },
        { "ES", "Spain" }, { "FI", "Finland" }, { "FR", "France" },
        { "GB", "United Kingdom" }, { "GR", "Greece" }, { "HR", "Croatia" },
        { "HU", "Hungary" }, { "IE", "Ireland" }, { "IT", "Italy" },
        { "JP", "Japan" }, { "KZ", "Kazakhstan" }, { "LT", "Lithuania" },
        { "LU", "Luxembourg" }, { "LV", "Latvia" }, { "ME", "Montenegro" },
        { "MX", "Mexico" }, { "NL", "Netherlands" }, { "NO", "Norway" },
        { "NZ", "New Zealand" }, { "PL", "Poland" }, { "PT", "Portugal" },
        { "RO", "Romania" }, { "SE", "Sweden" }, { "SI", "Slovenia" },
        { "SK", "Slovakia" }, { "TR", "Turkey" }, { "US", "United States" },
        { "ZA", "South Africa" },
    };

    public PublicHolidayService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
        _countryFactories = new Dictionary<string, Func<IPublicHolidays>>(StringComparer.OrdinalIgnoreCase);

        // Discover all IPublicHolidays implementations via reflection
        var assembly = typeof(IPublicHolidays).Assembly;
        var holidayTypes = assembly.GetTypes()
            .Where(t => typeof(IPublicHolidays).IsAssignableFrom(t) && t.IsClass && !t.IsAbstract)
            .Where(t => t.GetConstructor(Type.EmptyTypes) != null);

        foreach (var type in holidayTypes)
        {
            if (ClassNameToCountryCode.TryGetValue(type.Name, out var code))
            {
                var capturedType = type;
                _countryFactories[code] = () => (IPublicHolidays)Activator.CreateInstance(capturedType)!;
            }
        }
    }

    public IList<HolidayInfo> GetHolidays(string countryCode, int year, string? stateCode = null)
    {
        var hasDatabaseHolidays = _dbContext.Holidays
            .Any(h => h.Country!.IsoCode == countryCode && h.Date.Year == year);

        if (hasDatabaseHolidays)
        {
            IQueryable<Models.Holiday> query = _dbContext.Holidays
                .Include(h => h.State)
                .Include(h => h.Country)
                .Where(h => h.Country!.IsoCode == countryCode && h.Date.Year == year);

            if (string.IsNullOrWhiteSpace(stateCode))
            {
                query = query.Where(h => h.StateId == null);
            }
            else
            {
                var stateExists = _dbContext.States.Any(s => s.Country!.IsoCode == countryCode && s.Code == stateCode);
                if (!stateExists)
                {
                    throw new ArgumentException($"Unsupported state code '{stateCode}' for country '{countryCode}'.");
                }

                query = query.Where(h => h.StateId == null || h.State!.Code == stateCode);
            }

            var dbHolidays = query
                .Select(h => new HolidayInfo(h.Date, h.Name))
                .ToList();

            return dbHolidays.OrderBy(h => h.Date).ToList();
        }

        // 2. Fallback to NuGet package
        if (!_countryFactories.TryGetValue(countryCode, out var factory))
            throw new ArgumentException($"Unsupported country code: {countryCode}");

        var provider = factory();
        var holidays = provider.PublicHolidayNames(year);

        return holidays
            .Select(h => new HolidayInfo(DateOnly.FromDateTime(h.Key), h.Value))
            .OrderBy(h => h.Date)
            .ToList();
    }

    public IList<string> GetSupportedCountries()
    {
        // Get unique country codes from both Database and NuGet fallback
        var dbCountries = _dbContext.Countries.Select(c => c.IsoCode).ToList();
        var fallbackCountries = _countryFactories.Keys;

        return dbCountries.Union(fallbackCountries).OrderBy(k => k).ToList();
    }

    public IList<CountryInfo> GetCountries()
    {
        var countryCodes = GetSupportedCountries();
        var dbCountryNames = _dbContext.Countries
            .ToDictionary(country => country.IsoCode, country => country.Name);

        return countryCodes
            .Select(code => new CountryInfo(
                code,
                dbCountryNames.TryGetValue(code, out var dbName)
                    ? dbName
                    : GetCountryName(code)))
            .OrderBy(country => country.Name)
            .ToList();
    }

    public IList<StateInfo> GetStates(string countryCode)
    {
        return _dbContext.States
            .Where(s => s.Country!.IsoCode == countryCode)
            .OrderBy(s => s.Name)
            .Select(s => new StateInfo(s.Code, s.Name))
            .ToList();
    }

    public static string GetCountryName(string code)
    {
        return CountryNames.TryGetValue(code, out var name) ? name : code;
    }
}
