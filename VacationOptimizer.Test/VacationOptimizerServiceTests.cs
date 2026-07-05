using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using VacationOptimizer.Server.Data;
using VacationOptimizer.Server.Models;
using VacationOptimizer.Server.Services;
using Xunit;

namespace VacationOptimizer.Test;

public class VacationOptimizerServiceTests
{
    private readonly IPublicHolidayService _holidayService;
    private readonly CalendarService _calendarService;
    private readonly IResultTokenService _resultTokenService;
    private readonly VacationOptimizerService _optimizer;

    private const string DefaultCountry = "ES";
    private readonly int DefaultYear = DateTime.Now.Year + 1;
    private const int DefaultBudget = 25;

    public VacationOptimizerServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .UseVacationOptimizerSeeding()
            .Options;
        var dbContext = new AppDbContext(options);
        dbContext.Database.EnsureCreated();

        _holidayService = new PublicHolidayService(dbContext);
        _calendarService = new CalendarService(_holidayService);
        _resultTokenService = new ResultTokenService("test-result-token-signing-key");
        _optimizer = new VacationOptimizerService(_calendarService, _resultTokenService, new MemoryCache(new MemoryCacheOptions()), new CalendarSeed());
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

            var daysInRange = result.Calendar.Days
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
    public void BridgeCandidates_NeverHolidayStopsBridgeExpansion()
    {
        var nextYear = DateTime.Now.Year + 1;
        var calendar = new List<CalendarDay>
        {
            CreateCalendarDay(new DateOnly(nextYear, 1, 3), DayType.Weekend),
            CreateCalendarDay(new DateOnly(nextYear, 1, 4), DayType.NeverHoliday),
            CreateCalendarDay(new DateOnly(nextYear, 1, 5), DayType.WorkDay),
            CreateCalendarDay(new DateOnly(nextYear, 1, 6), DayType.Weekend),
        };

        var candidates = VacationOptimizerService.FindBridgeCandidates(calendar);

        Assert.Single(candidates);
        Assert.Equal(2, candidates[0].StartIndex);
        Assert.Equal(2, candidates[0].EndIndex);
        Assert.Equal(1, candidates[0].WorkDaysCount);
        Assert.Equal(2, candidates[0].TotalDaysOff);
    }

    [Fact]
    public void BridgeCandidates_AddsCombinedBridgeAroundNeverHoliday()
    {
        var nextYear = DateTime.Now.Year + 1;
        var calendar = new List<CalendarDay>
        {
            CreateCalendarDay(new DateOnly(nextYear, 1, 3), DayType.Weekend),
            CreateCalendarDay(new DateOnly(nextYear, 1, 4), DayType.WorkDay),
            CreateCalendarDay(new DateOnly(nextYear, 1, 5), DayType.NeverHoliday),
            CreateCalendarDay(new DateOnly(nextYear, 1, 6), DayType.WorkDay),
            CreateCalendarDay(new DateOnly(nextYear, 1, 7), DayType.Weekend),
        };

        var candidates = VacationOptimizerService.FindBridgeCandidates(calendar);

        Assert.Equal(3, candidates.Count);
        Assert.Contains(candidates, candidate =>
            candidate.StartIndex == 1 &&
            candidate.EndIndex == 1 &&
            candidate.WorkDaysCount == 1 &&
            candidate.TotalDaysOff == 2);
        Assert.Contains(candidates, candidate =>
            candidate.StartIndex == 3 &&
            candidate.EndIndex == 3 &&
            candidate.WorkDaysCount == 1 &&
            candidate.TotalDaysOff == 2);
        Assert.Contains(candidates, candidate =>
            candidate.StartIndex == 1 &&
            candidate.EndIndex == 3 &&
            candidate.WorkDaysCount == 2 &&
            candidate.TotalDaysOff == 4);
    }

