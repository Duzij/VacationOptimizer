import { useCallback, useEffect, useRef, useState } from "react";
import { Gauge, LockKeyhole } from "lucide-react";
import { DayType, MONTH_NAMES } from "../types/models";
import type { CalendarDay, MonthModel, MonthlyVacationLimits } from "../types/models";
import { useLongPress } from "../hooks/useLongPress";

const ISO_DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const US_DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface GridProps {
    month: MonthModel;
    year: number;
    id?: string;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
    previousCalendarDay?: CalendarDay;
    nextCalendarDay?: CalendarDay;
    monthlyCaps?: MonthlyVacationLimits;
    onSetMonthCap?: (monthIndex: number, monthName: string) => void;
}

type HolidayRangePosition = "single" | "first" | "middle" | "last" | null;

function getDayClass(type: DayType | string): string {
    switch (type) {
        case "Vacation": return "bg-vacation font-semibold";
        case "CustomFreeDay": return "bg-custom";
        case "PublicHoliday": return "bg-holiday";
        case "CollectiveLeave": return "bg-collective-leave";
        case "Weekend": return "bg-weekend";
        case "PassedDay": return "bg-past";
        case "OutOfRange": return "bg-out-of-range";
        case "Today": return "bg-today";
        case "NeverHoliday": return "bg-never-holiday";
        case "WorkDay": return "bg-workday opacity-70";
        default:
            console.warn("Unknown day type:", type);
            return "bg-workday opacity-70";
    }
}

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function getSharedClass(day: CalendarDay) {
    if (!day.sharedType) {
        return "";
    }

    const shouldShowSharedIndicator = day.sharedType !== day.type
        || day.sharedType === DayType.PublicHoliday
        || day.sharedType === DayType.CollectiveLeave
        || day.sharedType === DayType.Vacation;
    if (!shouldShowSharedIndicator) {
        return "";
    }

    if (day.sharedType === DayType.Vacation) return "shared-vacation";
    if (day.sharedType === DayType.WorkDay) return "shared-workday";
    if (day.sharedType === DayType.PublicHoliday) return "shared-holiday";
    if (day.sharedType === DayType.CollectiveLeave) return "shared-collective-leave";
    if (day.sharedType === DayType.NeverHoliday) return "shared-never-holiday";

    return "";
}

function isHolidayRangeDay(day: CalendarDay | undefined) {
    return Boolean(day?.holidayRange) || day?.sharedMatchedRange === true;
}

function areInSameHolidayRange(day: CalendarDay, otherDay: CalendarDay | undefined) {
    if (!isHolidayRangeDay(otherDay)) {
        return false;
    }

    if (!day.holidayRange && !otherDay?.holidayRange) {
        return true;
    }

    return day.holidayRange?.start === otherDay?.holidayRange?.start
        && day.holidayRange?.end === otherDay?.holidayRange?.end;
}

function areConsecutiveDays(left: CalendarDay | undefined, right: CalendarDay | undefined) {
    if (!left || !right) {
        return false;
    }

    const leftDate = parseDate(left.date);
    const rightDate = parseDate(right.date);
    const diffInMs = rightDate.getTime() - leftDate.getTime();

    return diffInMs === 24 * 60 * 60 * 1000;
}

function getHolidayRangePosition(
    day: CalendarDay,
    previousDay: CalendarDay | undefined,
    nextDay: CalendarDay | undefined,
): HolidayRangePosition {
    if (!isHolidayRangeDay(day)) {
        return null;
    }

    const hasPreviousMatch = areInSameHolidayRange(day, previousDay) && areConsecutiveDays(previousDay, day);
    const hasNextMatch = areInSameHolidayRange(day, nextDay) && areConsecutiveDays(day, nextDay);

    if (hasPreviousMatch && hasNextMatch) {
        return "middle";
    }

    if (hasPreviousMatch) {
        return "last";
    }

    if (hasNextMatch) {
        return "first";
    }

    return "single";
}

function getDayTitle(day: CalendarDay): string {
    const title = getDayTypeTitle(day);

    if (!day.holidayRange) {
        return title;
    }

    const { totalDaysOff, vacationDaysUsed } = day.holidayRange;
    const totalDaysLabel = totalDaysOff === 1 ? "day" : "days";
    const ptoDaysLabel = vacationDaysUsed === 1 ? "PTO day" : "PTO days";

    return `${title} · ${totalDaysOff} ${totalDaysLabel} off · ${vacationDaysUsed} ${ptoDaysLabel} used`;
}

function getDayTypeTitle(day: CalendarDay): string {
    if (day.isLockedVacationDay) {
        return "Locked vacation day";
    }

    switch (day.type) {
        case DayType.PublicHoliday:
            return day.holidayName ? `Public holiday: ${day.holidayName}` : "Public holiday";
        case DayType.CollectiveLeave:
            return day.holidayName ? `Collective leave: ${day.holidayName}` : "Collective leave day";
        case DayType.CustomFreeDay:
            return day.holidayName && !day.holidayName.startsWith("Custom free day")
                ? `Custom free day: ${day.holidayName}`
                : "Custom free day";
        case DayType.Vacation:
            return "Vacation day";
        case DayType.NeverHoliday:
            return "Never a holiday";
        case DayType.Weekend:
            return "Weekend";
        case DayType.PassedDay:
            return "Past day";
        case DayType.OutOfRange:
            return "Outside selected period";
        case DayType.Today:
            return "Today";
        case DayType.WorkDay:
        default:
            return "Work day";
    }
}

