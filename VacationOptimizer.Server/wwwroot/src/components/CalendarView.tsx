import { DayType } from "../types/models";
import type { CalendarDay } from "../types/models";

interface Props {
    calendar: CalendarDay[];
    year: number;
}

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// Map numeric enum values from backend to string names
const DayTypeMap: Record<number | string, DayType> = {
    0: "WorkDay",
    1: "Weekend",
    2: "PublicHoliday",
    3: "CustomFreeDay",
    4: "Vacation",
    WorkDay: "WorkDay",
    Weekend: "Weekend",
    PublicHoliday: "PublicHoliday",
    CustomFreeDay: "CustomFreeDay",
    Vacation: "Vacation",
};

function normalizeDayType(type: any): DayType {
    return DayTypeMap[type] || "WorkDay";
}

function getDayStyle(type: DayType | number | string): React.CSSProperties {
    const normalizedType = normalizeDayType(type);
    switch (normalizedType) {
        case "Vacation":
            return {
                background: "var(--calendar-vacation-bg)",
                color: "var(--calendar-vacation-text)",
                fontWeight: 600,
            };
        case "CustomFreeDay":
            return {
                background: "var(--calendar-custom-bg)",
                color: "var(--calendar-custom-text)",
            };
        case "PublicHoliday":
            return {
                background: "var(--calendar-holiday-bg)",
                color: "var(--calendar-holiday-text)",
            };
        case "Weekend":
            return {
                background: "var(--calendar-weekend-bg)",
                color: "var(--color-text-muted)",
            };
        case "WorkDay":
            return {
                background: "var(--calendar-workday-bg)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--calendar-workday-border)",
                opacity: 0.7,
            };
        case "Today":
            return {
                background: "var(--calendar-today-bg)",
                color: "var(--calendar-today-text)",
                border: "1px solid var(--calendar-today-border)",
                fontWeight: 600,
            };
        default:
            console.warn("Unknown day type:", type);
            return {
                background: "var(--calendar-workday-bg)",
                color: "var(--color-text-muted)",
                opacity: 0.7,
            };
    }
}

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

export default function CalendarView({ calendar, year }: Props) {
    // Group days by month
    const months: CalendarDay[][] = Array.from({ length: 12 }, () => []);
    calendar.forEach((day) => {
        const d = parseDate(day.date);
        months[d.getUTCMonth()].push(day);
    });
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {months.map((days, monthIdx) => (
                <MonthGrid key={monthIdx} days={days} monthIndex={monthIdx} year={year} />
            ))}
        </div>
    );
}

function MonthGrid({
    days,
    monthIndex,
    year,
}: {
    days: CalendarDay[];
    monthIndex: number;
    year: number;
}) {
    // Calculate offset for the first day (Monday = 0) using UTC
    const firstDay = new Date(Date.UTC(year, monthIndex, 1));
    const startOffset = (firstDay.getUTCDay() + 6) % 7; // Monday-based

    // Sort days by date to ensure correct order
    const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="rounded-xl border border-border bg-surface/50 p-3">
            <h3 className="text-sm font-semibold text-text mb-2 text-center">
                {MONTH_NAMES[monthIndex]} {year}
            </h3>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAY_LABELS.map((label, i) => (
                    <div
                        key={i}
                        className="text-[10px] text-text-muted/50 text-center font-medium"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5">
                {/* Empty cells for offset */}
                {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {sortedDays.map((day) => {
                    const d = parseDate(day.date);
                    const dayNum = d.getUTCDate();
                    const normalizedType = normalizeDayType(day.type);

                    return (
                        <div
                            key={day.date}
                            className="aspect-square flex items-center justify-center rounded-md text-[11px] leading-none transition-colors cursor-default"
                            style={getDayStyle(day.type)}
                            title={
                                day.holidayName
                                    ? `${day.holidayName}`
                                    : normalizedType === "Vacation"
                                        ? "Vacation day"
                                        : undefined
                            }
                        >
                            {dayNum}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
