export interface Country {
    code: string;
    name: string;
}

export interface StateOption {
    code: string;
    name: string;
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

export interface OptimizeResult {
    calendar: CalendarDay[];
    selectedVacationDays: string[];
    ranges: VacationRange[];
    totalDaysOff: number;
    vacationDaysUsed: number;
    publicHolidaysCount: number;
}

export interface OptimizeRequest {
    country: string;
    state?: string;
    year: number;
    vacationDays: number;
    minimumDaysPerRange?: number;
    maximumDaysPerRange?: number;
    customFreeDays?: CustomFreeDay[];
}
