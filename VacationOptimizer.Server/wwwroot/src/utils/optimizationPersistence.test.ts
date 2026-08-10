import { afterEach, describe, expect, it } from "vitest";
import {
  calendarNameStorageKey,
  clearAppLocalStorage,
  clearStoredOptimizationData,
  connectedCalendarNameStorageKey,
  connectedTokenStorageKey,
  getCanonicalAppPath,
  getInitialOptimizationState,
  hasAppLocalStorageData,
  normalizeCanonicalAppPath,
  parseRequestFromUrl,
  persistOptimization,
  readSavedRequest,
  readSavedResult,
  savedRequestStorageKey,
  savedResultStorageKey,
  themeStorageKey,
  updateUrlFromRequest,
} from "./optimizationPersistence";
import type { LegacyOptimizeRequest, LegacyOptimizeResult } from "../types/models";
import {
  defaultMaximumDaysPerRange,
  defaultMinimumDaysPerRange,
  defaultVacationDays,
  getDefaultYear,
} from "../optimizerDefaults";

const yearScopedStorageKey = (key: string, year: number) => `${key}.${year}`;

function makeRequest(year: number, overrides: Partial<LegacyOptimizeRequest> = {}): LegacyOptimizeRequest {
  return {
    country: "DE",
    year,
    vacationDays: defaultVacationDays,
    minimumDaysPerRange: defaultMinimumDaysPerRange,
    maximumDaysPerRange: defaultMaximumDaysPerRange,
    ...overrides,
  };
}

