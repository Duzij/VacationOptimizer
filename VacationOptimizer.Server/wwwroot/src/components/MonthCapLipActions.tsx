import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { type MonthName } from "../types/models";

interface MonthCapLipActionsProps {
    month: MonthName;
    initialValue: number;
    minValue?: number;
    onApply: (value: number) => void;
}

export function MonthCapLipActions({ month, initialValue, minValue = 0, onApply }: MonthCapLipActionsProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const applyValue = (nextValue: number) => {
        const clamped = Math.min(31, Math.max(minValue, nextValue));
        setValue(clamped);
        onApply(clamped);
    };

    return (
        <div className="flex items-center justify-center gap-3">
            <button
                type="button"
                aria-label={`Decrease ${month} cap`}
                disabled={value <= minValue}
                onClick={() => applyValue(value - 1)}
                className="rounded-md border border-border px-3 py-1.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Minus className="w-3 h-3" />
            </button>
            <span
                aria-label={`${month} cap value`}
                className="w-8 text-center text-sm font-semibold tabular-nums text-text"
            >
                {value}
            </span>
            <button
                type="button"
                aria-label={`Increase ${month} cap`}
                disabled={value >= 31}
                onClick={() => applyValue(value + 1)}
                className="rounded-md border border-border px-3 py-1.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Plus className="w-3 h-3" />
            </button>
        </div>
    );
}
