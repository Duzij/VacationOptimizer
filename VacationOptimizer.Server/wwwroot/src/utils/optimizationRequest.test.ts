import { describe, expect, it } from "vitest";
import { buildSearchParamsFromRequest, ensureMonthlyCapsFitLockedDays, normalizeOptimizeRequest, parseRequestFromSearchParams, requestsMatch } from "./optimizationRequest";
import type { MonthlyVacationLimits } from "../types/models";
import { getDefaultYear } from "../optimizerDefaults";

describe("optimizationRequest", () => {
  it("preserves empty custom free day titles", () => {
    const request = normalizeOptimizeRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      customFreeDays: [{ date: `${getDefaultYear()}-04-10`, title: "" }],
    });

    expect(request.customFreeDays).toEqual([
      { date: `${getDefaultYear()}-04-10`, title: "" },
    ]);
  });

  it("compares custom free day titles when matching requests", () => {
    const baseRequest = {
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
    };

    expect(requestsMatch(
      { ...baseRequest, customFreeDays: [{ date: `${getDefaultYear()}-04-10` }] },
      { ...baseRequest, customFreeDays: [{ date: `${getDefaultYear()}-04-10`, title: "" }] },
    )).toBe(false);
  });

  it("normalizes and compares never holiday dates", () => {
    const date = `${getDefaultYear()}-05-12`;
    const request = normalizeOptimizeRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      neverHolidayDates: [date, date],
    });

    expect(request.neverHolidayDates).toEqual([date]);
    expect(requestsMatch(
      { country: "DE", year: getDefaultYear(), vacationDays: 25 },
      { country: "DE", year: getDefaultYear(), vacationDays: 25, neverHolidayDates: [date] },
    )).toBe(false);
  });

  it("round-trips never holiday dates through search params", () => {
    const date = `${getDefaultYear()}-05-12`;
    const params = buildSearchParamsFromRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      neverHolidayDates: [date],
    });

    expect(params.get("neverHolidays")).toBe(date);
    expect(parseRequestFromSearchParams(params)?.neverHolidayDates).toEqual([date]);
  });

  it("normalizes, compares, and round-trips locked vacation dates", () => {
    const date = `${getDefaultYear()}-05-12`;
    const request = normalizeOptimizeRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      lockedVacationDates: [date, date],
    });
    const params = buildSearchParamsFromRequest(request);

    expect(request.lockedVacationDates).toEqual([date]);
    expect(params.get("lockedVacationDays")).toBe(date);
    expect(parseRequestFromSearchParams(params)?.lockedVacationDates).toEqual([date]);
    expect(requestsMatch(
      { country: "DE", year: getDefaultYear(), vacationDays: 25 },
      request,
    )).toBe(false);
  });

  it("normalizes, compares, and round-trips monthly vacation caps", () => {
    const request = normalizeOptimizeRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      maxNumberOfVacationsPerMonth: {
        January: 2,
        July: 3,
      },
    });
    const params = buildSearchParamsFromRequest(request);

    expect(request.maxNumberOfVacationsPerMonth).toEqual({
      January: 2,
      July: 3,
    });
    expect(params.get("monthlyCaps")).toBe("1:2,7:3");
    expect(parseRequestFromSearchParams(params)?.maxNumberOfVacationsPerMonth).toEqual({
      January: 2,
      July: 3,
    });
    expect(requestsMatch(
      { country: "DE", year: getDefaultYear(), vacationDays: 25 },
      request,
    )).toBe(false);
  });

  it("raises monthly caps to fit locked vacation days", () => {
    const adjusted = ensureMonthlyCapsFitLockedDays({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      maxNumberOfVacationsPerMonth: { July: 1 },
      lockedVacationDates: ["2027-07-01", "2027-07-02"],
    });

    expect(adjusted.maxNumberOfVacationsPerMonth).toEqual({ July: 2 });
  });

  it("adds a monthly cap when locked days exist but no cap is set", () => {
    const adjusted = ensureMonthlyCapsFitLockedDays({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      lockedVacationDates: ["2027-07-01", "2027-07-02", "2027-07-03"],
    });

    expect((adjusted as { maxNumberOfVacationsPerMonth?: MonthlyVacationLimits }).maxNumberOfVacationsPerMonth).toEqual({ July: 3 });
  });

  it("leaves caps unchanged when they already fit locked days", () => {
    const request = {
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      maxNumberOfVacationsPerMonth: { July: 5 },
      lockedVacationDates: ["2027-07-01", "2027-07-02"],
    };

    expect(ensureMonthlyCapsFitLockedDays(request)).toBe(request);
  });

  it("round-trips the planner seed through search params without affecting request matching", () => {
    const request = normalizeOptimizeRequest({
      country: "DE",
      year: getDefaultYear(),
      vacationDays: 25,
      seedToken: "  seed-token-value  ",
    });
    const params = buildSearchParamsFromRequest(request);

    expect(request.seedToken).toBe("seed-token-value");
    expect(params.get("seed")).toBe("seed-token-value");
    expect(parseRequestFromSearchParams(params)?.seedToken).toBe("seed-token-value");
    expect(requestsMatch(
      { country: "DE", year: getDefaultYear(), vacationDays: 25 },
      request,
    )).toBe(true);
  });
});
