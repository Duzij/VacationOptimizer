using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using VacationOptimizer.Server.Models;

namespace VacationOptimizer.Server.Services;

public class VacationOptimizerService
{
    private readonly CalendarService _calendarService;

    public VacationOptimizerService(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public OptimizeResult Optimize(OptimizeRequest request)
    {
        var initialCalendar = _calendarService.BuildCalendar(
            request.Country,
            request.Year,
            request.State,
            request.CustomFreeDays,
            request.IgnoredHolidayDates);

        var usedResultHashes = request.UsedResultHashes?.ToHashSet(StringComparer.Ordinal) ?? new HashSet<string>();
        var seedBase = request.Seed ?? 0;
        const int maxAttempts = 16;

        OptimizeResult? lastResult = null;

        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            var calendar = CloneCalendar(initialCalendar);
            var rng = new Random(seedBase + attempt);
            var result = OptimizeCalendar(calendar, request, rng);

            if (!usedResultHashes.Contains(result.ResultHash))
            {
                return result;
            }

            lastResult = result;
        }

        return lastResult ?? throw new InvalidOperationException("Unable to generate an optimization result.");
    }

    private static OptimizeResult OptimizeCalendar(CalendarData calendar, OptimizeRequest request, Random rng)
    {
        int remainingBudget = request.VacationDays;

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
        return new CalendarData(clonedDays, calendar.Hash);
    }

    /// <summary>
    /// Finds contiguous sequences of working days that act as "bridges" between
    /// non-working clusters (weekends, holidays, already-selected vacation days).
    /// </summary>
    public static List<BridgeCandidate> FindBridgeCandidates(List<CalendarDay> calendar)
    {
        var candidates = new List<BridgeCandidate>();
        var segments = FindContiguousSegments(calendar, IsWorkDay);

        foreach (var segment in segments)
        {
            int workDaysCount = segment.End - segment.Start + 1;

            // Calculate total continuous days off if this bridge were filled
            int clusterStart = segment.Start;
            int clusterEnd = segment.End;

            // Extend backwards to include preceding non-working cluster
            while (clusterStart > 0 && !IsWorkDay(calendar[clusterStart - 1]))
            {
                clusterStart--;
            }

            // Extend forwards to include following non-working cluster
            while (clusterEnd < calendar.Count - 1 && !IsWorkDay(calendar[clusterEnd + 1]))
            {
                clusterEnd++;
            }

            int totalDaysOff = clusterEnd - clusterStart + 1;
            double score = (double)totalDaysOff / workDaysCount;

            candidates.Add(new BridgeCandidate(
                StartIndex: segment.Start,
                EndIndex: segment.End,
                WorkDaysCount: workDaysCount,
                TotalDaysOff: totalDaysOff,
                Score: score
            ));
        }

        return candidates;
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
            ResultHash: string.Empty
        );

        return result with { ResultHash = ComputeResultHash(result) };
    }

    private static string ComputeResultHash(OptimizeResult result)
    {
        var payload = new
        {
            calendarHash = result.Calendar.Hash,
            selectedVacationDays = result.SelectedVacationDays
                .OrderBy(date => date)
                .Select(date => date.ToString("yyyy-MM-dd"))
                .ToArray(),
        };

        var json = JsonSerializer.Serialize(payload);
        return Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(json)));
    }

    /// <summary>
    /// Groups consecutive non-working days (weekends + holidays + vacation) into ranges,
    /// filtered by minimum and maximum days per range.
    /// </summary>
    private static List<VacationRange> BuildRanges(List<CalendarDay> calendar, int minimumDaysPerRange = 1, int maximumDaysPerRange = 365)
    {
        var ranges = new List<VacationRange>();
        var segments = FindContiguousSegments(calendar, d => !IsWorkDay(d));

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

    private static bool IsWorkDay(CalendarDay day) => day.Type == DayType.WorkDay;
}

public record BridgeCandidate(
    int StartIndex,
    int EndIndex,
    int WorkDaysCount,
    int TotalDaysOff,
    double Score
);
