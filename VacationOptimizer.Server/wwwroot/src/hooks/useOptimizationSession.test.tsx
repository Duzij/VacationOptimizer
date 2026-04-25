import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { OptimizeRequest, OptimizeResult } from "../types/models";
import { getDefaultYear } from "../optimizerDefaults";
import { type RunOptimization, useOptimizationSession } from "./useOptimizationSession";

const mutateAsync = vi.fn<(request: OptimizeRequest) => Promise<OptimizeResult>>();

vi.mock("../api/vacationApi", () => ({
  useOptimize: () => ({
    mutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

let latestSession: {
  runOptimization: RunOptimization;
  shuffleOptimization: () => Promise<void>;
} | null = null;

function HookHarness() {
  latestSession = useOptimizationSession();
  return null;
}

function createResult(resultSeed: string): OptimizeResult {
  return {
    calendar: {days: []},
    selectedVacationDays: [],
    ranges: [],
    totalDaysOff: 0,
    vacationDaysUsed: 0,
    publicHolidaysCount: 0,
    resultSeed,
  };
}

describe("useOptimizationSession", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/app");
    window.localStorage.clear();
    latestSession = null;
    mutateAsync.mockReset();
  });

  it("sends an optimize request when a bookmark restores a valid request", async () => {
    mutateAsync.mockResolvedValue({
      calendar: {days: []},
      selectedVacationDays: [],
      ranges: [],
      totalDaysOff: 0,
      vacationDaysUsed: 0,
      publicHolidaysCount: 0,
      resultSeed: "",
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
      calendar: {days: []},
      selectedVacationDays: [],
      ranges: [],
      totalDaysOff: 0,
      vacationDaysUsed: 0,
      publicHolidaysCount: 0,
      resultSeed: "",
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

  it("bundles remembered result seeds for repeated optimizations and shuffle", async () => {
    const request: OptimizeRequest = {
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      minimumDaysPerRange: 4,
      maximumDaysPerRange: 14,
    };

    mutateAsync
      .mockResolvedValueOnce(createResult("seed-1"))
      .mockResolvedValueOnce(createResult("seed-2"))
      .mockResolvedValueOnce(createResult("seed-3"));

    render(<HookHarness />);

    await act(async () => {
      await latestSession?.runOptimization(request);
    });

    await act(async () => {
      await latestSession?.runOptimization(request);
    });

    expect(mutateAsync).toHaveBeenNthCalledWith(2, {
      ...request,
      ignoredHolidayDates: undefined,
      usedResultSeeds: ["seed-1"],
    });

    await act(async () => {
      await latestSession?.shuffleOptimization();
    });

    expect(mutateAsync).toHaveBeenNthCalledWith(3, expect.objectContaining({
      ...request,
      ignoredHolidayDates: undefined,
      usedResultSeeds: ["seed-1", "seed-2"],
    }));
  });
});
