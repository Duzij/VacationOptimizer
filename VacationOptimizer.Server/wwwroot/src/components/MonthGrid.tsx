import { useCallback, useEffect, useRef, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { DayType } from "../types/models";
import type { CalendarDay, MonthModel } from "../types/models";
import { useLongPress } from "../hooks/useLongPress";

const ISO_DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const US_DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface GridProps {
    month: MonthModel;
    year: number;
    id?: string;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
}

type SharedHolidayRangePosition = "single" | "first" | "middle" | "last" | null;

function getDayClass(type: DayType | string): string {
    switch (type) {
        case "Vacation": return "bg-vacation font-semibold";
        case "CustomFreeDay": return "bg-custom";
        case "PublicHoliday": return "bg-holiday";
        case "CollectiveLeave": return "bg-collective-leave";
        case "Weekend": return "bg-weekend";
        case "PassedDay": return "bg-past";
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

function isMatchingSharedRangeDay(day: CalendarDay | undefined) {
    return day?.sharedMatchedRange === true;
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

function getSharedHolidayRangePosition(
    day: CalendarDay,
    previousDay: CalendarDay | undefined,
    nextDay: CalendarDay | undefined,
): SharedHolidayRangePosition {
    if (!isMatchingSharedRangeDay(day)) {
        return null;
    }

    const hasPreviousMatch = isMatchingSharedRangeDay(previousDay) && areConsecutiveDays(previousDay, day);
    const hasNextMatch = isMatchingSharedRangeDay(nextDay) && areConsecutiveDays(day, nextDay);

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

function DayCell({
    day,
    sharedHolidayRangePosition,
    onDayLongPress,
    onDaySelect,
}: {
    day: CalendarDay;
    sharedHolidayRangePosition: SharedHolidayRangePosition;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
}) {
    // const isLongPressEnabled = day.type !== "PassedDay";
    const isLongPressEnabled = true;

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
    const sharedHolidayRangeClass = sharedHolidayRangePosition
        ? `shared-holiday-range shared-holiday-range-${sharedHolidayRangePosition}`
        : "";

    return (
        <div
            className={`${sharedBaseClass} ${sharedHolidayRangeClass} relative aspect-square flex items-center justify-center rounded-md text-[11px] leading-none select-none ${getDayClass(day.type)} ${isLongPressEnabled ? "cursor-pointer" : "cursor-default"} ${isPressed ? "day-pressing" : ""} ${isFlashing ? "animate-cell-flash z-10" : "transition-colors"}`}
            title={
                day.isLockedVacationDay ? "Locked vacation day"
                    : day.holidayName ? day.holidayName
                    : day.type === "Vacation" ? "Vacation day"
                        : day.type === "NeverHoliday" ? "Never a holiday"
                        : undefined
            }
            onClick={() => onDaySelect?.(day)}
            {...(isLongPressEnabled ? longPressHandlers : {})}
        >
            {dayNum}
            {day.isLockedVacationDay && (
                <LockKeyhole className="locked-vacation-icon" aria-hidden="true" />
            )}
        </div>
    );
}

export function MonthGrid({ month, year, id, onDayLongPress, onDaySelect }: GridProps) {
    const firstDay = new Date(Date.UTC(year, month.monthIndex, 1));
    const startOffset = (firstDay.getUTCDay() + 6) % 7;
    const sortedDays = [...month.days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div id={id} className="rounded-xl border border-border bg-surface/50 p-3 scroll-mt-24">
            <h3 className="text-sm font-semibold text-text mb-2 text-center">
                {month.monthName} {year}
            </h3>

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
                        sharedHolidayRangePosition={getSharedHolidayRangePosition(day, sortedDays[index - 1], sortedDays[index + 1])}
                        onDayLongPress={onDayLongPress}
                        onDaySelect={onDaySelect}
                    />
                ))}
            </div>
        </div>
    );
}

export function USMonthGrid({ month, year, id, onDayLongPress, onDaySelect }: GridProps) {
    const firstDay = new Date(Date.UTC(year, month.monthIndex, 1));
    const startOffset = firstDay.getUTCDay();
    const sortedDays = [...month.days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div id={id} className="rounded-xl border border-border bg-surface/50 p-3 scroll-mt-24">
            <h3 className="text-sm font-semibold text-text mb-2 text-center">
                {month.monthName} {year}
            </h3>

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
                        sharedHolidayRangePosition={getSharedHolidayRangePosition(day, sortedDays[index - 1], sortedDays[index + 1])}
                        onDayLongPress={onDayLongPress}
                        onDaySelect={onDaySelect}
                    />
                ))}
            </div>
        </div>
    );
}
