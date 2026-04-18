using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class UnitedStatesSeedData
{
    public static Country Country => new()
    {
        Id = 3,
        Name = "United States",
        IsoCode = "US"
    };
}
