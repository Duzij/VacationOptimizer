import { describe, expect, it } from "vitest";
import { buildSearchParamsFromRequest, normalizeOptimizeRequest, parseRequestFromSearchParams, requestsMatch } from "./optimizationRequest";
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
});