function makeResult(plannerSeed: string, overrides: Partial<LegacyOptimizeResult> = {}): LegacyOptimizeResult {
  return {
    calendar: { days: [] },
    selectedVacationDays: [],
    ranges: [],
    totalDaysOff: 0,
    vacationDaysUsed: 0,
    publicHolidaysCount: 0,
    resultToken: `${plannerSeed}-token`,
    plannerSeed,
    ...overrides,
  };
}

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

  it("reads saved requests from the storage key for the URL year", () => {
    const currentYear = getDefaultYear();
    const nextYear = currentYear + 1;
    const currentYearRequest = makeRequest(currentYear, {
      vacationDays: 18,
      maxNumberOfVacationsPerMonth: { July: 2 },
    });
    const nextYearRequest = makeRequest(nextYear, {
      vacationDays: 21,
      maxNumberOfVacationsPerMonth: { August: 3 },
      ignoredHolidayDates: [`${nextYear}-08-15`],
    });
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, currentYear), JSON.stringify(currentYearRequest));
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, nextYear), JSON.stringify(nextYearRequest));
    window.history.replaceState({}, "", `/app?year=${nextYear}`);

    expect(readSavedRequest()).toEqual(nextYearRequest);
  });

  it("reads saved requests from the current UTC year when the URL has no year", () => {
    const currentUtcYear = new Date().getUTCFullYear();
    const nextYear = currentUtcYear + 1;
    const currentYearRequest = makeRequest(currentUtcYear, {
      vacationDays: 18,
      maxNumberOfVacationsPerMonth: { July: 2 },
    });
    const nextYearRequest = makeRequest(nextYear, {
      vacationDays: 21,
      maxNumberOfVacationsPerMonth: { August: 3 },
    });
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, currentUtcYear), JSON.stringify(currentYearRequest));
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, nextYear), JSON.stringify(nextYearRequest));

    expect(readSavedRequest()).toEqual(currentYearRequest);
  });

  it("keeps the URL request primary while loading the matching saved result for that year", () => {
    const currentYear = getDefaultYear();
    const nextYear = currentYear + 1;
    const urlRequest = makeRequest(nextYear, {
      country: "FR",
      vacationDays: 24,
      maxNumberOfVacationsPerMonth: { September: 4 },
    });
    const savedRequestForUrlYear = makeRequest(nextYear, {
      country: "FR",
      vacationDays: 24,
      maxNumberOfVacationsPerMonth: { September: 4 },
    });
    const savedResultForUrlYear = makeResult("next-year-seed", {
      selectedVacationDays: [`${nextYear}-09-21`],
    });
    window.localStorage.setItem(savedRequestStorageKey, JSON.stringify(makeRequest(currentYear, { country: "DE" })));
    window.localStorage.setItem(savedResultStorageKey, JSON.stringify(makeResult("legacy-seed")));
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, nextYear), JSON.stringify(savedRequestForUrlYear));
    window.localStorage.setItem(yearScopedStorageKey(savedResultStorageKey, nextYear), JSON.stringify(savedResultForUrlYear));
    window.history.replaceState({}, "", `/app?country=${urlRequest.country}&year=${nextYear}&vacationDays=24&monthlyCaps=9:4`);

    const initialState = getInitialOptimizationState();

    expect(initialState.initialRequest).toEqual(urlRequest);
    expect(initialState.initialResult).toEqual(savedResultForUrlYear);
  });

  it("falls back to legacy flat saved request and result keys when no year-scoped data exists", () => {
    const nextYear = getDefaultYear() + 1;
    const request = makeRequest(nextYear, { vacationDays: 19 });
    const result = makeResult("legacy-seed", {
      selectedVacationDays: [`${nextYear}-06-01`],
    });
    window.localStorage.setItem(savedRequestStorageKey, JSON.stringify(request));
    window.localStorage.setItem(savedResultStorageKey, JSON.stringify(result));
    window.history.replaceState({}, "", `/app?country=DE&year=${nextYear}&vacationDays=19`);

    const initialState = getInitialOptimizationState();

    expect(initialState.initialRequest).toEqual(request);
    expect(initialState.initialResult).toEqual(result);
  });

  it("does not use legacy flat saved data from a different year for no-year reads", () => {
    const currentUtcYear = new Date().getUTCFullYear();
    window.localStorage.setItem(savedRequestStorageKey, JSON.stringify(makeRequest(currentUtcYear + 1)));
    window.localStorage.setItem(savedResultStorageKey, JSON.stringify(makeResult("future-year-seed")));

    const initialState = getInitialOptimizationState();

    expect(initialState.initialRequest).toBeNull();
    expect(initialState.initialResult).toBeNull();
  });

  it("persists optimization data under the request year without replacing another year", () => {
    const currentYear = getDefaultYear();
    const nextYear = currentYear + 1;
    const currentYearRequest = makeRequest(currentYear, { vacationDays: 18 });
    const currentYearResult = makeResult("current-year-seed");
    const nextYearRequest = makeRequest(nextYear, { vacationDays: 22 });
    const nextYearResult = makeResult("next-year-seed");
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, currentYear), JSON.stringify(currentYearRequest));
    window.localStorage.setItem(yearScopedStorageKey(savedResultStorageKey, currentYear), JSON.stringify(currentYearResult));

    persistOptimization(nextYearRequest, nextYearResult);

    expect(JSON.parse(window.localStorage.getItem(yearScopedStorageKey(savedRequestStorageKey, currentYear)) ?? "null")).toEqual(currentYearRequest);
    expect(JSON.parse(window.localStorage.getItem(yearScopedStorageKey(savedResultStorageKey, currentYear)) ?? "null")).toEqual(currentYearResult);
    expect(JSON.parse(window.localStorage.getItem(yearScopedStorageKey(savedRequestStorageKey, nextYear)) ?? "null")).toEqual(nextYearRequest);
    expect(JSON.parse(window.localStorage.getItem(yearScopedStorageKey(savedResultStorageKey, nextYear)) ?? "null")).toEqual(nextYearResult);
    expect(window.localStorage.getItem(savedRequestStorageKey)).toBeNull();
    expect(window.localStorage.getItem(savedResultStorageKey)).toBeNull();
  });

  it("clears flat and year-scoped optimization data", () => {
    const currentYear = getDefaultYear();
    const nextYear = currentYear + 1;
    window.localStorage.setItem(savedRequestStorageKey, "{}");
    window.localStorage.setItem(savedResultStorageKey, "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, currentYear), "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedResultStorageKey, currentYear), "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, nextYear), "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedResultStorageKey, nextYear), "{}");
    window.localStorage.setItem("unrelated.key", "keep-me");

    clearStoredOptimizationData();

    expect(window.localStorage.getItem(savedRequestStorageKey)).toBeNull();
    expect(window.localStorage.getItem(savedResultStorageKey)).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedRequestStorageKey, currentYear))).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedResultStorageKey, currentYear))).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedRequestStorageKey, nextYear))).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedResultStorageKey, nextYear))).toBeNull();
    expect(window.localStorage.getItem("unrelated.key")).toBe("keep-me");
  });

  it("detects year-scoped optimization data as app-owned local storage", () => {
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, getDefaultYear() + 1), "{}");

    expect(hasAppLocalStorageData()).toBe(true);
  });

  it("clears only the app-owned local storage entries", () => {
    const currentYear = getDefaultYear();
    const nextYear = currentYear + 1;
    window.localStorage.setItem(savedRequestStorageKey, "{}");
    window.localStorage.setItem(savedResultStorageKey, "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, currentYear), "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedResultStorageKey, currentYear), "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedRequestStorageKey, nextYear), "{}");
    window.localStorage.setItem(yearScopedStorageKey(savedResultStorageKey, nextYear), "{}");
    window.localStorage.setItem(calendarNameStorageKey, "Friends");
    window.localStorage.setItem(connectedTokenStorageKey, "partner-seed");
    window.localStorage.setItem(connectedCalendarNameStorageKey, "Friends");
    window.localStorage.setItem("vacationOptimizer.v2.connectedCalendarYear", String(getDefaultYear()));
    window.localStorage.setItem(themeStorageKey, "dark");
    window.localStorage.setItem("unrelated.key", "keep-me");

    clearAppLocalStorage();

    expect(window.localStorage.getItem(savedRequestStorageKey)).toBeNull();
    expect(window.localStorage.getItem(savedResultStorageKey)).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedRequestStorageKey, currentYear))).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedResultStorageKey, currentYear))).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedRequestStorageKey, nextYear))).toBeNull();
    expect(window.localStorage.getItem(yearScopedStorageKey(savedResultStorageKey, nextYear))).toBeNull();
    expect(window.localStorage.getItem(calendarNameStorageKey)).toBeNull();
    expect(window.localStorage.getItem(connectedTokenStorageKey)).toBeNull();
    expect(window.localStorage.getItem(connectedCalendarNameStorageKey)).toBeNull();
    expect(window.localStorage.getItem(themeStorageKey)).toBeNull();
    expect(window.localStorage.getItem("unrelated.key")).toBe("keep-me");
  });
});
