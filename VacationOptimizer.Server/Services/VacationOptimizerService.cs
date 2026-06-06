using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Services;

public class VacationOptimizerService
{
    private readonly CalendarService _calendarService;
    private readonly IResultTokenService _resultTokenService;
    private readonly IMemoryCache _memoryCache;

    public VacationOptimizerService(CalendarService calendarService, IResultTokenService resultTokenService, IMemoryCache memoryCache)
    {
        _calendarService = calendarService;
        _resultTokenService = resultTokenService;
        _memoryCache = memoryCache;
    }

    public OptimizeResult Optimize(OptimizeRequest request)
    {
        if (request.UsedResultTokens?.Count > OptimizationDefaults.MaxUsedResultTokens)
        {
            throw new OptimizationResultUnavailableException($"At most {OptimizationDefaults.MaxUsedResultTokens} used result tokens can be supplied.");
        }

        var requestFingerprint = ComputeRequestFingerprint(request);
        var matchingTokens = ParseMatchingTokens(request.UsedResultTokens, requestFingerprint);
        if(matchingTokens.Any(token => token.Attempt >= OptimizationDefaults.MaxUsedResultTokens))
        {
            throw new OptimizationResultUnavailableException("No new optimization result is available. Try changing the planner settings.");
        }

        var generatedResults = new List<OptimizeResult>();

        var results =_memoryCache.GetOrCreate(requestFingerprint, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return GenerateMaxAttemptResults(request, generatedResults, requestFingerprint);
        });

