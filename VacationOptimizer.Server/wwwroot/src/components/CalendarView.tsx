import { MonthModel } from "../types/models";
import type { CalendarDay } from "../types/models";
import { MonthGrid, USMonthGrid } from "./MonthGrid";

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

interface Props {
    calendar?: CalendarDay[];
    year: number;
    country?: string;
    onDayLongPress?: (day: CalendarDay) => void;
    onDaySelect?: (day: CalendarDay) => void;
    locale?: string | null | undefined;
}

export default function CalendarView({ calendar, year, country, locale, onDayLongPress, onDaySelect }: Props) {
    // Start month is determent by the date today
    const startMonth = new Date().getUTCMonth();
    const months: MonthModel[] = Array.from({ length: 12 - startMonth }, (_, i) => new MonthModel(startMonth + i, locale || "en-US"));
    const MonthGridComponent = country === "US" ? USMonthGrid : MonthGrid;

    if (calendar) {
        calendar.forEach((day) => {
            const d = parseDate(day.date);
            const currentMonth = months.find((m) => m.monthIndex === d.getUTCMonth());
            currentMonth?.addDay(day);
        });
    }

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
                    />
                ))}
            </div>
        </div>
    );
}
