export interface Country {
    code: string;
    name: string;
}

export interface StateOption {
    code: string;
    name: string;
}

export interface DetectedCountry {
    hasGeoHeaders: boolean;
    countryCode: string | null;
}

export const DayType = {
    WorkDay: "WorkDay",
    Weekend: "Weekend",
    PublicHoliday: "PublicHoliday",
    CustomFreeDay: "CustomFreeDay",
    Vacation: "Vacation",
    Today: "Today",
    PassedDay: "PassedDay",
} as const;

export type DayType = (typeof DayType)[keyof typeof DayType];

export class MonthModel {
    monthIndex: number;
    monthName: string;
    days: CalendarDay[];

    constructor(monthIndex: number, locale: string) {
        this.monthIndex = monthIndex;
        this.monthName = new Date(0, monthIndex).toLocaleString(locale, { month: "long" });
        this.days = [];
    }

    addDay(day: CalendarDay) {
        this.days.push(day);
    }
}

export interface CalendarDay {
    date: string; // "YYYY-MM-DD"
    type: DayType;
    holidayName: string | null;
}

export interface VacationRange {
    start: string;
    end: string;
    totalDaysOff: number;
    vacationDaysUsed: number;
}

export interface CustomFreeDay {
    date: string; // "YYYY-MM-DD"
    title?: string;
}

export interface OptimizationResultBase {
    calendar: {
        days: CalendarDay[];
    };
    selectedVacationDays: string[];
    ranges: VacationRange[];
    totalDaysOff: number;
    vacationDaysUsed: number;
    publicHolidaysCount: number;
    resultSeed: string;
}

export interface IndiaOptimizeScope {
    type: "state";
    stateCode: string;
    stateName: string;
}

export interface SpainOptimizeScope {
    type: "national" | "state" | "city";
    stateCode: string | null;
    stateName: string | null;
    cityCode: string | null;
    cityName: string | null;
}

export interface LegacyOptimizeResult extends OptimizationResultBase {
    countryCode?: string;
    scope?: undefined;
}

export interface IndiaOptimizeResult extends OptimizationResultBase {
    countryCode: "IN";
    scope: IndiaOptimizeScope;
}

export interface SpainOptimizeResult extends OptimizationResultBase {
    countryCode: "ES";
    scope: SpainOptimizeScope;
}

export type OptimizeResult = LegacyOptimizeResult | IndiaOptimizeResult | SpainOptimizeResult;

export interface SharedOptimizeRequestFields {
    country: string;
    year: number;
    vacationDays: number;
    minimumDaysPerRange?: number;
    maximumDaysPerRange?: number;
    customFreeDays?: CustomFreeDay[];
    ignoredHolidayDates?: string[];
    usedResultSeeds?: string[];
}

export interface LegacyOptimizeRequest extends SharedOptimizeRequestFields {
    state?: string;
    stateCode?: never;
}

export interface IndiaOptimizeRequest extends SharedOptimizeRequestFields {
    country: "IN";
    stateCode: string;
    state?: never;
    cityCode?: never;
}

export interface SpainOptimizeRequest extends SharedOptimizeRequestFields {
    country: "ES";
    stateCode?: string;
    cityCode?: string;
    state?: never;
}

export type OptimizeRequest = LegacyOptimizeRequest | IndiaOptimizeRequest | SpainOptimizeRequest;

export interface OptimizationYearRange {
    min: number;
    max: number;
}

export interface OptimizationFormDefaults {
    vacationDays: number;
    minimumDaysPerRange: number;
    maximumDaysPerRange: number;
}

export interface IndiaCountrySchema {
    countryCode: "IN";
    component: "india";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    stateSelectionRequired: true;
    states: StateOption[];
}

export interface SpainCityOption {
    code: string;
    name: string;
    stateCode: string;
}

export interface SpainCountrySchema {
    countryCode: "ES";
    component: "spain";
    yearRange: OptimizationYearRange;
    defaults: OptimizationFormDefaults;
    states: StateOption[];
    cities: SpainCityOption[];
}

export function isIndiaOptimizeRequest(request: OptimizeRequest | null | undefined): request is IndiaOptimizeRequest {
    return request?.country === "IN";
}

export function isSpainOptimizeRequest(request: OptimizeRequest | null | undefined): request is SpainOptimizeRequest {
    return request?.country === "ES";
}

export function isIndiaOptimizeResult(result: OptimizeResult | null | undefined): result is IndiaOptimizeResult {
    return result?.countryCode === "IN";
}

export function isSpainOptimizeResult(result: OptimizeResult | null | undefined): result is SpainOptimizeResult {
    return result?.countryCode === "ES";
}

export function getOptimizeRequestScopeCode(request: OptimizeRequest | null | undefined) {
    if (!request) {
        return "";
    }

    if (isIndiaOptimizeRequest(request)) {
        return request.stateCode;
    }

    if (isSpainOptimizeRequest(request)) {
        return request.cityCode ?? request.stateCode ?? "";
    }

    return request.state ?? "";
}
