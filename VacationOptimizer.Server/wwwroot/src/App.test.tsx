import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  useDetectedCountry: () => ({
    data: null,
    isLoading: false,
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
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="results-summary">
      {children}
    </div>
  ),
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

function createSavedRequest() {
  return {
    country: "DE",
    year: getDefaultYear(),
    vacationDays: 25,
    minimumDaysPerRange: 4,
    maximumDaysPerRange: 14,
  };
}

function createSavedResult(plannerSeed = "planner-seed-1") {
  return {
    calendar: { days: [] },
    selectedVacationDays: [],
    ranges: [],
    totalDaysOff: 0,
    vacationDaysUsed: 0,
    publicHolidaysCount: 0,
    resultToken: "result-token-1",
    plannerSeed,
  };
}

describe("App loading state", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollTo", {
      writable: true,
      value: vi.fn(),
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    cleanup();
    optimizeState.isPending = false;
    optimizeState.isError = false;
    optimizeState.error = null;
    mutateAsync.mockReset();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/app");
  });

  it("does not keep the form loading when a cached restore result is already visible", () => {
    optimizeState.isPending = true;
    mutateAsync.mockReturnValue(new Promise(() => undefined));

    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify(createSavedRequest()));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify(createSavedResult()));
    window.history.replaceState({}, "", "/app?country=DE");

    render(<App />);

    expect(screen.getByTestId("results-summary")).toBeTruthy();
    expect(screen.getByTestId("optimizer-form-loading").textContent).toBe("false");
  });

  it("shows the shuffle limit modal and disables shuffle when restore gets a 409", async () => {
    mutateAsync.mockRejectedValue(Object.assign(new Error("No new optimization result is available."), { status: 409 }));

    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify(createSavedRequest()));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify(createSavedResult()));
    window.history.replaceState({}, "", "/app?country=DE");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Shuffle limit reached")).toBeTruthy();
    });
  });

  it("redirects /connect to /app, persists the connected token, and updates the URL", async () => {
    mutateAsync.mockResolvedValue(createSavedResult("planner-seed-1"));
    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify(createSavedRequest()));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify(createSavedResult("planner-seed-1")));
    window.history.replaceState({}, "", "/connect?token=partner-seed&connectedCalendarName=Friends");

    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/app");
      expect(window.location.search).toContain("connectedToken=partner-seed");
      expect(window.location.search).toContain("connectedCalendarName=Friends");
    });

    expect(window.localStorage.getItem("vacationOptimizer.v2.connectedToken")).toBe("partner-seed");
    expect(window.localStorage.getItem("vacationOptimizer.v2.connectedCalendarName")).toBe("Friends");
    expect(screen.getAllByText(/Connected to/i)[0]?.textContent).toContain("Friends");
  });

  it("shows the first-time connect warning and clears the connection when no planner state exists", async () => {
    window.history.replaceState({}, "", "/connect?token=partner-seed&connectedCalendarName=Friends");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Looks like it’s your first time using a website. You can start by building your own calendar or ask a friend to share a connect link.")).toBeTruthy();
    });

    expect(window.localStorage.getItem("vacationOptimizer.v2.connectedToken")).toBeNull();
    expect(window.location.pathname).toBe("/app");
    expect(window.location.search).toBe("");
  });

  it("refuses to connect when the shared token matches the current planner seed even if the name differs", async () => {
    mutateAsync.mockResolvedValue(createSavedResult("same-seed"));
    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify(createSavedRequest()));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify(createSavedResult("same-seed")));
    window.history.replaceState({}, "", "/connect?token=same-seed&connectedCalendarName=SomeoneElse");

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("This connect link points to the same calendar you already have open, so it was not applied.")).toBeTruthy();
    });

    expect(window.localStorage.getItem("vacationOptimizer.v2.connectedToken")).toBeNull();
    expect(window.location.search).not.toContain("connectedToken=");
  });

  it("reuses the saved calendar name in the share modal", async () => {
    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify(createSavedRequest()));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify(createSavedResult("planner-seed-1")));
    window.localStorage.setItem("vacationOptimizer.v2.calendarName", "Friends");
    window.history.replaceState({}, "", "/app?country=DE");

    render(<App />);

    await userEvent.click(screen.getAllByRole("button", { name: "Share" })[0]!);

    expect((screen.getByLabelText("Calendar name") as HTMLInputElement).value).toBe("Friends");
    expect(screen.getByText(/connect\?token=planner-seed-1&connectedCalendarName=Friends/)).toBeTruthy();
  });

  it("does not generate a share link from a stale cached result without planner seed", async () => {
    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify({
      country: "ES",
      stateCode: "ES-CT",
      year: getDefaultYear(),
      vacationDays: 25,
      minimumDaysPerRange: 4,
      maximumDaysPerRange: 14,
    }));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify({
      countryCode: "ES",
      scope: {
        type: "state",
        stateCode: "ES-CT",
        stateName: "Catalonia",
        cityCode: null,
        cityName: null,
      },
      calendar: { days: [] },
      selectedVacationDays: [],
      ranges: [],
      totalDaysOff: 0,
      vacationDaysUsed: 0,
      publicHolidaysCount: 0,
      resultToken: "result-token-1",
    }));
    window.localStorage.setItem("vacationOptimizer.v2.calendarName", "Friends");
    window.history.replaceState({}, "", "/app?country=ES&stateCode=ES-CT");

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
    });
  });

  it("hides share when the cached result has no usable planner seed", async () => {
    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify(createSavedRequest()));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify({
      ...createSavedResult(),
      plannerSeed: "undefined",
    }));
    window.history.replaceState({}, "", "/app?country=DE");

    render(<App />);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
    });
  });

  it("disconnects a connected calendar and clears the URL params", async () => {
    window.localStorage.setItem("vacationOptimizer.v2.savedRequest", JSON.stringify(createSavedRequest()));
    window.localStorage.setItem("vacationOptimizer.v2.savedResult", JSON.stringify(createSavedResult("planner-seed-1")));
    window.localStorage.setItem("vacationOptimizer.v2.connectedToken", "partner-seed");
    window.localStorage.setItem("vacationOptimizer.v2.connectedCalendarName", "Friends");
    window.history.replaceState({}, "", "/app?country=DE&connectedToken=partner-seed&connectedCalendarName=Friends");

    render(<App />);

    await userEvent.click(screen.getAllByRole("button", { name: "Disconnect" })[0]!);

    await waitFor(() => {
      expect(window.location.search).not.toContain("connectedToken=");
      expect(window.location.search).not.toContain("connectedCalendarName=");
    });

    expect(window.localStorage.getItem("vacationOptimizer.v2.connectedToken")).toBeNull();
    expect(window.localStorage.getItem("vacationOptimizer.v2.connectedCalendarName")).toBeNull();
  });
});
