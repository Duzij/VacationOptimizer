using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Services;

public class CalendarService
{
    private readonly IPublicHolidayService _holidayService;

    public CalendarService(IPublicHolidayService holidayService)
    {
        _holidayService = holidayService;
    }

    public CalendarData BuildCalendar(
        string country,
        int year,
        string? stateCode = null,
        List<CustomFreeDay>? customFreeDays = null,
        List<DateOnly>? ignoredHolidayDates = null,
        List<DateOnly>? neverHolidayDates = null,
        DateOnly? startDate = null,
        DateOnly? endDate = null)
    {
        var ignoredHolidayDateSet = ignoredHolidayDates?.ToHashSet() ?? new HashSet<DateOnly>();
        var neverHolidayDateSet = neverHolidayDates?.ToHashSet() ?? new HashSet<DateOnly>();
        var rangeStart = startDate ?? new DateOnly(year, 1, 1);
        var rangeEnd = endDate ?? new DateOnly(year, 12, 31);
        var start = new DateOnly(rangeStart.Year, 1, 1);
        var end = new DateOnly(rangeEnd.Year, 12, 31);

        var holidays = new List<HolidayInfo>();
        for (int y = start.Year; y <= end.Year; y++)
        {
            holidays.AddRange(_holidayService.GetHolidays(country, y, stateCode)
                .Where(h => !ignoredHolidayDateSet.Contains(h.Date)));
        }

        // Holiday providers can emit two entries for the same date (for example a
        // holiday and its observed substitute), so keep the first entry per date
        // instead of letting ToDictionary throw on duplicate keys.
        var holidayLookup = new Dictionary<DateOnly, HolidayInfo>();
        foreach (var holiday in holidays)
        {
            holidayLookup.TryAdd(holiday.Date, holiday);
        }
        var customFreeDayLookup = customFreeDays?.ToDictionary(c => c.Date, c => c) ?? new Dictionary<DateOnly, CustomFreeDay>();

        var days = new List<CalendarDay>();

        for (var date = start; date <= end; date = date.AddDays(1))
        {
            DayType type;
            string? holidayName = null;
            var today = DateOnly.FromDateTime(DateTime.Today);

            if (date < rangeStart || date > rangeEnd)
            {
                type = DayType.OutOfRange;
            }
            else if (date < today)
            {
                type = DayType.PassedDay;
            }
            else if (neverHolidayDateSet.Contains(date))
            {
                type = DayType.NeverHoliday;
            }
            else if (date == DateOnly.FromDateTime(DateTime.Today))
            {
                type = DayType.Today;
            }
            else if (customFreeDayLookup.TryGetValue(date, out var customDay))
            {
                type = DayType.CustomFreeDay;
                holidayName = customDay.GetTitle();
            }
            else if (holidayLookup.TryGetValue(date, out var holiday))
            {
                type = holiday.Type;
                holidayName = holiday.Name;
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

        return new CalendarData(days);
    }
}
