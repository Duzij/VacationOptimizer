using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Services;

public class CalendarSeed
{
    /// <summary>
    /// Generates a seed from any number of days. 
    /// The length of the consecutive days of the same type is stored as a byte, so runs longer than 255 days are split.
    /// </summary>
    /// <param name="days"></param>
    /// <returns></returns>
    public string GetCalendarSeed(List<CalendarDay> days)
    {
        ArgumentNullException.ThrowIfNull(days);

        var categoryToCount = new List<(byte category, byte count)>();

        foreach (var day in days)
        {
            var category = GetTypeFromDay(day);

            if (categoryToCount.Count > 0)
            {
                var previous = categoryToCount[^1];
                if (previous.category == category && previous.count < byte.MaxValue)
                {
                    categoryToCount[^1] = (previous.category, (byte)(previous.count + 1));
                    continue;
                }
            }

            categoryToCount.Add((category, 1));
        }

        var byteSeed = new byte[categoryToCount.Count * 2];
        for (int i = 0; i < categoryToCount.Count; i++)
        {
            byteSeed[i * 2] = categoryToCount[i].category;
            byteSeed[i * 2 + 1] = categoryToCount[i].count;
        }

        return Convert.ToBase64String(byteSeed);
    }

    public List<CalendarDay> GetCalendarDaysFromSeed(string seed)
    {
        ArgumentNullException.ThrowIfNull(seed);

        var byteSeed = Convert.FromBase64String(seed);
        if (byteSeed.Length % 2 != 0)
        {
            throw new FormatException("Calendar seed must contain category/count byte pairs.");
        }

        var calendarDays = new List<CalendarDay>();

        for (int i = 0; i < byteSeed.Length; i += 2)
        {
            byte category = byteSeed[i];
            byte count = byteSeed[i + 1];
            if (count == 0)
            {
                throw new FormatException("Calendar seed cannot contain a zero-length run.");
            }

            for (int j = 0; j < count; j++)
            {
                calendarDays.Add(GetCalendarDayFromType(category));
            }
        }

        return calendarDays;
    }

    private CalendarDay GetCalendarDayFromType(byte category)
    {
        if (!Enum.IsDefined(typeof(DayType), (int)category))
        {
            throw new ArgumentOutOfRangeException(nameof(category), category, null);
        }

        return new CalendarDay { Type = (DayType)category };
    }

    private static byte GetTypeFromDay(CalendarDay day)
    {
        if (!Enum.IsDefined(day.Type))
        {
            throw new ArgumentOutOfRangeException(nameof(day), day.Type, null);
        }

        return (byte)day.Type;
    }
}