        return results?.FirstOrDefault(r => !request.UsedResultTokens?.Contains(r.ResultToken) ?? true) ??
            throw new OptimizationResultUnavailableException("No new optimization result is available. Try changing the planner settings.");
    }

    private List<OptimizeResult> GenerateMaxAttemptResults(OptimizeRequest request, List<OptimizeResult> generatedResults, string requestFingerprint)
    {
        var initialCalendar = _calendarService.BuildCalendar(
            request.Country,
            request.Year,
            request.State,
            request.CustomFreeDays,
            request.IgnoredHolidayDates,
            request.NeverHolidayDates);

        // Parallel.For(0, OptimizationDefaults.MaxUsedResultTokens, attempt =>
        // {
        //     var calendar = CloneCalendar(initialCalendar);
        //     var rng = new Random(attempt);
        //     var result = OptimizeCalendar(calendar, request, rng);
        //     var outputSeed = ComputeOutputSeed(result);
        //     var resultToken = _resultTokenService.CreateToken(attempt, outputSeed, requestFingerprint);
        //     result = result with { ResultToken = resultToken };
        //     generatedResults.Add(result);
        // });

        for (int attempt = 0; attempt < OptimizationDefaults.MaxUsedResultTokens; attempt++)
        {
            var calendar = CloneCalendar(initialCalendar);
            var rng = new Random(attempt);
            var result = OptimizeCalendar(calendar, request, rng);
            var outputSeed = ComputeOutputSeed(result);
            var resultToken = _resultTokenService.CreateToken(attempt, outputSeed, requestFingerprint);
            result = result with { ResultToken = resultToken };
            generatedResults.Add(result);
        }

        return generatedResults;
    }

    private static OptimizeResult OptimizeCalendar(CalendarData calendar, OptimizeRequest request, Random rng)
    {
        int lockedVacationDays = MarkLockedVacationDays(calendar.Days, request.LockedVacationDates);
        int remainingBudget = Math.Max(0, request.VacationDays - lockedVacationDays);

        if (remainingBudget <= 0)
        {
            return BuildResult(calendar, request.MinimumDaysPerRange, request.MaximumDaysPerRange);
        }

        while (remainingBudget > 0)
        {
            var candidates = FindBridgeCandidates(calendar.Days)
                .Where(c => c.WorkDaysCount <= remainingBudget)
                .Where(c => c.TotalDaysOff >= request.MinimumDaysPerRange && c.TotalDaysOff <= request.MaximumDaysPerRange)
                .OrderByDescending(c => c.Score)
                .ThenBy(c => c.WorkDaysCount)
                .Take(5)
                .ToList();

            if (candidates.Count == 0)
                break;

            var selected = candidates[rng.Next(candidates.Count)];

            MarkSegmentAsVacation(calendar.Days, selected.StartIndex, selected.EndIndex);
            remainingBudget -= selected.WorkDaysCount;
        }

        return BuildResult(calendar, request.MinimumDaysPerRange, request.MaximumDaysPerRange);
    }

    private static CalendarData CloneCalendar(CalendarData calendar)
    {
        var clonedDays = calendar.Days.Select(day => day with { }).ToList();
        return new CalendarData(clonedDays);
    }

    /// <summary>
    /// Finds working-day bridge candidates between days off.
    /// Never-vacation days are blockers for final ranges, but they also join adjacent
    /// working-day bridge candidates so the optimizer can choose both sides together.
    /// </summary>
    public static List<BridgeCandidate> FindBridgeCandidates(List<CalendarDay> calendar)
    {
        var candidates = new List<BridgeCandidate>();
        var segments = FindContiguousSegments(calendar, IsWorkDay);
        var candidateKeys = new HashSet<(int Start, int End)>();

        foreach (var segment in segments)
        {
            AddBridgeCandidate(calendar, candidates, candidateKeys, segment.Start, segment.End);
        }

        for (int i = 0; i < segments.Count - 1; i++)
        {
            var left = segments[i];
            var right = segments[i + 1];
            var gapContainsNeverVacationDay = calendar
                .Skip(left.End + 1)
                .Take(right.Start - left.End - 1)
                .Any(IsNeverVacationDay);

            if (gapContainsNeverVacationDay)
            {
                AddBridgeCandidate(calendar, candidates, candidateKeys, left.Start, right.End);
            }
        }

        return candidates;
    }

    /// <summary>
    /// Adds a candidate covering the supplied calendar indexes.
    /// Only workdays count against the vacation budget; never-vacation days inside the
    /// candidate are not selected and are excluded from the candidate's total days off.
    /// </summary>
    private static void AddBridgeCandidate(
        List<CalendarDay> calendar,
        List<BridgeCandidate> candidates,
        HashSet<(int Start, int End)> candidateKeys,
        int startIndex,
        int endIndex)
    {
        if (!candidateKeys.Add((startIndex, endIndex)))
        {
            return;
        }

        int workDaysCount = calendar
            .Skip(startIndex)
            .Take(endIndex - startIndex + 1)
            .Count(IsWorkDay);

        if (workDaysCount == 0)
        {
            return;
        }

        int clusterStart = startIndex;
        int clusterEnd = endIndex;

        while (clusterStart > 0 && IsRangeDay(calendar[clusterStart - 1]))
        {
            clusterStart--;
        }

        while (clusterEnd < calendar.Count - 1 && IsRangeDay(calendar[clusterEnd + 1]))
        {
            clusterEnd++;
        }

        int totalDaysOff = calendar
            .Skip(clusterStart)
            .Take(clusterEnd - clusterStart + 1)
            .Count(day => !IsNeverVacationDay(day));
        double score = (double)totalDaysOff / workDaysCount;

        candidates.Add(new BridgeCandidate(
            StartIndex: startIndex,
            EndIndex: endIndex,
            WorkDaysCount: workDaysCount,
            TotalDaysOff: totalDaysOff,
            Score: score
        ));
    }

    private static OptimizeResult BuildResult(CalendarData calendar, int minimumDaysPerRange = 1, int maximumDaysPerRange = 365)
    {
        var selectedVacationDays = calendar.Days
            .Where(d => d.Type == DayType.Vacation)
            .Select(d => d.Date)
            .ToList();

        var ranges = BuildRanges(calendar.Days, minimumDaysPerRange, maximumDaysPerRange);
        int totalDaysOff = ranges.Sum(r => r.TotalDaysOff);
        int publicHolidaysCount = calendar.Days.Count(d => d.Type == DayType.PublicHoliday);

        var result = new OptimizeResult(
            Calendar: calendar,
            SelectedVacationDays: selectedVacationDays,
            Ranges: ranges,
            TotalDaysOff: totalDaysOff,
            VacationDaysUsed: selectedVacationDays.Count,
            PublicHolidaysCount: publicHolidaysCount,
            ResultToken: string.Empty
        );

        return result;
    }

    private List<ResultTokenPayload> ParseMatchingTokens(List<string>? usedResultTokens, string requestFingerprint)
    {
        if (usedResultTokens is null || usedResultTokens.Count == 0)
        {
            return [];
        }

        var matchingTokens = new List<ResultTokenPayload>();

        foreach (var token in usedResultTokens)
        {
            var payload = _resultTokenService.ParseToken(token);
            if (payload.Attempt < 0 || payload.Attempt > OptimizationDefaults.MaxUsedResultTokens)
            {
                throw new ArgumentException("Result token attempt is out of range.");
            }

            if (string.Equals(payload.RequestFingerprint, requestFingerprint, StringComparison.Ordinal))
            {
                matchingTokens.Add(payload);
            }
        }

        return matchingTokens;
    }

    private static string ComputeRequestFingerprint(OptimizeRequest request)
    {
        var payload = new
        {
            country = request.Country.Trim().ToUpperInvariant(),
            state = request.State?.Trim().ToUpperInvariant(),
            year = request.Year,
            vacationDays = request.VacationDays,
            minimumDaysPerRange = request.MinimumDaysPerRange,
            maximumDaysPerRange = request.MaximumDaysPerRange,
            maxNumberOfVacationsPerMonth = request.MaxNumberOfVacationsPerMonth?
                .OrderBy(entry => entry.Key)
                .Select(entry => new { month = (int)entry.Key, count = entry.Value })
                .ToArray(),
            customFreeDays = request.CustomFreeDays?
                .Select(day => day.Date)
                .Distinct()
                .OrderBy(date => date)
                .Select(date => date.ToString("yyyy-MM-dd"))
                .ToArray(),
            ignoredHolidayDates = request.IgnoredHolidayDates?
                .Distinct()
                .OrderBy(date => date)
                .Select(date => date.ToString("yyyy-MM-dd"))
                .ToArray(),
            neverHolidayDates = request.NeverHolidayDates?
                .Distinct()
                .OrderBy(date => date)
                .Select(date => date.ToString("yyyy-MM-dd"))
                .ToArray(),
            lockedVacationDates = request.LockedVacationDates?
                .Distinct()
                .OrderBy(date => date)
                .Select(date => date.ToString("yyyy-MM-dd"))
                .ToArray()
        };

        var json = JsonSerializer.Serialize(payload);
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(json));
        return Convert.ToHexString(hash.AsSpan(0, 16)).ToLowerInvariant();
    }

    private static string ComputeOutputSeed(OptimizeResult result)
    {
        var payload = new
        {
            selectedVacationDays = result.SelectedVacationDays
                .OrderBy(date => date)
                .Select(date => date.ToString("yyyy-MM-dd"))
                .ToArray(),
            ranges = result.Ranges
                .OrderBy(range => range.Start)
                .ThenBy(range => range.End)
                .Select(range => new
                {
                    start = range.Start.ToString("yyyy-MM-dd"),
                    end = range.End.ToString("yyyy-MM-dd"),
                    totalDaysOff = range.TotalDaysOff,
                    vacationDaysUsed = range.VacationDaysUsed
                })
                .ToArray(),
        };

        var json = JsonSerializer.Serialize(payload);
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(json));
        return Convert.ToHexString(hash.AsSpan(0, 8)).ToLowerInvariant();
    }

    /// <summary>
    /// Groups consecutive visible days off into result ranges.
    /// Never-vacation days split ranges and are not included in range totals, even when
    /// a bridge candidate selected vacation days on both sides of the blocker.
    /// </summary>
    private static List<VacationRange> BuildRanges(List<CalendarDay> calendar, int minimumDaysPerRange = 1, int maximumDaysPerRange = 365)
    {
        var ranges = new List<VacationRange>();
        var segments = FindContiguousSegments(calendar, IsRangeDay);

        foreach (var segment in segments)
        {
            int vacDaysUsed = calendar
                .Skip(segment.Start)
                .Take(segment.End - segment.Start + 1)
                .Count(d => d.Type == DayType.Vacation);

            int totalDaysOff = segment.End - segment.Start + 1;

            // Only include ranges that:
            // 1. Have at least one vacation day OR are interesting (multi-day blocks with holidays)
            // 2. Meet the minimum days requirement
            // 3. Do not exceed the maximum days requirement
            if ((vacDaysUsed > 0 || totalDaysOff >= 3) &&
                totalDaysOff >= minimumDaysPerRange &&
                totalDaysOff <= maximumDaysPerRange)
            {
                ranges.Add(new VacationRange(
                    Start: calendar[segment.Start].Date,
                    End: calendar[segment.End].Date,
                    TotalDaysOff: totalDaysOff,
                    VacationDaysUsed: vacDaysUsed
                ));
            }
        }

        return ranges;
    }

    /// <summary>
    /// Generic method to find all contiguous segments matching a predicate.
    /// </summary>
    private static List<(int Start, int End)> FindContiguousSegments(
        List<CalendarDay> calendar,
        Func<CalendarDay, bool> predicate)
    {
        var segments = new List<(int Start, int End)>();
        int i = 0;

        while (i < calendar.Count)
        {
            if (!predicate(calendar[i]))
            {
                i++;
                continue;
            }

            int segmentStart = i;
            while (i < calendar.Count && predicate(calendar[i]))
            {
                i++;
            }

            segments.Add((segmentStart, i - 1));
        }

        return segments;
    }

    private static void MarkSegmentAsVacation(List<CalendarDay> calendar, int startIndex, int endIndex)
    {
        for (int i = startIndex; i <= endIndex; i++)
        {
            if (calendar[i].Type == DayType.WorkDay)
            {
                calendar[i] = calendar[i] with { Type = DayType.Vacation };
            }
        }
    }

    private static int MarkLockedVacationDays(List<CalendarDay> calendar, List<DateOnly>? lockedVacationDates)
    {
        if (lockedVacationDates is null || lockedVacationDates.Count == 0)
        {
            return 0;
        }

        var dates = lockedVacationDates.ToHashSet();
        var lockedVacationDays = 0;

        for (int i = 0; i < calendar.Count; i++)
        {
            if (calendar[i].Type == DayType.WorkDay && dates.Contains(calendar[i].Date))
            {
                calendar[i] = calendar[i] with { Type = DayType.Vacation, IsLockedVacationDay = true };
                lockedVacationDays++;
            }
        }

        return lockedVacationDays;
    }

    private static bool IsWorkDay(CalendarDay day) => day.Type == DayType.WorkDay;

    private static bool IsNeverVacationDay(CalendarDay day) => day.Type == DayType.NeverHoliday;

    private static bool IsRangeDay(CalendarDay day) => !IsWorkDay(day) && !IsNeverVacationDay(day);
}

public record BridgeCandidate(
    int StartIndex,
    int EndIndex,
    int WorkDaysCount,
    int TotalDaysOff,
    double Score
);
