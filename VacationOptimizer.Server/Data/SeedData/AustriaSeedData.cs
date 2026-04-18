using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Data.SeedData;

public static class AustriaSeedData
{
    public static Country Country => new()
    {
        Id = 1,
        Name = "Austria",
        IsoCode = "AT"
    };
}
