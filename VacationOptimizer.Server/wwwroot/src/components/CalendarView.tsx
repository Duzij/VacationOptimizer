import { useMemo } from "react";
import { DayType, MonthModel } from "../types/models";
import type { CalendarDay, MonthlyVacationLimits, VacationRange } from "../types/models";
import { MonthGrid, USMonthGrid } from "./MonthGrid";
import { useQuery } from "@tanstack/react-query";
import { decodeSeed } from "../api/vacationApi";

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

interface Props {
    calendar?: CalendarDay[];
    ranges?: VacationRange[];
    year: number;
    country?: string;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
    locale?: string | null | undefined;
    connectedToken?: string;
    monthlyCaps?: MonthlyVacationLimits;
    onSetMonthCap?: (monthIndex: number) => void;
}

function toDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

function buildDateSetForRanges(ranges: VacationRange[]) {
    const dates = new Set<string>();

    ranges.forEach((range) => {
        let current = parseDate(range.start);
        const end = parseDate(range.end);

        while (current <= end) {
            dates.add(toDateKey(current));
            current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
        }
    });

    return dates;
}

function isConnectedRangeDay(day: CalendarDay) {
    return day.type !== DayType.WorkDay && day.type !== DayType.NeverHoliday;
}

function buildConnectedRanges(calendar: CalendarDay[]) {
    const ranges: VacationRange[] = [];
    let index = 0;

    while (index < calendar.length) {
        if (!isConnectedRangeDay(calendar[index]!)) {
            index++;
            continue;
        }

        const startIndex = index;
        let vacationDaysUsed = 0;

        while (index < calendar.length && isConnectedRangeDay(calendar[index]!)) {
            if (calendar[index]!.type === DayType.Vacation) {
                vacationDaysUsed++;
            }

            index++;
        }

        const endIndex = index - 1;
        const totalDaysOff = endIndex - startIndex + 1;

        if (vacationDaysUsed > 0 || totalDaysOff >= 3) {
            ranges.push({
                start: calendar[startIndex]!.date,
                end: calendar[endIndex]!.date,
                totalDaysOff,
                vacationDaysUsed,
            });
        }
    }

    return ranges;
}

function getStartMonthForYear(year: number, today = new Date()) {
    const currentYear = today.getUTCFullYear();

    if (year === currentYear) {
        return today.getUTCMonth();
    }

    return 0;
}

export default function CalendarView({ calendar, ranges = [], year, country, locale, onDayLongPress, onDaySelect, connectedToken, monthlyCaps, onSetMonthCap }: Props) {
    const startMonth = getStartMonthForYear(year);
    const MonthGridComponent = country === "US" ? USMonthGrid : MonthGrid;

    const { data: sharedDays } = useQuery({
        queryKey: ["decode-seed", connectedToken],
        queryFn: () => decodeSeed(connectedToken!),
        enabled: Boolean(connectedToken),
        staleTime: Infinity,
        retry: false
    });

    const matchedRangeDates = useMemo(() => {
        if (!calendar || !sharedDays || sharedDays.length !== calendar.length || ranges.length === 0) {
            return new Set<string>();
        }

        const connectedCalendar = calendar.map((day, index) => ({
            ...day,
            type: sharedDays[index] ?? day.type,
            sharedType: undefined,
            sharedMatchedRange: undefined,
            isLockedVacationDay: false,
        }));

        const plannerRangeDates = buildDateSetForRanges(ranges);
        const connectedRangeDates = buildDateSetForRanges(buildConnectedRanges(connectedCalendar));
        const nextMatchedRangeDates = new Set<string>();

        plannerRangeDates.forEach((date) => {
            if (connectedRangeDates.has(date)) {
                nextMatchedRangeDates.add(date);
            }
        });

        return nextMatchedRangeDates;
    }, [calendar, ranges, sharedDays]);

    const decoratedCalendar = useMemo(() => {
        if (!calendar) {
            return [];
        }

        return calendar.map((day, index) => (
            sharedDays && sharedDays[index]
                ? {
                    ...day,
                    sharedType: sharedDays[index],
                    // Mark the full continuous matched time-off span so the
                    // shared range styling can extend through holidays,
                    // weekends, and suggested vacation days.
                    sharedMatchedRange: matchedRangeDates.has(day.date),
                }
                : day
        ));
    }, [calendar, sharedDays, matchedRangeDates]);

    const months = useMemo(() => {
        const nextMonths: MonthModel[] = Array.from(
            { length: 12 - startMonth },
            (_, i) => new MonthModel(startMonth + i, locale || "en-US"),
        );

        decoratedCalendar.forEach((day) => {
            const d = parseDate(day.date);
            const currentMonth = nextMonths.find((m) => m.monthIndex === d.getUTCMonth());
            if (currentMonth) {
                currentMonth.addDay(day);
            }
        });

        return nextMonths;
    }, [decoratedCalendar, locale, startMonth]);

    return (
        <div className="space-y-4 w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((month) => (
                    <MonthGridComponent
                        key={month.monthIndex}
                        id={`calendar-month-${month.monthIndex}`}
                        month={month}
                        year={year}
                        onDayLongPress={onDayLongPress}
                        onDaySelect={onDaySelect}
                        monthlyCaps={monthlyCaps}
                        onSetMonthCap={onSetMonthCap}
                    />
                ))}
            </div>
        </div>
    );
}
