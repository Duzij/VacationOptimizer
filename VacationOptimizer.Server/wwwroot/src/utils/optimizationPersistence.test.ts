import { afterEach, describe, expect, it } from "vitest";
import {
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
});
