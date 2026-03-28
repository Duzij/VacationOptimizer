import { afterEach, describe, expect, it } from "vitest";
import {
  getCanonicalAppPath,
  normalizeCanonicalAppPath,
  parseRequestFromUrl,
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

  it("normalizes unknown production paths back to /app while preserving the query string", () => {
    window.history.replaceState({}, "", "/asfd?country=US&ignoredHolidays=2026-05-25");

    normalizeCanonicalAppPath(false);

    expect(window.location.pathname).toBe("/app");
    expect(window.location.search).toBe("?country=US&ignoredHolidays=2026-05-25");
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
});
