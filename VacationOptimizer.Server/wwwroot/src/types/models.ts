import { capitalizeFirstLetter } from "../utils/text";
import type {
    IndiaOptimizeRequest,
    IndiaOptimizeResult,
    SpainOptimizeRequest,
    SpainOptimizeResult,
    SwitzerlandOptimizeRequest,
    SwitzerlandOptimizeResult,
} from "../features/countrySpecific/models";

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
    CollectiveLeave: "CollectiveLeave",
    CustomFreeDay: "CustomFreeDay",
    Vacation: "Vacation",
    Today: "Today",
    PassedDay: "PassedDay",
    NeverHoliday: "NeverHoliday",
} as const;

export type DayType = (typeof DayType)[keyof typeof DayType];

export class MonthModel {
    monthIndex: number;
    monthName: string;
    days: CalendarDay[];

    constructor(monthIndex: number, locale: string) {
        this.monthIndex = monthIndex;
        this.monthName = capitalizeFirstLetter(
            new Date(0, monthIndex).toLocaleString(locale, { month: "long" }),
            locale,
        );
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
    isLockedVacationDay?: boolean;
    sharedType?: DayType;
    sharedMatchedRange?: boolean;
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

export const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

export type MonthName = (typeof MONTH_NAMES)[number];
export type MonthlyVacationLimits = Partial<Record<MonthName, number>>;

export interface OptimizationResultBase {
    calendar: {
        days: CalendarDay[];
    };
    selectedVacationDays: string[];
    ranges: VacationRange[];
    totalDaysOff: number;
    vacationDaysUsed: number;
    publicHolidaysCount: number;
    resultToken: string;
    plannerSeed: string;
}

export interface LegacyOptimizeResult extends OptimizationResultBase {
    countryCode?: string;
    scope?: undefined;
}

export type OptimizeResult = LegacyOptimizeResult | IndiaOptimizeResult | SpainOptimizeResult | SwitzerlandOptimizeResult;

export interface SharedOptimizeRequestFields {
    country: string;
    year: number;
    vacationDays: number;
    minimumDaysPerRange?: number;
    maximumDaysPerRange?: number;
    maxNumberOfVacationsPerMonth?: MonthlyVacationLimits;
    customFreeDays?: CustomFreeDay[];
    ignoredHolidayDates?: string[];
    neverHolidayDates?: string[];
    lockedVacationDates?: string[];
    usedResultTokens?: string[];
    seedToken?: string;
}

export interface LegacyOptimizeRequest extends SharedOptimizeRequestFields {
    state?: string;
    stateCode?: never;
}

export type OptimizeRequest = LegacyOptimizeRequest | IndiaOptimizeRequest | SpainOptimizeRequest | SwitzerlandOptimizeRequest;
