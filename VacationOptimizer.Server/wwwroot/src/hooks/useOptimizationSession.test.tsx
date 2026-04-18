import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { OptimizeRequest, OptimizeResult } from "../types/models";
import { getDefaultYear } from "../optimizerDefaults";
import { useOptimizationSession } from "./useOptimizationSession";

const mutateAsync = vi.fn<(request: OptimizeRequest) => Promise<OptimizeResult>>();

vi.mock("../api/vacationApi", () => ({
  useOptimize: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

function HookHarness() {
  useOptimizationSession();
  return null;
}

describe("useOptimizationSession", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/app");
    window.localStorage.clear();
    mutateAsync.mockReset();
  });

  it("sends an optimize request when a bookmark restores a valid request", async () => {
    mutateAsync.mockResolvedValue({
      calendar: {days: [], hash: ""},
      selectedVacationDays: [],
      ranges: [],
      totalDaysOff: 0,
      vacationDaysUsed: 0,
      publicHolidaysCount: 0,
      resultHash: "",
    });
    window.history.replaceState({}, "", "/app?country=DE");

    render(<HookHarness />);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        country: "DE",
        year: getDefaultYear(),
        vacationDays: 25,
        minimumDaysPerRange: 4,
        maximumDaysPerRange: 14,
        ignoredHolidayDates: undefined,
      });
    });
  });

  it("treats empty numeric params as defaults before sending the restore request", async () => {
    mutateAsync.mockResolvedValue({
      calendar: {days: [], hash: ""},
      selectedVacationDays: [],
      ranges: [],
      totalDaysOff: 0,
      vacationDaysUsed: 0,
      publicHolidaysCount: 0,
      resultHash: "",
    });
    window.history.replaceState({}, "", "/app?country=DE&vacationDays=&minDays=&maxDays=");

    render(<HookHarness />);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        country: "DE",
        year: getDefaultYear(),
        vacationDays: 25,
        minimumDaysPerRange: 4,
        maximumDaysPerRange: 14,
        ignoredHolidayDates: undefined,
      });
    });
  });
});
