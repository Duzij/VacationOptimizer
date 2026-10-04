import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ResultsSummary from "./ResultsSummary";
import type { LegacyOptimizeResult } from "../types/models";

function createResult(overrides: Partial<LegacyOptimizeResult> = {}): LegacyOptimizeResult {
  return {
    calendar: { days: [] },
    selectedVacationDays: [],
    ranges: [],
    totalDaysOff: 0,
    vacationDaysUsed: 0,
    publicHolidaysCount: 0,
    resultToken: "result-token-1",
    plannerSeed: "planner-seed-1",
    ...overrides,
  };
}

describe("ResultsSummary", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows both years for a range that spans two calendar years", () => {
    const result = createResult({
      ranges: [
        {
          start: "2026-05-24",
          end: "2027-01-03",
          totalDaysOff: 10,
          vacationDaysUsed: 5,
        },
      ],
    });

    render(<ResultsSummary result={result} />);

    expect(screen.getByText("May 24, 2026 – Jan 3, 2027")).toBeTruthy();
  });

  it("omits the year for a range that stays within the same calendar year", () => {
    const result = createResult({
      ranges: [
        {
          start: "2026-05-24",
          end: "2026-06-02",
          totalDaysOff: 10,
          vacationDaysUsed: 5,
        },
      ],
    });

    render(<ResultsSummary result={result} />);

    expect(screen.getByText("May 24 – Jun 2")).toBeTruthy();
    expect(screen.queryByText("May 24, 2026 – Jun 2, 2026")).toBeNull();
  });

  it("renders multiple ranges with correct year formatting", () => {
    const result = createResult({
      ranges: [
        {
          start: "2026-12-24",
          end: "2027-01-03",
          totalDaysOff: 11,
          vacationDaysUsed: 5,
        },
        {
          start: "2027-04-01",
          end: "2027-04-10",
          totalDaysOff: 10,
          vacationDaysUsed: 5,
        },
      ],
    });

    render(<ResultsSummary result={result} />);

    expect(screen.getByText("Dec 24, 2026 – Jan 3, 2027")).toBeTruthy();
    expect(screen.getByText("Apr 1 – Apr 10")).toBeTruthy();
  });
});
