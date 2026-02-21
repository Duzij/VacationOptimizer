namespace VacationOptimizer.Server.Models;

public record CalendarDay
{
    public DateOnly Date { get; init; }
    public DayType Type { get; set; }
    public string? HolidayName { get; init; }
}