function DayCell({
    day,
    holidayRangePosition,
    onDayLongPress,
    onDaySelect,
}: {
    day: CalendarDay;
    holidayRangePosition: HolidayRangePosition;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
}) {
    // const isLongPressEnabled = day.type !== "PassedDay";
    const isLongPressEnabled = day.type !== DayType.OutOfRange;

    const [isFlashing, setIsFlashing] = useState(false);
    const prevTypeRef = useRef(day.type);

    useEffect(() => {
        if (prevTypeRef.current !== day.type) {
            setIsFlashing(true);
            prevTypeRef.current = day.type;

            const timer = setTimeout(() => {
                setIsFlashing(false);
            }, 600); // match CSS animation duration

            return () => clearTimeout(timer);
        }
    }, [day.type]);

    const handleLongPress = useCallback(() => {
        if (!isLongPressEnabled) {
            return;
        }
        onDayLongPress?.(day);
    }, [day, isLongPressEnabled, onDayLongPress]);

    const { isPressed, ...longPressHandlers } = useLongPress(handleLongPress);
    const dayNum = parseDate(day.date).getUTCDate();

    const sharedClass = getSharedClass(day);
    const sharedBaseClass = sharedClass ? "shared-vacation-icon " + sharedClass : "";
    const holidayRangeClass = holidayRangePosition
        ? `holiday-range holiday-range-${holidayRangePosition}`
        : "";

    return (
        <div
            className={`${sharedBaseClass} ${holidayRangeClass} relative aspect-square flex items-center justify-center rounded-md text-[11px] leading-none select-none ${getDayClass(day.type)} ${isLongPressEnabled ? "cursor-pointer" : "cursor-default"} ${isPressed ? "day-pressing" : ""} ${isFlashing ? "animate-cell-flash z-10" : "transition-colors"}`}
            title={getDayTitle(day)}
            onClick={() => onDaySelect?.(day)}
            {...(isLongPressEnabled ? longPressHandlers : {})}
        >
            <time dateTime={day.date}>{dayNum}</time>
            {day.isLockedVacationDay && (
                <LockKeyhole className="locked-vacation-icon" aria-hidden="true" />
            )}
        </div>
    );
}

function MonthHeader({
    month,
    year,
    monthlyCaps,
    onSetMonthCap,
}: {
    month: MonthModel;
    year: number;
    monthlyCaps?: MonthlyVacationLimits;
    onSetMonthCap?: (monthIndex: number, monthName: string) => void;
}) {
    const monthName = MONTH_NAMES[month.monthIndex];
    const cap = monthlyCaps?.[monthName] ?? 0;

    return (
        <div className="relative flex items-center justify-center mb-2">
            <h3 className="text-sm font-semibold text-text text-center">
                <time dateTime={`${year}-${String(month.monthIndex + 1).padStart(2, "0")}`}>
                    {month.monthName} {year}
                </time>
            </h3>
            <button
                type="button"
                aria-label={`Set ${month.monthName} vacation-day cap`}
                onClick={() => onSetMonthCap?.(month.monthIndex, month.monthName)}
                className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-1 text-[10px] font-medium text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer"
            >
                {cap > 0 && <span className="text-primary tabular-nums">{cap}</span>}
                <Gauge className="w-3 h-3" />
            </button>
        </div>
    );
}

export function MonthGrid({ month, year, id, onDayLongPress, onDaySelect, previousCalendarDay, nextCalendarDay, monthlyCaps, onSetMonthCap }: GridProps) {
    const firstDay = new Date(Date.UTC(year, month.monthIndex, 1));
    const startOffset = (firstDay.getUTCDay() + 6) % 7;
    const sortedDays = [...month.days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div id={id} className="rounded-xl border border-border bg-surface/50 p-3 scroll-mt-24">
            <MonthHeader
                month={month}
                year={year}
                monthlyCaps={monthlyCaps}
                onSetMonthCap={onSetMonthCap}
            />

            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {ISO_DAY_LABELS.map((label, i) => (
                    <div key={i} className="text-[10px] text-text-muted/50 text-center font-medium">
                        {label}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {sortedDays.map((day, index) => (
                    <DayCell
                        key={day.date}
                        day={day}
                        holidayRangePosition={getHolidayRangePosition(
                            day,
                            sortedDays[index - 1] ?? previousCalendarDay,
                            sortedDays[index + 1] ?? nextCalendarDay,
                        )}
                        onDayLongPress={onDayLongPress}
                        onDaySelect={onDaySelect}
                    />
                ))}
            </div>
        </div>
    );
}

export function USMonthGrid({ month, year, id, onDayLongPress, onDaySelect, previousCalendarDay, nextCalendarDay, monthlyCaps, onSetMonthCap }: GridProps) {
    const firstDay = new Date(Date.UTC(year, month.monthIndex, 1));
    const startOffset = firstDay.getUTCDay();
    const sortedDays = [...month.days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div id={id} className="rounded-xl border border-border bg-surface/50 p-3 scroll-mt-24">
            <MonthHeader
                month={month}
                year={year}
                monthlyCaps={monthlyCaps}
                onSetMonthCap={onSetMonthCap}
            />

            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {US_DAY_LABELS.map((label, i) => (
                    <div key={i} className="text-[10px] text-text-muted/50 text-center font-medium">
                        {label}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {sortedDays.map((day, index) => (
                    <DayCell
                        key={day.date}
                        day={day}
                        holidayRangePosition={getHolidayRangePosition(
                            day,
                            sortedDays[index - 1] ?? previousCalendarDay,
                            sortedDays[index + 1] ?? nextCalendarDay,
                        )}
                        onDayLongPress={onDayLongPress}
                        onDaySelect={onDaySelect}
                    />
                ))}
            </div>
        </div>
    );
}
