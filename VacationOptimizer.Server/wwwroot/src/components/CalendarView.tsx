import { useCallback } from "react";
import { DayType } from "../types/models";
import type { CalendarDay } from "../types/models";
import { useLongPress } from "../hooks/useLongPress";

interface Props {
    calendar: CalendarDay[];
    year: number;
    onDayLongPress?: (date: string) => void;
}

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

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

export default function CalendarView({ calendar, year, onDayLongPress }: Props) {
    const months: CalendarDay[][] = Array.from({ length: 12 }, () => []);

    calendar.forEach((day) => {
        const d = parseDate(day.date);
        months[d.getUTCMonth()].push(day);
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {months.map((days, monthIdx) => (
                <MonthGrid key={monthIdx} days={days} monthIndex={monthIdx} year={year} onDayLongPress={onDayLongPress} />
            ))}
        </div>
    );
}

function DayCell({ day, onDayLongPress }: { day: CalendarDay; onDayLongPress?: (date: string) => void }) {
    const handleLongPress = useCallback(() => {
        onDayLongPress?.(day.date);
    }, [day.date, onDayLongPress]);

    const { isPressed, ...longPressHandlers } = useLongPress(handleLongPress);
    const dayNum = parseDate(day.date).getUTCDate();

    return (
        <div
            className={`aspect-square flex items-center justify-center rounded-md text-[11px] leading-none transition-colors cursor-pointer select-none ${getDayClass(day.type)} ${isPressed ? "day-pressing" : ""}`}
            title={
                day.holidayName ? day.holidayName
                    : day.type === "Vacation" ? "Vacation day"
                        : undefined
            }
            {...longPressHandlers}
        >
            {dayNum}
        </div>
    );
}

function MonthGrid({ days, monthIndex, year, onDayLongPress }: { days: CalendarDay[]; monthIndex: number; year: number; onDayLongPress?: (date: string) => void }) {
    const firstDay = new Date(Date.UTC(year, monthIndex, 1));
    const startOffset = (firstDay.getUTCDay() + 6) % 7;
    const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="rounded-xl border border-border bg-surface/50 p-3">
            <h3 className="text-sm font-semibold text-text mb-2 text-center">
                {MONTH_NAMES[monthIndex]} {year}
            </h3>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAY_LABELS.map((label, i) => (
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
                    <DayCell key={day.date} day={day} onDayLongPress={onDayLongPress} />
                ))}
            </div>
        </div>
    );
}