import { useMemo, useState } from "react";
import { DayType, MonthModel } from "../types/models";
import type { CalendarDay } from "../types/models";
import LegendLip from "./LegendLip";
import { MonthGrid, USMonthGrid } from "./MonthGrid";

function parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

interface Props {
    calendar: CalendarDay[];
    year: number;
    country?: string;
    onDayLongPress?: (day: CalendarDay) => void;
    locale?: string | null | undefined;
}

export default function CalendarView({ calendar, year, country, locale, onDayLongPress }: Props) {
    // Start month is determent by the date today
    const startMonth = new Date().getUTCMonth();
    const months: MonthModel[] = Array.from({ length: 12 - startMonth }, (_, i) => new MonthModel(startMonth + i, locale || "en-US"));
    const MonthGridComponent = country === "US" ? USMonthGrid : MonthGrid;
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    calendar.forEach((day) => {
        const d = parseDate(day.date);
        const currentMonth = months.find((m) => m.monthIndex === d.getUTCMonth());
        currentMonth?.addDay(day);
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
        <div className="space-y-4 w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((month, _) => (
                    <MonthGridComponent
                        month={month}
                        year={year}
                        onDayLongPress={onDayLongPress}
                        onDaySelect={setSelectedDay}
                    />
                ))}
            </div>

            {selectedDayDetails && (
                <LegendLip
                    formattedDate={selectedDayDetails.formattedDate}
                    label={selectedDayDetails.label}
                    detail={selectedDayDetails.detail}
                    onClose={() => setSelectedDay(null)}
                />
            )}
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
