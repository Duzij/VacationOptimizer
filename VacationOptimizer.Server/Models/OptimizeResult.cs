namespace VacationOptimizer.Server.Models;

public record OptimizeResult(
    List<CalendarDay> Calendar,
    List<DateOnly> SelectedVacationDays,
    List<VacationRange> Ranges,
    int TotalDaysOff,
    int VacationDaysUsed,
    int PublicHolidaysCount
);
