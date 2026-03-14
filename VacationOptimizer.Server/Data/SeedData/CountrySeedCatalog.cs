using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class CountrySeedCatalog
{
    public static IReadOnlyList<Country> Countries => new[]
    {
        AustriaSeedData.Country,
        GermanySeedData.Country,
        UnitedStatesSeedData.Country
    };

    public static IReadOnlyList<State> States =>
        AustriaSeedData.States
            .Concat(GermanySeedData.States)
            .Concat(UnitedStatesSeedData.States)
            .ToArray();

    public static IReadOnlyList<Holiday> Holidays =>
        AustriaSeedData.Holidays
            .Concat(GermanySeedData.Holidays)
            .Concat(UnitedStatesSeedData.Holidays)
            .ToArray();
}