    [Fact]
    public void OptimizeCalendar_NeverHolidayIsNotIncludedInRanges()
    {
        var nextYear = DateTime.Now.Year + 1;
        var neverHoliday = new DateOnly(nextYear, 1, 5);
        var calendar = new CalendarData(new List<CalendarDay>
        {
            CreateCalendarDay(new DateOnly(nextYear, 1, 3), DayType.Weekend),
            CreateCalendarDay(new DateOnly(nextYear, 1, 4), DayType.WorkDay),
            CreateCalendarDay(neverHoliday, DayType.NeverHoliday),
            CreateCalendarDay(new DateOnly(nextYear, 1, 6), DayType.WorkDay),
            CreateCalendarDay(new DateOnly(nextYear, 1, 7), DayType.Weekend),
        });

        var result = InvokeOptimizeCalendar(
            calendar,
            CreateOptimizeRequest(year: nextYear, vacationDays: 2),
            new Random(0));

        Assert.DoesNotContain(neverHoliday, result.SelectedVacationDays);
        Assert.Equal(DayType.NeverHoliday, GetDayFromCalendar(result.Calendar.Days, neverHoliday).Type);
        Assert.DoesNotContain(result.Ranges, range => range.Start <= neverHoliday && range.End >= neverHoliday);
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
            Assert.NotEmpty(result.Calendar.Days);
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
        var birthdayDay = GetDayFromCalendar(result.Calendar.Days, new DateOnly(DefaultYear, 3, 15));
        Assert.Equal(DayType.CustomFreeDay, birthdayDay.Type);
        Assert.Equal("Birthday", birthdayDay.HolidayName);
        Assert.Contains(result.Ranges, range => range.Start <= new DateOnly(DefaultYear, 3, 15) && range.End >= new DateOnly(DefaultYear, 3, 15));

        var anniversaryDay = GetDayFromCalendar(result.Calendar.Days, new DateOnly(DefaultYear, 7, 20));
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

        var customDay = GetDayFromCalendar(result.Calendar.Days, new DateOnly(DefaultYear, 4, 10));
        Assert.Equal(DayType.CustomFreeDay, customDay.Type);
        Assert.Equal("Custom free day (Apr 10)", customDay.HolidayName);  // Auto-generated title
    }

    [Fact]
    public void Optimize_WithIgnoredHolidayDates_RemovesHolidayFromCalendar()
    {
        var ignoredHolidayDate = new DateOnly(DefaultYear, 1, 1);

        var result = _optimizer.Optimize(new OptimizeRequest(
            DefaultCountry,
            DefaultYear,
            DefaultBudget,
            IgnoredHolidayDates: new List<DateOnly> { ignoredHolidayDate }
        ));

        var ignoredHoliday = GetDayFromCalendar(result.Calendar.Days, ignoredHolidayDate);
        Assert.NotEqual(DayType.PublicHoliday, ignoredHoliday.Type);
        Assert.Null(ignoredHoliday.HolidayName);
    }

    [Fact]
    public void Optimize_WithLockedVacationDates_PreservesLockedDays()
    {
        var lockedDate = BuildDefaultCalendar().First(day => day.Type == DayType.WorkDay).Date;

        var result = _optimizer.Optimize(CreateOptimizeRequest(
            vacationDays: 1,
            lockedVacationDates: new List<DateOnly> { lockedDate }));

        var lockedDay = GetDayFromCalendar(result.Calendar.Days, lockedDate);
        Assert.Contains(lockedDate, result.SelectedVacationDays);
        Assert.Equal(DayType.Vacation, lockedDay.Type);
        Assert.True(lockedDay.IsLockedVacationDay);
        Assert.Equal(1, result.VacationDaysUsed);
    }

    [Fact]
    public void Optimize_WithLockedVacationDates_KeepsLockedDaysAcrossShuffle()
    {
        var lockedDate = BuildDefaultCalendar().First(day => day.Type == DayType.WorkDay).Date;
        var request = CreateOptimizeRequest(
            vacationDays: 5,
            lockedVacationDates: new List<DateOnly> { lockedDate });

        var firstResult = _optimizer.Optimize(request);
        var nextResult = _optimizer.Optimize(request with
        {
            UsedResultTokens = new List<string> { firstResult.ResultToken }
        });

        Assert.Contains(lockedDate, firstResult.SelectedVacationDays);
        Assert.Contains(lockedDate, nextResult.SelectedVacationDays);
        Assert.True(GetDayFromCalendar(nextResult.Calendar.Days, lockedDate).IsLockedVacationDay);
    }

    [Fact]
    public void Optimize_WithLockedVacationDates_KeepsLockedRangeVisibleEvenBelowMinimum()
    {
        var lockedDate = BuildDefaultCalendar().First(day => day.Type == DayType.WorkDay).Date;

        var result = CreateOptimizerRequestForLockedRangeMinimumScenario(lockedDate);

        Assert.Contains(result.SelectedVacationDays, date => date == lockedDate);
        Assert.Contains(result.Ranges, range => range.Start <= lockedDate && range.End >= lockedDate);
    }

