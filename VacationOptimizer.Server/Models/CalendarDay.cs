namespace VacationOptimizer.Server.Models;

public record CalendarDay
{
    public DateOnly Date { get; init; }
    public DayType Type { get; set; }
    public string? HolidayName { get; init; }
    public bool IsHoliday => Type == DayType.PublicHoliday;

    public bool IsVacation => Type == DayType.Vacation;

    public bool IsCustomFreeDay => Type == DayType.CustomFreeDay;

    public bool IsNeverHoliday => Type == DayType.NeverHoliday;
}
