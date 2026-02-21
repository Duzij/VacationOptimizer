using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Services;

public class CalendarService
{
    private readonly IPublicHolidayService _holidayService;

    public CalendarService(IPublicHolidayService holidayService)
    {
        _holidayService = holidayService;
    }

    public List<CalendarDay> BuildCalendar(string country, int year, List<CustomFreeDay>? customFreeDays = null)
    {
        var holidays = _holidayService.GetHolidays(country, year);
        var holidayLookup = holidays.ToDictionary(h => h.Date, h => h.Name);
        var customFreeDayLookup = customFreeDays?.ToDictionary(c => c.Date, c => c) ?? new Dictionary<DateOnly, CustomFreeDay>();

        var days = new List<CalendarDay>();
        var start = new DateOnly(year, 1, 1);
        var end = new DateOnly(year, 12, 31);

        for (var date = start; date <= end; date = date.AddDays(1))
        {
            DayType type;
            string? holidayName = null;

            if (customFreeDayLookup.TryGetValue(date, out var customDay))
            {
                type = DayType.CustomFreeDay;
                holidayName = customDay.GetTitle();
            }
            else if (holidayLookup.TryGetValue(date, out var name))
            {
                type = DayType.PublicHoliday;
                holidayName = name;
            }
            else if (date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            {
                type = DayType.Weekend;
            }
            else
            {
                type = DayType.WorkDay;
            }

            days.Add(new CalendarDay
            {
                Date = date,
                Type = type,
                HolidayName = holidayName
            });
        }

        return days;
    }
}
