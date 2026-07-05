import { afterEach, describe, expect, it } from "vitest";
import {
  calendarNameStorageKey,
  clearAppLocalStorage,
  connectedCalendarNameStorageKey,
  connectedTokenStorageKey,
  getCanonicalAppPath,
  normalizeCanonicalAppPath,
  parseRequestFromUrl,
  readSavedResult,
  savedRequestStorageKey,
  savedResultStorageKey,
  themeStorageKey,
  updateUrlFromRequest,
} from "./optimizationPersistence";
import {
  defaultMaximumDaysPerRange,
  defaultMinimumDaysPerRange,
  defaultVacationDays,
  getDefaultYear,
} from "../optimizerDefaults";

describe("optimizationPersistence", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/app");
    window.localStorage.clear();
  });

  it("falls back to real defaults when query params are present but empty", () => {
    window.history.replaceState({}, "", "/app?country=DE&year=&vacationDays=&minDays=&maxDays=");

    expect(parseRequestFromUrl()).toEqual({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: defaultVacationDays,
      minimumDaysPerRange: defaultMinimumDaysPerRange,
      maximumDaysPerRange: defaultMaximumDaysPerRange,
    });
  });

  it("omits default values from the restored bookmark URL", () => {
    updateUrlFromRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: defaultVacationDays,
      minimumDaysPerRange: defaultMinimumDaysPerRange,
      maximumDaysPerRange: defaultMaximumDaysPerRange,
    });

    expect(window.location.search).toBe("?country=DE");
  });

  it("preserves connected calendar params in the app URL", () => {
    window.localStorage.setItem(connectedTokenStorageKey, "partner-seed");
    window.localStorage.setItem(connectedCalendarNameStorageKey, "Friends");
    window.localStorage.setItem("vacationOptimizer.v2.connectedCalendarYear", String(getDefaultYear()));

    updateUrlFromRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: defaultVacationDays,
      minimumDaysPerRange: defaultMinimumDaysPerRange,
      maximumDaysPerRange: defaultMaximumDaysPerRange,
    });

    expect(window.location.search).toBe(`?country=DE&connectedToken=partner-seed&connectedCalendarName=Friends&connectedCalendarYear=${getDefaultYear()}`);
  });

  it("normalizes nested production app paths back to /app while preserving the query string", () => {
    window.history.replaceState({}, "", "/app/results?country=US&ignoredHolidays=2026-05-25");

    normalizeCanonicalAppPath(false);

    expect(window.location.pathname).toBe("/app");
    expect(window.location.search).toBe("?country=US&ignoredHolidays=2026-05-25");
  });

  it("does not rewrite non-app production routes", () => {
    window.history.replaceState({}, "", "/about?country=US");

    normalizeCanonicalAppPath(false);

    expect(window.location.pathname).toBe("/about");
    expect(window.location.search).toBe("?country=US");
  });

  it("uses / as the canonical path in development", () => {
    window.history.replaceState({}, "", "/asfd?country=US");

    normalizeCanonicalAppPath(true);

    expect(getCanonicalAppPath(true)).toBe("/");
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?country=US");
  });

  it("restores India requests from the new stateCode query param", () => {
    window.history.replaceState({}, "", "/app?country=IN&stateCode=IN-KA&year=2027");

    expect(parseRequestFromUrl()).toEqual({
      country: "IN",
      stateCode: "IN-KA",
      year: 2027,
      vacationDays: defaultVacationDays,
      minimumDaysPerRange: defaultMinimumDaysPerRange,
      maximumDaysPerRange: defaultMaximumDaysPerRange,
    });
  });

  it("drops cached results that do not contain a usable planner seed", () => {
    window.localStorage.setItem(savedResultStorageKey, JSON.stringify({
      calendar: { days: [] },
      selectedVacationDays: [],
      ranges: [],
      totalDaysOff: 0,
      vacationDaysUsed: 0,
      publicHolidaysCount: 0,
      resultToken: "token-1",
    }));

    expect(readSavedResult()).toBeNull();
    expect(window.localStorage.getItem(savedResultStorageKey)).toBeNull();
  });

  it("clears only the app-owned local storage entries", () => {
    window.localStorage.setItem(savedRequestStorageKey, "{}");
    window.localStorage.setItem(savedResultStorageKey, "{}");
    window.localStorage.setItem(calendarNameStorageKey, "Friends");
    window.localStorage.setItem(connectedTokenStorageKey, "partner-seed");
    window.localStorage.setItem(connectedCalendarNameStorageKey, "Friends");
    window.localStorage.setItem("vacationOptimizer.v2.connectedCalendarYear", String(getDefaultYear()));
    window.localStorage.setItem(themeStorageKey, "dark");
    window.localStorage.setItem("unrelated.key", "keep-me");

    clearAppLocalStorage();

    expect(window.localStorage.getItem(savedRequestStorageKey)).toBeNull();
    expect(window.localStorage.getItem(savedResultStorageKey)).toBeNull();
    expect(window.localStorage.getItem(calendarNameStorageKey)).toBeNull();
    expect(window.localStorage.getItem(connectedTokenStorageKey)).toBeNull();
    expect(window.localStorage.getItem(connectedCalendarNameStorageKey)).toBeNull();
    expect(window.localStorage.getItem(themeStorageKey)).toBeNull();
    expect(window.localStorage.getItem("unrelated.key")).toBe("keep-me");
  });
});
