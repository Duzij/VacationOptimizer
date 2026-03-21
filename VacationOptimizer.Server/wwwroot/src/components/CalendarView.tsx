import { useCallback, useMemo, useState } from "react";
import { DayType } from "../types/models";
import type { CalendarDay } from "../types/models";
import { useLongPress } from "../hooks/useLongPress";
import { X } from "lucide-react";

interface Props {
    calendar: CalendarDay[];
    year: number;
    country?: string;
    onDayLongPress?: (day: CalendarDay) => void;
}

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const ISO_DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const US_DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

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

export default function CalendarView({ calendar, year, country, onDayLongPress }: Props) {
    const months: CalendarDay[][] = Array.from({ length: 12 }, () => []);
    const MonthGridComponent = country === "US" ? USMonthGrid : MonthGrid;
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    calendar.forEach((day) => {
        const d = parseDate(day.date);
        months[d.getUTCMonth()].push(day);
    });

    const selectedDayDetails = useMemo(() => {
        if (!selectedDay) {
            return null;
        }

        const formattedDate = parseDate(selectedDay.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
        });

        return {
            formattedDate,
            label: getDayLabel(selectedDay),
            detail: getDayDetail(selectedDay),
        };
    }, [selectedDay]);

    return (
        <div className={`space-y-4 w-full max-w-6xl mx-auto ${selectedDayDetails ? "pb-24 sm:pb-0" : ""}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((days, monthIdx) => (
                    <MonthGridComponent
                        key={monthIdx}
                        days={days}
                        monthIndex={monthIdx}
                        year={year}
                        onDayLongPress={onDayLongPress}
                        onDaySelect={setSelectedDay}
                    />
                ))}
            </div>

            {selectedDayDetails && (
                <div className="fixed inset-x-0 bottom-0 z-20">
                    <div className="border border-border border-b-0 rounded-t-2xl bg-surface shadow-lg px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-text">
                                    {selectedDayDetails.formattedDate}
                                </p>
                                <p className="text-sm text-text-muted">
                                    {selectedDayDetails.label}
                                    {selectedDayDetails.detail ? ` · ${selectedDayDetails.detail}` : ""}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDay(null)}
                                className="rounded-lg p-1 text-text-muted hover:bg-surface-hover hover:text-text transition-colors cursor-pointer"
                                aria-label="Close day details"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
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

function MonthGrid({
    days,
    monthIndex,
    year,
    onDayLongPress,
    onDaySelect,
}: {
    days: CalendarDay[];
    monthIndex: number;
    year: number;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
}) {
    const firstDay = new Date(Date.UTC(year, monthIndex, 1));
    const startOffset = (firstDay.getUTCDay() + 6) % 7;
    const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="rounded-xl border border-border bg-surface/50 p-3">
            <h3 className="text-sm font-semibold text-text mb-2 text-center">
                {MONTH_NAMES[monthIndex]} {year}
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

function USMonthGrid({
    days,
    monthIndex,
    year,
    onDayLongPress,
    onDaySelect,
}: {
    days: CalendarDay[];
    monthIndex: number;
    year: number;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
}) {
    const firstDay = new Date(Date.UTC(year, monthIndex, 1));
    const startOffset = firstDay.getUTCDay();
    const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="rounded-xl border border-border bg-surface/50 p-3">
            <h3 className="text-sm font-semibold text-text mb-2 text-center">
                {MONTH_NAMES[monthIndex]} {year}
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

function getDayLabel(day: CalendarDay): string {
    switch (day.type) {
        case DayType.Vacation:
            return "Vacation day";
        case DayType.CustomFreeDay:
            return "Custom free day";
        case DayType.PublicHoliday:
            return "Public holiday";
        case DayType.Weekend:
            return "Weekend";
        case DayType.PassedDay:
            return "Past day";
        case DayType.Today:
            return "Today";
        case DayType.WorkDay:
        default:
            return "Work day";
    }
}

function getDayDetail(day: CalendarDay): string | null {
    if (day.holidayName) {
        return day.holidayName;
    }

    if (day.type === DayType.Today) {
        return "Current day";
    }

    return null;
}
