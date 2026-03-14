using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;
using Xunit;

namespace VacationOptimizer.Test;

public class CalendarServiceTests
{
    private readonly IPublicHolidayService _holidayService;
    private readonly CalendarService _calendarService;

    private const string DefaultCountry = "ES";
    private readonly int DefaultYear = DateTime.Now.Year + 1;

    public CalendarServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new AppDbContext(options);
        dbContext.Database.EnsureCreated();

        _holidayService = new PublicHolidayService(dbContext);
        _calendarService = new CalendarService(_holidayService);
    }

    [Fact]
    public void BuildCalendar_HasCorrectDayCount()
    {
        var calendar = _calendarService.BuildCalendar(DefaultCountry, DefaultYear);
        int expectedDays = DateTime.IsLeapYear(DefaultYear) ? 366 : 365;
        Assert.Equal(expectedDays, calendar.Count);
    }

    [Fact]
    public void BuildCalendar_WeekendsAreMarked()
    {
        var calendar = _calendarService.BuildCalendar(DefaultCountry, DefaultYear);

        // Find the first Saturday of the year
        var firstSaturday = calendar.First(d => d.Date.DayOfWeek == DayOfWeek.Saturday).Date;
        AssertDayType(calendar, firstSaturday, DayType.Weekend);

        // Find the first Sunday of the year
        var firstSunday = calendar.First(d => d.Date.DayOfWeek == DayOfWeek.Sunday).Date;
        AssertDayType(calendar, firstSunday, DayType.Weekend);
    }

    [Fact]
    public void BuildCalendar_OnlyOneTodayDayIsMarked()
    {
        var calendar = _calendarService.BuildCalendar(DefaultCountry, DateTime.Now.Year);
        var todayCount = calendar.Count(d => d.Type == DayType.Today);
        Assert.Equal(1, todayCount);
    }

    [Fact]
    public void BuildCalendar_HolidaysAreMarked()
    {
        var calendar = _calendarService.BuildCalendar(DefaultCountry, DefaultYear);

        var newYear = GetDayFromCalendar(calendar, new DateOnly(DefaultYear, 1, 1));
        Assert.Equal(DayType.PublicHoliday, newYear.Type);
        Assert.NotNull(newYear.HolidayName);
    }

    [Fact]
    public void BuildCalendar_IgnoredHolidayDates_AreNotMarkedAsHolidays()
    {
        var ignoredDate = new DateOnly(DefaultYear, 1, 1);

        var calendar = _calendarService.BuildCalendar(
            DefaultCountry,
            DefaultYear,
            ignoredHolidayDates: new List<DateOnly> { ignoredDate });

        var newYear = GetDayFromCalendar(calendar, ignoredDate);
        Assert.NotEqual(DayType.PublicHoliday, newYear.Type);
        Assert.Null(newYear.HolidayName);
    }

    private static void AssertDayType(List<CalendarDay> calendar, DateOnly date, DayType expectedType) =>
        Assert.Equal(expectedType, GetDayFromCalendar(calendar, date).Type);

    private static CalendarDay GetDayFromCalendar(List<CalendarDay> calendar, DateOnly date) =>
        calendar.First(d => d.Date == date);
}
