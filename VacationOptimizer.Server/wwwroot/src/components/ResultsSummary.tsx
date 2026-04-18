import { useEffect, useRef, useState } from "react";
import type { OptimizeResult, VacationRange } from "../types/models";
import { Calendar, ChevronDown, ChevronRight, Palmtree, PointerIcon, Sun } from "lucide-react";

interface Props {
    result: OptimizeResult;
    shouldScroll?: boolean;
}

function formatDate(dateStr: string): string {
    // Parse YYYY-MM-DD format in UTC to avoid timezone issues
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function formatRange(range: VacationRange): string {
    return `${formatDate(range.start)} – ${formatDate(range.end)}`;
}

function getMonthIndexFromDate(dateStr: string): number {
    const [, month] = dateStr.split("-").map(Number);
    return month - 1; // 0-indexed
}

function scrollToMonth(dateStr: string) {
    const monthIndex = getMonthIndexFromDate(dateStr);
    const el = document.getElementById(`calendar-month-${monthIndex}`);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

export default function ResultsSummary({ result, shouldScroll = false }: Props) {
    const timeOffRangesRef = useRef<HTMLButtonElement>(null);
    const [isRangesOpen, setIsRangesOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 640; // open by default on mobile (<640px)
        }
        return true;
    });

    useEffect(() => {
        if (result.ranges.length > 0 && timeOffRangesRef.current && shouldScroll) {
            // Small delay to ensure DOM is fully rendered
            setTimeout(() => {
                timeOffRangesRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    }, [result, shouldScroll]);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    icon={<Palmtree className="w-3 h-4 text-vacation-text" />}
                    label="Vacation days used"
                    value={result.vacationDaysUsed}
                />
                <StatCard
                    icon={<Calendar className="w-3 h-4 text-primary" />}
                    label="Total days off"
                    value={result.totalDaysOff}
                />
                <StatCard
                    icon={<Sun className="w-3 h-4 text-holiday-text" />}
                    label="Vacation ranges"
                    value={result.ranges.length}
                />
                <StatCard
                    icon={<PointerIcon className="w-3 h-4 text-holiday-text" />}
                    label="Short or long press on a day cell for interaction"
                    value={""}
                    inverted={true}
                />
            </div>

            {/* Vacation ranges */}
            {result.ranges.length > 0 && (
                <div className="space-y-2">
                    <button
                        ref={timeOffRangesRef}
                        type="button"
                        onClick={() => setIsRangesOpen((o) => !o)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text transition-colors cursor-pointer appearance-none bg-transparent pt-1"
                    >
                        {isRangesOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                        Time-off ranges
                    </button>
                    {isRangesOpen && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            {result.ranges.map((range, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => scrollToMonth(range.start)}
                                    className="flex items-center justify-between rounded-lg border border-border
                               bg-surface/50 px-3 py-2.5 text-sm cursor-pointer
                               transition-colors hover:bg-surface-hover group text-left"
                                >
                                    <span className="text-text font-medium">
                                        {formatRange(range)}
                                    </span>
                                    <div className="flex items-center gap-2 text-vacation-text text-xs">
                                        <span>{range.totalDaysOff}d off</span>
                                        {range.vacationDaysUsed > 0 && (
                                            <span className="text-text-muted">
                                                {range.vacationDaysUsed} vac
                                            </span>
                                        )}
                                        <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    inverted = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string | undefined;
    inverted?: boolean;
}) {
    return (
        <div
            className={`rounded-lg border border-border bg-surface/50 px-3 py-3 text-center ${
                inverted ? "inverted" : ""
            }`}
        >
            <div className="flex items-center justify-center gap-1.5 mb-1">
                {icon}
                {value && (
                    <span className="text-xl font-bold text-text tabular-nums">
                        {value}
                    </span>
                )}
            </div>
            <span className="text-[11px] text-text-muted">{label}</span>
        </div>
    );
}
