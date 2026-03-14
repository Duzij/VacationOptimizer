using Microsoft.EntityFrameworkCore;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;
using Xunit;

namespace VacationOptimizer.Test;

public class VacationOptimizerServiceTests
{
    private readonly IPublicHolidayService _holidayService;
    private readonly CalendarService _calendarService;
    private readonly VacationOptimizerService _optimizer;

    private const string DefaultCountry = "ES";
    private readonly int DefaultYear = DateTime.Now.Year + 1;
    private const int DefaultBudget = 25;

    public VacationOptimizerServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var dbContext = new AppDbContext(options);
        dbContext.Database.EnsureCreated();

        _holidayService = new PublicHolidayService(dbContext);
        _calendarService = new CalendarService(_holidayService);
        _optimizer = new VacationOptimizerService(_calendarService);
    }

    [Fact]
    public void Optimize_ZeroVacationDays_NoSelection()
    {
        var result = _optimizer.Optimize(CreateOptimizeRequest(vacationDays: 0));

        Assert.Empty(result.SelectedVacationDays);
        Assert.Equal(0, result.VacationDaysUsed);
    }

    [Fact]
    public void Optimize_DoesNotExceedBudget()
    {
        var result = _optimizer.Optimize(CreateOptimizeRequest(vacationDays: DefaultBudget));

        Assert.True(result.VacationDaysUsed <= DefaultBudget);
        Assert.Equal(result.SelectedVacationDays.Count, result.VacationDaysUsed);
    }

    [Fact]
    public void Optimize_SelectedDaysAreWorkingDays()
    {
        var calendar = BuildDefaultCalendar();
        var weekendAndHolidayDates = calendar
            .Where(d => d.Type == DayType.Weekend || d.Type == DayType.PublicHoliday)
            .Select(d => d.Date)
            .ToHashSet();

        var result = _optimizer.Optimize(CreateOptimizeRequest(vacationDays: DefaultBudget));

        foreach (var vacDay in result.SelectedVacationDays)
        {
            Assert.DoesNotContain(vacDay, weekendAndHolidayDates);
        }
    }

    [Fact]
    public void Optimize_RangesAreContinuous()
    {
        var result = _optimizer.Optimize(CreateOptimizeRequest(vacationDays: DefaultBudget));

        foreach (var range in result.Ranges)
        {
            Assert.True(range.Start <= range.End);
            Assert.True(range.TotalDaysOff >= 1);

            var daysInRange = result.Calendar
                .Where(d => d.Date >= range.Start && d.Date <= range.End)
                .ToList();

            Assert.Equal(range.TotalDaysOff, daysInRange.Count);
            Assert.All(daysInRange, d => Assert.NotEqual(DayType.WorkDay, d.Type));
        }
    }

    [Fact]
    public void BridgeCandidates_IdentifiesBridges()
    {
        var nextYear = DateTime.Now.Year + 1;
        var calendar = new List<CalendarDay>
        {
            CreateCalendarDay(new DateOnly(nextYear, 1, 3), DayType.Weekend),   // Sat
            CreateCalendarDay(new DateOnly(nextYear, 1, 4), DayType.Weekend),   // Sun
            CreateCalendarDay(new DateOnly(nextYear, 1, 5), DayType.WorkDay),   // Mon
            CreateCalendarDay(new DateOnly(nextYear, 1, 6), DayType.WorkDay),   // Tue
            CreateCalendarDay(new DateOnly(nextYear, 1, 7), DayType.Weekend),   // Wed (pretend weekend)
            CreateCalendarDay(new DateOnly(nextYear, 1, 8), DayType.Weekend),   // Thu (pretend weekend)
        };

        var candidates = VacationOptimizerService.FindBridgeCandidates(calendar);

        Assert.Single(candidates);
        Assert.Equal(2, candidates[0].WorkDaysCount);
        Assert.Equal(6, candidates[0].TotalDaysOff);
        Assert.Equal(3.0, candidates[0].Score);
    }

    [Fact]
    public void Optimize_SmallBudget_PicksBestBridge()
    {
        var result = _optimizer.Optimize(CreateOptimizeRequest(vacationDays: 1));

        Assert.True(result.VacationDaysUsed <= 1);
        if (result.SelectedVacationDays.Any())
        {
            var selectedDay = result.SelectedVacationDays[0];
            Assert.True(selectedDay.DayOfWeek is DayOfWeek.Monday or DayOfWeek.Tuesday or
                        DayOfWeek.Wednesday or DayOfWeek.Thursday or DayOfWeek.Friday);
        }
    }

    [Fact]
    public void Optimize_MultipleCountries_AllWork()
    {
        var countries = new[] { "ES", "DE", "US", "FR", "GB", "IT" };

        foreach (var country in countries)
        {
            var result = _optimizer.Optimize(new OptimizeRequest(country, DefaultYear, 10));
            Assert.True(result.VacationDaysUsed <= 10, $"Country {country} exceeded budget");
            Assert.NotNull(result.Calendar);
            Assert.NotEmpty(result.Calendar);
        }
    }

    [Fact]
    public void Optimize_MinimumDaysPerRange_FiltersOutSmallRanges()
    {
        // Test with minimum 4 days per range - should exclude any 3-day ranges
        var result = _optimizer.Optimize(new OptimizeRequest(DefaultCountry, DefaultYear, DefaultBudget, 4));

        // All ranges must have at least 4 days
        Assert.All(result.Ranges, range =>
        {
            Assert.True(range.TotalDaysOff >= 4, $"Range {range.Start} to {range.End} has {range.TotalDaysOff} days, expected at least 4");
        });

        // Verify vacation days are still used
        Assert.True(result.VacationDaysUsed > 0);
    }

    [Fact]
    public void Optimize_MaximumDaysPerRange_FiltersOutLargeRanges()
    {
        // Test with maximum 10 days per range - should exclude any ranges larger than 10 days
        var result = _optimizer.Optimize(new OptimizeRequest(DefaultCountry, DefaultYear, DefaultBudget, MinimumDaysPerRange: 1, MaximumDaysPerRange: 10));

        // All ranges must have at most 10 days
        Assert.All(result.Ranges, range =>
        {
            Assert.True(range.TotalDaysOff <= 10, $"Range {range.Start} to {range.End} has {range.TotalDaysOff} days, expected at most 10");
        });

        // Verify vacation days are still used
        Assert.True(result.VacationDaysUsed > 0);
    }

    [Fact]
    public void Optimize_BothConstraints_FiltersCorrectly()
    {
        // Test with both minimum (4) and maximum (14) days - ranges must be between 4 and 14 days
        var result = _optimizer.Optimize(new OptimizeRequest(DefaultCountry, DefaultYear, DefaultBudget, MinimumDaysPerRange: 4, MaximumDaysPerRange: 14));

        // All ranges must be between 4 and 14 days
        Assert.All(result.Ranges, range =>
        {
            Assert.True(range.TotalDaysOff >= 4, $"Range {range.Start} to {range.End} has {range.TotalDaysOff} days, expected at least 4");
            Assert.True(range.TotalDaysOff <= 14, $"Range {range.Start} to {range.End} has {range.TotalDaysOff} days, expected at most 14");
        });

        // Verify vacation days are still used
        Assert.True(result.VacationDaysUsed > 0);
    }

    [Fact]
    public void Optimize_WithCustomFreeDays_IncludesThemInCalculation()
    {
        // Add custom free days (e.g., birthdays)
        var customFreeDays = new List<CustomFreeDay>
        {
            new(new DateOnly(DefaultYear, 3, 15), "Birthday"),
            new(new DateOnly(DefaultYear, 7, 20), "Anniversary")
        };

        var result = _optimizer.Optimize(new OptimizeRequest(
            DefaultCountry,
            DefaultYear,
            DefaultBudget,
            CustomFreeDays: customFreeDays
        ));

        // Verify custom free days are in the calendar with correct type
        var birthdayDay = GetDayFromCalendar(result.Calendar, new DateOnly(DefaultYear, 3, 15));
        Assert.Equal(DayType.CustomFreeDay, birthdayDay.Type);
        Assert.Equal("Birthday", birthdayDay.HolidayName);
        Assert.Contains(result.Ranges, range => range.Start <= new DateOnly(DefaultYear, 3, 15) && range.End >= new DateOnly(DefaultYear, 3, 15));

        var anniversaryDay = GetDayFromCalendar(result.Calendar, new DateOnly(DefaultYear, 7, 20));
        Assert.Equal(DayType.CustomFreeDay, anniversaryDay.Type);
        Assert.Equal("Anniversary", anniversaryDay.HolidayName);
        Assert.Contains(result.Ranges, range => range.Start <= new DateOnly(DefaultYear, 7, 20) && range.End >= new DateOnly(DefaultYear, 7, 20));
        // Verify optimization still works with custom free days
        Assert.True(result.VacationDaysUsed <= DefaultBudget);
    }

    [Fact]
    public void Optimize_WithCustomFreeDays_AutoGenerateTitles()
    {
        // Add custom free day without explicit title
        var customFreeDays = new List<CustomFreeDay>
        {
            new(new DateOnly(DefaultYear, 4, 10))  // No title provided
        };

        var result = _optimizer.Optimize(new OptimizeRequest(
            DefaultCountry,
            DefaultYear,
            DefaultBudget,
            CustomFreeDays: customFreeDays
        ));

        var customDay = GetDayFromCalendar(result.Calendar, new DateOnly(DefaultYear, 4, 10));
        Assert.Equal(DayType.CustomFreeDay, customDay.Type);
        Assert.Equal("Custom free day (Apr 10)", customDay.HolidayName);  // Auto-generated title
    }

    // Helper methods
    private List<CalendarDay> BuildDefaultCalendar() =>
        _calendarService.BuildCalendar(DefaultCountry, DefaultYear);

    private OptimizeRequest CreateOptimizeRequest(
        string? country = null,
        int? year = null,
        int vacationDays = DefaultBudget,
        int minimumDaysPerRange = 1,
        int maximumDaysPerRange = 365) =>
        new OptimizeRequest(country ?? DefaultCountry, year ?? DefaultYear, vacationDays, minimumDaysPerRange, maximumDaysPerRange);

    private static CalendarDay GetDayFromCalendar(List<CalendarDay> calendar, DateOnly date) =>
        calendar.First(d => d.Date == date);

    private static CalendarDay CreateCalendarDay(DateOnly date, DayType type, string? holidayName = null) =>
        new() { Date = date, Type = type, HolidayName = holidayName };
}
