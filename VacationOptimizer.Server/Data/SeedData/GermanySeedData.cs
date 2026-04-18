using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class GermanySeedData
{
    public static Country Country => new()
    {
        Id = 2,
        Name = "Germany",
        IsoCode = "DE"
    };
}
