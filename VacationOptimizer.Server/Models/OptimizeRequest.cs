namespace VacationOptimizer.Server.Models;

public record OptimizeRequest(
    string Country,
    int Year,
    int VacationDays,
    int MinimumDaysPerRange = 1,
    int MaximumDaysPerRange = 365,
    List<CustomFreeDay>? CustomFreeDays = null
);

