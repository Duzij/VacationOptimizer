import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { getDefaultYear } from "./optimizerDefaults";

const optimizeState = {
  isPending: false,
  isError: false,
  error: null as Error | null,
};

const mutateAsync = vi.fn();

vi.mock("./api/vacationApi", () => ({
  useOptimize: () => ({
    mutateAsync,
    isPending: optimizeState.isPending,
    isError: optimizeState.isError,
    error: optimizeState.error,
  }),
}));

vi.mock("./components/OptimizerForm", () => ({
  default: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="optimizer-form-loading">{String(isLoading)}</div>
  ),
}));

vi.mock("./components/CalendarView", () => ({
  default: () => <div data-testid="calendar-view" />,
}));

vi.mock("./components/ResultsSummary", () => ({
  default: () => <div data-testid="results-summary" />,
}));

vi.mock("./components/Legend", () => ({
  default: () => <div data-testid="legend" />,
}));

vi.mock("./components/FeedbackModal", () => ({
  default: () => null,
}));

vi.mock("./components/ConfirmCustomDayModal", () => ({
  default: () => null,
}));

describe("App loading state", () => {
  afterEach(() => {
    optimizeState.isPending = false;
    optimizeState.isError = false;
    optimizeState.error = null;
    mutateAsync.mockReset();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/app");
  });

  it("does not keep the form loading when a cached restore result is already visible", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    optimizeState.isPending = true;
    mutateAsync.mockReturnValue(new Promise(() => undefined));

    window.localStorage.setItem("vacationOptimizer.savedRequest", JSON.stringify({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      minimumDaysPerRange: 4,
      maximumDaysPerRange: 14,
    }));
    window.localStorage.setItem("vacationOptimizer.savedResult", JSON.stringify({
      calendar: [],
      selectedVacationDays: [],
      ranges: [],
      totalDaysOff: 0,
      vacationDaysUsed: 0,
      publicHolidaysCount: 0,
    }));
    window.history.replaceState({}, "", "/app?country=DE");

    render(<App />);

    expect(screen.getByTestId("results-summary")).toBeTruthy();
    expect(screen.getByTestId("optimizer-form-loading").textContent).toBe("false");
  });
});