    [Fact]
    public void Optimize_ResultToken_IsSignedAndStableForReuse()
    {
        var request = CreateOptimizeRequest(vacationDays: DefaultBudget);

        var firstResult = _optimizer.Optimize(request);
        var nextResult = _optimizer.Optimize(request with
        {
            UsedResultTokens = new List<string> { firstResult.ResultToken }
        });
        var firstPayload = _resultTokenService.ParseToken(firstResult.ResultToken);
        var nextPayload = _resultTokenService.ParseToken(nextResult.ResultToken);

        Assert.Equal(0, firstPayload.Attempt);
        Assert.Equal(1, nextPayload.Attempt);
        Assert.Matches("^[0-9a-f]{16}$", firstPayload.OutputSeed);
        Assert.NotEqual(firstPayload.OutputSeed, nextPayload.OutputSeed);
    }

    [Fact]
    public void Optimize_DoesNotReturnDuplicateOutputForDifferentAttempts()
    {
        var request = CreateOptimizeRequest(vacationDays: 0);
        var firstResult = _optimizer.Optimize(request);

        Assert.Throws<OptimizationResultUnavailableException>(() => _optimizer.Optimize(request with
        {
            UsedResultTokens = new List<string> { firstResult.ResultToken }
        }));
    }

    [Fact]
    public void Optimize_RepeatedShuffleForLockedSpainCityRequest_ReturnsUniqueOutputSeeds()
    {
        var lockedDates = new List<DateOnly>
        {
            new(DefaultYear, 9, 21),
            new(DefaultYear, 9, 22),
            new(DefaultYear, 9, 23),
            new(DefaultYear, 9, 25),
            new(DefaultYear, 9, 28),
            new(DefaultYear, 9, 29),
            new(DefaultYear, 9, 30),
            new(DefaultYear, 10, 1),
            new(DefaultYear, 10, 2),
        };

        var request = new OptimizeRequest(
            Country: DefaultCountry,
            Year: DefaultYear,
            VacationDays: 16,
            MinimumDaysPerRange: 4,
            MaximumDaysPerRange: 14,
            State: "ES-CT-BCN",
            LockedVacationDates: lockedDates);

        var seenOutputSeeds = new HashSet<string>(StringComparer.Ordinal);
        var usedResultTokens = new List<string>();

        while (usedResultTokens.Count < OptimizationDefaults.MaxUsedResultTokens)
        {
            OptimizeResult result;
            try
            {
                result = _optimizer.Optimize(request with
                {
                    UsedResultTokens = usedResultTokens.Count > 0 ? new List<string>(usedResultTokens) : null
                });
            }
            catch (OptimizationResultUnavailableException)
            {
                break;
            }

            var payload = _resultTokenService.ParseToken(result.ResultToken);
            Assert.True(
                seenOutputSeeds.Add(payload.OutputSeed),
                $"Received duplicate output seed '{payload.OutputSeed}' after {usedResultTokens.Count} prior results.");

            usedResultTokens.Add(result.ResultToken);
        }

        Assert.NotEmpty(usedResultTokens);
        Assert.Equal(seenOutputSeeds.Count, usedResultTokens.Count);
    }

    [Fact]
    public void Optimize_SeedToken_ReplaysSameAttemptForMatchingRequest()
    {
        var request = CreateOptimizeRequest(vacationDays: DefaultBudget);

        var firstResult = _optimizer.Optimize(request);
        var shuffledResult = _optimizer.Optimize(request with
        {
            UsedResultTokens = new List<string> { firstResult.ResultToken }
        });
        var replayedResult = _optimizer.Optimize(request with
        {
            SeedToken = firstResult.ResultToken,
            UsedResultTokens = new List<string> { firstResult.ResultToken, shuffledResult.ResultToken }
        });

        Assert.Equal(firstResult.ResultToken, replayedResult.ResultToken);
        Assert.Equal(firstResult.SelectedVacationDays, replayedResult.SelectedVacationDays);
    }

    [Fact]
    public void Optimize_ResultToken_TamperIsRejected()
    {
        var request = CreateOptimizeRequest(vacationDays: DefaultBudget);
        var firstResult = _optimizer.Optimize(request);
        var tamperedToken = TamperToken(firstResult.ResultToken);

        Assert.Throws<ResultTokenException>(() => _optimizer.Optimize(request with
        {
            UsedResultTokens = new List<string> { tamperedToken }
        }));
    }

    [Fact]
    public void Optimize_ResultToken_ForDifferentRequestIsIgnored()
    {
        var firstRequest = CreateOptimizeRequest(vacationDays: DefaultBudget);
        var differentRequest = CreateOptimizeRequest(vacationDays: DefaultBudget - 1);
        var firstResult = _optimizer.Optimize(firstRequest);

        var differentResult = _optimizer.Optimize(differentRequest with
        {
            UsedResultTokens = new List<string> { firstResult.ResultToken }
        });
        var payload = _resultTokenService.ParseToken(differentResult.ResultToken);

        Assert.Equal(0, payload.Attempt);
    }

