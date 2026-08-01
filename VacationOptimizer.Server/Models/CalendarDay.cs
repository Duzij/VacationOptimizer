namespace VacationOptimizer.Server.Models;

public record CalendarDay
{
    public DateOnly Date { get; init; }
    public DayType Type { get; set; }
    public string? HolidayName { get; init; }
    public bool IsLockedVacationDay { get; init; }
    public bool IsHoliday => Type is DayType.PublicHoliday or DayType.CollectiveLeave;

    public bool IsVacation => Type == DayType.Vacation;

    public bool IsCustomFreeDay => Type == DayType.CustomFreeDay;

    public bool IsNeverHoliday => Type == DayType.NeverHoliday;
}
