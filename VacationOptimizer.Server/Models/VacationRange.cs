namespace VacationOptimizer.Server.Models;

public record VacationRange(
    DateOnly Start,
    DateOnly End,
    int TotalDaysOff,
    int VacationDaysUsed
);
