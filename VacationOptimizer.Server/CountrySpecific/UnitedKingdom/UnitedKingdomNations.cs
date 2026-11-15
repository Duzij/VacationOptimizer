using PublicHoliday;
using VacationOptimizer.Server.Services;

namespace VacationOptimizer.Server.CountrySpecific.UnitedKingdom;

public static class UnitedKingdomNations
{
    // England and Wales share the same bank holiday calendar, so they are
    // presented as one selectable nation.
    public static readonly IReadOnlyList<StateInfo> All =
    [
        new("GB-ENG", "England & Wales"),
        new("GB-SCT", "Scotland"),
        new("GB-NIR", "Northern Ireland"),
    ];

    private static readonly Dictionary<string, UKBankHoliday.UkCountries> HolidayRegions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["GB-ENG"] = UKBankHoliday.UkCountries.England,
        ["GB-SCT"] = UKBankHoliday.UkCountries.Scotland,
        ["GB-NIR"] = UKBankHoliday.UkCountries.NorthernIreland,
    };

    public static bool TryGetHolidayRegion(string? nationCode, out UKBankHoliday.UkCountries region)
    {
        region = default;
        return !string.IsNullOrWhiteSpace(nationCode)
            && HolidayRegions.TryGetValue(nationCode.Trim(), out region);
    }
}