    [Fact]
    public void Optimize_ResultToken_ResumesAfterMaxMatchingAttempt()
    {
        var request = CreateOptimizeRequest(vacationDays: DefaultBudget);
        var firstPayload = _resultTokenService.ParseToken(_optimizer.Optimize(request).ResultToken);
        var futureToken = _resultTokenService.CreateToken(OptimizationDefaults.MaxUsedResultTokens, "ffffffffffffffff", firstPayload.RequestFingerprint);

        Assert.Throws<OptimizationResultUnavailableException>(() => _optimizer.Optimize(request with
        {
            UsedResultTokens = Enumerable.Repeat(futureToken, 1).ToList()
        }));
    }

    [Fact]
    public void Optimize_UsedResultTokens_RejectsTooManyTokens()
    {
        var request = CreateOptimizeRequest(vacationDays: DefaultBudget);
        var token = _optimizer.Optimize(request).ResultToken;

        Assert.Throws<OptimizationResultUnavailableException>(() => _optimizer.Optimize(request with
        {
            UsedResultTokens = Enumerable.Repeat(token, OptimizationDefaults.MaxUsedResultTokens + 1).ToList()
        }));
    }

    [Fact]
    public void Optimize_ResultToken_RejectsOutOfRangeAttempt()
    {
        var request = CreateOptimizeRequest(vacationDays: DefaultBudget);
        var payload = _resultTokenService.ParseToken(_optimizer.Optimize(request).ResultToken);
        var outOfRangeToken = _resultTokenService.CreateToken(10_001, "ffffffffffffffff", payload.RequestFingerprint);

        Assert.Throws<ArgumentException>(() => _optimizer.Optimize(request with
        {
            UsedResultTokens = new List<string> { outOfRangeToken }
        }));
    }

    [Fact]
    public void Optimize_ReturnsUnavailableWhenAttemptWindowIsExhausted()
    {
        var request = CreateOptimizeRequest(vacationDays: DefaultBudget);
        var payload = _resultTokenService.ParseToken(_optimizer.Optimize(request).ResultToken);
        var terminalToken = _resultTokenService.CreateToken(10_000, "ffffffffffffffff", payload.RequestFingerprint);

        Assert.Throws<ArgumentException>(() => _optimizer.Optimize(request with
        {
            UsedResultTokens = new List<string> { terminalToken }
        }));
    }

    // Helper methods
    private List<CalendarDay> BuildDefaultCalendar() =>
        _calendarService.BuildCalendar(DefaultCountry, DefaultYear).Days;

    private OptimizeRequest CreateOptimizeRequest(
        string? country = null,
        int? year = null,
        int vacationDays = DefaultBudget,
        int minimumDaysPerRange = 1,
        int maximumDaysPerRange = 365,
        List<DateOnly>? lockedVacationDates = null) =>
        new OptimizeRequest(
            country ?? DefaultCountry,
            year ?? DefaultYear,
            vacationDays,
            minimumDaysPerRange,
            maximumDaysPerRange,
            null,
            null,
            null,
            null,
            null,
            [],
            lockedVacationDates);

    private OptimizeResult CreateOptimizerRequestForLockedRangeMinimumScenario(DateOnly lockedDate) =>
        _optimizer.Optimize(CreateOptimizeRequest(
            vacationDays: 1,
            minimumDaysPerRange: 4,
            maximumDaysPerRange: 14,
            lockedVacationDates: new List<DateOnly> { lockedDate }));

    private static CalendarDay GetDayFromCalendar(List<CalendarDay> calendar, DateOnly date) =>
        calendar.First(d => d.Date == date);

    private static CalendarDay CreateCalendarDay(DateOnly date, DayType type, string? holidayName = null) =>
        new() { Date = date, Type = type, HolidayName = holidayName };

    private static OptimizeResult InvokeOptimizeCalendar(CalendarData calendar, OptimizeRequest request, Random rng)
    {
        var method = typeof(VacationOptimizerService).GetMethod(
            "OptimizeCalendar",
            BindingFlags.NonPublic | BindingFlags.Static);

        Assert.NotNull(method);

        return Assert.IsType<OptimizeResult>(method.Invoke(null, [calendar, request, rng]));
    }

    private static string TamperToken(string token)
    {
        var replacement = token[^1] == 'A' ? 'B' : 'A';
        return token[..^1] + replacement;
    }
}
