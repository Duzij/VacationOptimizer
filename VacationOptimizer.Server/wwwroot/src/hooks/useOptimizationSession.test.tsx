import { act, render, waitFor } from "@testing-library/react";
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

let latestSession: ReturnType<typeof useOptimizationSession> | null = null;

function HookHarness() {
  latestSession = useOptimizationSession();
  return null;
}

function createResult(resultToken: string, totalDaysOff = 0): OptimizeResult {
  return {
    calendar: {days: []},
    selectedVacationDays: [],
    ranges: [],
    totalDaysOff,
    vacationDaysUsed: 0,
    publicHolidaysCount: 0,
    resultToken,
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
      resultToken: "",
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
      resultToken: "",
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

  it("bundles remembered result tokens for repeated optimizations and shuffle", async () => {
    const request: OptimizeRequest = {
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      minimumDaysPerRange: 4,
      maximumDaysPerRange: 14,
    };

    mutateAsync
      .mockResolvedValueOnce(createResult("token-1"))
      .mockResolvedValueOnce(createResult("token-2"))
      .mockResolvedValueOnce(createResult("token-3"));

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
      usedResultTokens: ["token-1"],
    });

    await act(async () => {
      await latestSession?.shuffleOptimization();
    });

    expect(mutateAsync).toHaveBeenNthCalledWith(3, expect.objectContaining({
      ...request,
      ignoredHolidayDates: undefined,
      usedResultTokens: ["token-1", "token-2"],
    }));
  });

  it("navigates between remembered results without calling the api", async () => {
    const request: OptimizeRequest = {
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      minimumDaysPerRange: 4,
      maximumDaysPerRange: 14,
    };

    mutateAsync
      .mockResolvedValueOnce(createResult("token-1", 10))
      .mockResolvedValueOnce(createResult("token-2", 20));

    render(<HookHarness />);

    await act(async () => {
      await latestSession?.runOptimization(request);
    });

    await act(async () => {
      await latestSession?.runOptimization(request);
    });

    expect(latestSession?.result?.resultToken).toBe("token-2");
    expect(latestSession?.canNavigatePrevious).toBe(true);
    expect(latestSession?.canNavigateNext).toBe(false);

    act(() => {
      latestSession?.navigatePreviousResult();
    });

    expect(latestSession?.result?.resultToken).toBe("token-1");
    expect(latestSession?.canNavigatePrevious).toBe(false);
    expect(latestSession?.canNavigateNext).toBe(true);
    expect(mutateAsync).toHaveBeenCalledTimes(2);

    act(() => {
      latestSession?.navigateNextResult();
    });

    expect(latestSession?.result?.resultToken).toBe("token-2");
    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });

  it("shuffles from an older result by sending all known tokens and selecting the new latest result", async () => {
    const request: OptimizeRequest = {
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      minimumDaysPerRange: 4,
      maximumDaysPerRange: 14,
    };

    mutateAsync
      .mockResolvedValueOnce(createResult("token-1"))
      .mockResolvedValueOnce(createResult("token-2"))
      .mockResolvedValueOnce(createResult("token-3"));

    render(<HookHarness />);

    await act(async () => {
      await latestSession?.runOptimization(request);
    });

    await act(async () => {
      await latestSession?.runOptimization(request);
    });

    act(() => {
      latestSession?.navigatePreviousResult();
    });

    await act(async () => {
      await latestSession?.shuffleOptimization();
    });

    expect(mutateAsync).toHaveBeenNthCalledWith(3, expect.objectContaining({
      ...request,
      ignoredHolidayDates: undefined,
      usedResultTokens: ["token-1", "token-2"],
    }));
    expect(latestSession?.result?.resultToken).toBe("token-3");
    expect(latestSession?.canNavigatePrevious).toBe(true);
    expect(latestSession?.canNavigateNext).toBe(false);
  });

  it("clears result history and tokens when the effective request changes", async () => {
    const firstRequest: OptimizeRequest = {
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      minimumDaysPerRange: 4,
      maximumDaysPerRange: 14,
    };
    const secondRequest: OptimizeRequest = {
      ...firstRequest,
      country: "US",
    };

    mutateAsync
      .mockResolvedValueOnce(createResult("token-1"))
      .mockResolvedValueOnce(createResult("token-2"));

    render(<HookHarness />);

    await act(async () => {
      await latestSession?.runOptimization(firstRequest);
    });

    await act(async () => {
      await latestSession?.runOptimization(secondRequest);
    });

    expect(mutateAsync).toHaveBeenNthCalledWith(2, {
      ...secondRequest,
      ignoredHolidayDates: undefined,
    });
    expect(latestSession?.canNavigatePrevious).toBe(false);
    expect(latestSession?.canNavigateNext).toBe(false);
  });
});
