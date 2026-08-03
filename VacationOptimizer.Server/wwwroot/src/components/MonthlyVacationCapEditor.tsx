import { Minus, Plus, X } from "lucide-react";
import { MONTH_NAMES, type MonthName, type MonthlyVacationLimits } from "../types/models";

interface MonthlyVacationCapEditorProps {
    value: MonthlyVacationLimits;
    onChange: (next: MonthlyVacationLimits) => void;
}

export function MonthlyVacationCapEditor({ value, onChange }: MonthlyVacationCapEditorProps) {
    const activeMonths = MONTH_NAMES.filter((month) => value[month] !== undefined);
    const remainingMonths = MONTH_NAMES.filter((month) => value[month] === undefined);

    const addMonth = (month: MonthName) => {
        onChange({ ...value, [month]: 0 });
    };

    const removeMonth = (month: MonthName) => {
        const next = { ...value };
        delete next[month];
        onChange(next);
    };

    const updateLimit = (month: MonthName, rawValue: number | string) => {
        onChange(setMonthlyVacationLimit(value, month, rawValue));
    };

    return (
        <fieldset className="space-y-2">
            <div>
                <legend className="text-xs font-medium text-text-muted">Monthly vacation-day caps</legend>
                <p className="text-xs text-text-muted/70">Add only the months you want to limit. 0 means no cap.</p>
            </div>

            {activeMonths.length > 0 && (
                <div className="space-y-2">
                    {activeMonths.map((month) => {
                        const currentValue = value[month] ?? 0;
                        return (
                            <div
                                key={month}
                                className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-2 text-xs text-text-muted"
                            >
                                <span className="font-medium">{month}</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-md border border-border overflow-hidden">
                                        <button
                                            type="button"
                                            aria-label={`Decrease ${month} vacation-day cap`}
                                            onClick={() => updateLimit(month, currentValue - 1)}
                                            className="px-2.5 py-1.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <input
                                            aria-label={`${month} vacation-day cap`}
                                            type="number"
                                            min={0}
                                            max={31}
                                            inputMode="numeric"
                                            value={currentValue}
                                            onChange={(event) => updateLimit(month, event.target.value)}
                                            className="w-8 bg-transparent px-0 py-1.5 text-center text-xs tabular-nums text-text focus:outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                        <button
                                            type="button"
                                            aria-label={`Increase ${month} vacation-day cap`}
                                            onClick={() => updateLimit(month, currentValue + 1)}
                                            className="px-2.5 py-1.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label={`Remove ${month} vacation-day cap`}
                                        onClick={() => removeMonth(month)}
                                        className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {remainingMonths.length > 0 && (
                <select
                    aria-label="Add monthly vacation-day cap"
                    value=""
                    onChange={(event) => {
                        const month = event.target.value as MonthName;
                        if (month) {
                            addMonth(month);
                            event.target.value = "";
                        }
                    }}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer text-text"
                >
                    <option value="">Add a month…</option>
                    {remainingMonths.map((month) => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
            )}
        </fieldset>
    );
}

function setMonthlyVacationLimit(
    limits: MonthlyVacationLimits,
    month: MonthName,
    value: number | string,
): MonthlyVacationLimits {
    const nextLimits = { ...limits };
    const parsedValue = typeof value === "string" ? (value.trim() ? Number(value) : 0) : value;

    if (!Number.isFinite(parsedValue)) {
        return nextLimits;
    }

    const clampedValue = Math.min(31, Math.max(0, Math.trunc(parsedValue)));
    if (clampedValue <= 0) {
        delete nextLimits[month];
        return nextLimits;
    }

    nextLimits[month] = clampedValue;
    return nextLimits;
}
