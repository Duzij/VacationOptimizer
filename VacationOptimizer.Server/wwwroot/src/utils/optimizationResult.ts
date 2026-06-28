import type { OptimizeResult } from "../types/models";

export function getOptimizationResultFingerprint(result: OptimizeResult): string {
  return JSON.stringify({
    selectedVacationDays: [...result.selectedVacationDays].sort(),
    ranges: [...result.ranges]
      .sort((left, right) =>
        left.start.localeCompare(right.start)
        || left.end.localeCompare(right.end)
        || left.totalDaysOff - right.totalDaysOff
        || left.vacationDaysUsed - right.vacationDaysUsed)
      .map((range) => ({
        start: range.start,
        end: range.end,
        totalDaysOff: range.totalDaysOff,
        vacationDaysUsed: range.vacationDaysUsed,
      })),
    totalDaysOff: result.totalDaysOff,
    vacationDaysUsed: result.vacationDaysUsed,
    publicHolidaysCount: result.publicHolidaysCount,
  });
}
