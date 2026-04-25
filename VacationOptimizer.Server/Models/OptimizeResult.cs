namespace VacationOptimizer.Server.Models;

public record OptimizeResult(
    CalendarData Calendar,
    List<DateOnly> SelectedVacationDays,
    List<VacationRange> Ranges,
    int TotalDaysOff,
    int VacationDaysUsed,
    int PublicHolidaysCount,
    string ResultToken
);
