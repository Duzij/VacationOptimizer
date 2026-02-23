import type { OptimizeResult, VacationRange } from "../types/models";
import { Calendar, Palmtree, Sun } from "lucide-react";

interface Props {
    result: OptimizeResult;
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

export default function ResultsSummary({ result }: Props) {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            </div>

            {/* Vacation ranges */}
            {result.ranges.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-muted">
                        Time-off ranges
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.ranges.map((range, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-lg border border-border
                           bg-surface/50 px-3 py-2.5 text-sm"
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
}) {
    return (
        <div className="rounded-lg border border-border bg-surface/50 px-3 py-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
                {icon}
                <span className="text-xl font-bold text-text tabular-nums">
                    {value}
                </span>
            </div>
            <span className="text-[11px] text-text-muted">{label}</span>
        </div>
    );
}
