// Landing-page country showcase constants. The year is intentionally
// hardcoded (see Features/plan-landing-country-showcase.md) so the showcased
// numbers stay stable and cacheable for the current year.
export const SHOWCASE_YEAR = 2026;
export const SHOWCASE_VACATION_DAYS = 25;

export const FEATURED_COUNTRY_CODES = ["DE", "US", "GB", "FR", "ES", "NL", "AU", "JP"] as const;

const SHOWCASE_DEFAULT_REGION_PARAMS: Record<string, string> = {
    IN: "stateCode=IN-KA",
    CH: "cantonCode=CH-ZH",
};

export function buildShowcasePlannerPath(countryCode: string): string {
    const normalized = countryCode.trim().toUpperCase();
    const regionParam = SHOWCASE_DEFAULT_REGION_PARAMS[normalized];
    const params = [
        `country=${encodeURIComponent(normalized)}`,
        ...(regionParam ? [regionParam] : []),
        `year=${SHOWCASE_YEAR}`,
        `vacationDays=${SHOWCASE_VACATION_DAYS}`,
    ];
    return `/app?${params.join("&")}`;
}
