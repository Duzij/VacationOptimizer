import { describe, expect, it } from "vitest";
import { normalizeOptimizeRequest, requestsMatch } from "./optimizationRequest";
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
});
