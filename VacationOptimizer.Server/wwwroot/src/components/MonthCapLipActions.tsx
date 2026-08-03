import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { type MonthName } from "../types/models";

interface MonthCapLipActionsProps {
    month: MonthName;
    initialValue: number;
    onApply: (value: number) => void;
    onClose: () => void;
}

export function MonthCapLipActions({ month, initialValue, onApply, onClose }: MonthCapLipActionsProps) {
    const [value, setValue] = useState(initialValue);

    const clamped = Math.min(31, Math.max(0, value));

    const apply = () => {
        onApply(clamped);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-text-muted">Max vacation days</span>
                <div className="flex items-center rounded-md border border-border overflow-hidden">
                    <button
                        type="button"
                        aria-label={`Decrease ${month} cap`}
                        onClick={() => setValue((current) => Math.max(0, current - 1))}
                        className="px-3 py-1.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <input
                        aria-label={`${month} cap value`}
                        type="number"
                        min={0}
                        max={31}
                        inputMode="numeric"
                        value={value}
                        onChange={(event) => {
                            const parsed = Number(event.target.value);
                            setValue(Number.isFinite(parsed) ? parsed : 0);
                        }}
                        className="w-10 bg-transparent px-0 py-1.5 text-center text-xs tabular-nums text-text focus:outline-none appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                        type="button"
                        aria-label={`Increase ${month} cap`}
                        onClick={() => setValue((current) => Math.min(31, current + 1))}
                        className="px-3 py-1.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover active:scale-95 transition-colors cursor-pointer"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={apply}
                    className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-colors cursor-pointer"
                >
                    Apply
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text active:scale-95 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
