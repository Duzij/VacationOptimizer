import { useCallback } from "react";
import { DayType } from "../types/models";
import type { CalendarDay, MonthModel } from "../types/models";
import { useLongPress } from "../hooks/useLongPress";

const ISO_DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const US_DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface GridProps {
    month: MonthModel;
    year: number;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
}

function getDayClass(type: DayType | string): string {
    switch (type) {
        case "Vacation": return "bg-vacation font-semibold";
        case "CustomFreeDay": return "bg-custom";
        case "PublicHoliday": return "bg-holiday";
        case "Weekend": return "bg-weekend";
        case "PassedDay": return "bg-past";
        case "Today": return "bg-today";
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

function DayCell({
    day,
    onDayLongPress,
    onDaySelect,
}: {
    day: CalendarDay;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
}) {
    // const isLongPressEnabled = day.type !== "PassedDay";
    const isLongPressEnabled = true;

    const handleLongPress = useCallback(() => {
        if (!isLongPressEnabled) {
            return;
        }
        onDayLongPress?.(day);
    }, [day, isLongPressEnabled, onDayLongPress]);

    const { isPressed, ...longPressHandlers } = useLongPress(handleLongPress);
    const dayNum = parseDate(day.date).getUTCDate();

    return (
        <div
            className={`aspect-square flex items-center justify-center rounded-md text-[11px] leading-none transition-colors select-none ${getDayClass(day.type)} ${isLongPressEnabled ? "cursor-pointer" : "cursor-default"} ${isPressed ? "day-pressing" : ""}`}
            title={
                day.holidayName ? day.holidayName
                    : day.type === "Vacation" ? "Vacation day"
                        : undefined
            }
            onClick={() => onDaySelect?.(day)}
            {...(isLongPressEnabled ? longPressHandlers : {})}
        >
            {dayNum}
        </div>
    );
}

export function MonthGrid({ month, year, onDayLongPress, onDaySelect }: GridProps) {
    const firstDay = new Date(Date.UTC(year, month.monthIndex, 1));
    const startOffset = (firstDay.getUTCDay() + 6) % 7;
    const sortedDays = [...month.days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="rounded-xl border border-border bg-surface/50 p-3">
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

                {sortedDays.map((day) => (
                    <DayCell key={day.date} day={day} onDayLongPress={onDayLongPress} onDaySelect={onDaySelect} />
                ))}
            </div>
        </div>
    );
}

export function USMonthGrid({ month, year, onDayLongPress, onDaySelect }: GridProps) {
    const firstDay = new Date(Date.UTC(year, month.monthIndex, 1));
    const startOffset = firstDay.getUTCDay();
    const sortedDays = [...month.days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="rounded-xl border border-border bg-surface/50 p-3">
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

                {sortedDays.map((day) => (
                    <DayCell key={day.date} day={day} onDayLongPress={onDayLongPress} onDaySelect={onDaySelect} />
                ))}
            </div>
        </div>
    );
}
