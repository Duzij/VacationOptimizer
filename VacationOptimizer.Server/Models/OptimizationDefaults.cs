namespace VacationOptimizer.Server.Models;

public static class OptimizationDefaults
{
    public const int VacationDays = 25;
    public const int MinimumDaysPerRange = 4;
    public const int MaximumDaysPerRange = 14;
    public const int MaxUsedResultTokens = 50;

    public static int MinimumYear => DateTime.Today.Year;
    public static int MaximumYear => DateTime.Today.Year + 5;
}
