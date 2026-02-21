using PublicHoliday;
using System.Reflection;

namespace VacationOptimizer.Server.Services;

public record HolidayInfo(DateOnly Date, string Name);

public interface IPublicHolidayService
{
    IList<HolidayInfo> GetHolidays(string countryCode, int year);
    IList<string> GetSupportedCountries();
}

public class PublicHolidayService : IPublicHolidayService
{
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

    public PublicHolidayService()
    {
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

    public IList<HolidayInfo> GetHolidays(string countryCode, int year)
    {
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
        return _countryFactories.Keys.OrderBy(k => k).ToList();
    }

    public static string GetCountryName(string code)
    {
        return CountryNames.TryGetValue(code, out var name) ? name : code;
    }
}
