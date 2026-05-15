using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;

namespace VacationOptimizer.Test;

public class CalendarSeedTests
{
    [Fact]
    public void GetCalendarDaysFromSeed_RoundTripsEveryCalendarDayType()
    {
        var seed = new CalendarSeed();
        var days = Enum.GetValues<DayType>()
            .Select(type => new CalendarDay { Type = type })
            .ToList();

        var encoded = seed.GetCalendarSeed(days);
        var decoded = seed.GetCalendarDaysFromSeed(encoded);

        Assert.Equal(days.Select(day => day.Type), decoded.Select(day => day.Type));
    }

    [Fact]
    public void GetCalendarSeed_SplitsRunsLongerThanByteMaxValue()
    {
        var seed = new CalendarSeed();
        var days = Enumerable.Range(0, 300)
            .Select(_ => new CalendarDay { Type = DayType.WorkDay })
            .ToList();

        var encoded = seed.GetCalendarSeed(days);
        var decoded = seed.GetCalendarDaysFromSeed(encoded);

        Assert.Equal(300, decoded.Count);
        Assert.All(decoded, day => Assert.Equal(DayType.WorkDay, day.Type));
    }

    [Fact]
    public void GetCalendarDaysFromSeed_RoundTripsEmptyCalendar()
    {
        var seed = new CalendarSeed();

        var encoded = seed.GetCalendarSeed([]);
        var decoded = seed.GetCalendarDaysFromSeed(encoded);

        Assert.Empty(decoded);
    }
}
