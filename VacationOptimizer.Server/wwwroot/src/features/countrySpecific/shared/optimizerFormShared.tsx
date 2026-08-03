import { ChevronDown, ChevronUp, LockOpen, Loader2, Plane } from "lucide-react";
import { getDefaultYear } from "../../../optimizerDefaults";
import { type CustomFreeDay, type MonthlyVacationLimits, type StateOption } from "../../../types/models";
import Button from "../../../components/Button";
import CustomFreeDaysManager from "../../../components/CustomFreeDaysManager";
import { MonthlyVacationCapEditor } from "../../../components/MonthlyVacationCapEditor";

export interface SharedDraft {
    year: number;
    vacationDays: number;
    minimumDaysPerRange: number | null;
    maximumDaysPerRange: number | null;
    maxNumberOfVacationsPerMonth?: MonthlyVacationLimits;
}

export function buildBaseRequest(country: string, draft: SharedDraft, customFreeDays: CustomFreeDay[]) {
    const monthlyVacationLimits = Object.entries(draft.maxNumberOfVacationsPerMonth ?? {})
        .reduce<MonthlyVacationLimits>((active, [month, limit]) => {
            if (limit > 0) {
                active[month as keyof MonthlyVacationLimits] = limit;
            }
            return active;
        }, {});

    return {
        country,
        year: draft.year,
        vacationDays: draft.vacationDays,
        minimumDaysPerRange: draft.minimumDaysPerRange ?? undefined,
        maximumDaysPerRange: draft.maximumDaysPerRange ?? undefined,
        maxNumberOfVacationsPerMonth: Object.keys(monthlyVacationLimits).length > 0
            ? monthlyVacationLimits
            : undefined,
        customFreeDays: customFreeDays.length > 0 ? customFreeDays : undefined,
    };
}

export interface CountryOptimizerFormProps<TCountry extends string> {
    country: TCountry;
    onResult: (req: import("../../../types/models").OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: import("../../../types/models").OptimizeRequest | null;
    sharedDraft: SharedDraft;
    onSharedDraftChange: React.Dispatch<React.SetStateAction<SharedDraft>>;
    lockedVacationDaysCount?: number;
    onResetLockedDays?: () => void;
}

export function StateSelectField({
    id,
    label,
    value,
    onChange,
    disabled,
    includeEmptyOption,
    emptyOptionLabel,
    states,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    includeEmptyOption: boolean;
    emptyOptionLabel: string;
    states: StateOption[];
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-sm font-medium text-text-muted">
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer"
            >
                {includeEmptyOption && <option value="">{emptyOptionLabel}</option>}
                {states.map((entry) => (
                    <option key={entry.code} value={entry.code}>
                        {entry.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function SharedOptimizerControls({
    sharedDraft,
    onSharedDraftChange,
    customFreeDays,
    onCustomFreeDaysChange,
    isLoading,
    isSubmitDisabled,
    showAdvanced,
    onShowAdvancedChange,
    yearMin,
    yearMax,
    lockedVacationDaysCount,
    onResetLockedDays,
}: {
    sharedDraft: SharedDraft;
    onSharedDraftChange: React.Dispatch<React.SetStateAction<SharedDraft>>;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    isLoading: boolean;
    isSubmitDisabled: boolean;
    showAdvanced: boolean;
    onShowAdvancedChange: React.Dispatch<React.SetStateAction<boolean>>;
    yearMin?: number;
    yearMax?: number;
    lockedVacationDaysCount?: number;
    onResetLockedDays?: () => void;
}) {
    const currentYear = getDefaultYear();
    const minimumYear = yearMin ?? currentYear;
    const maximumYear = yearMax ?? currentYear + 5;
    const monthlyVacationLimits = sharedDraft.maxNumberOfVacationsPerMonth ?? {};

    return (
        <>
            <div className="space-y-1.5">
                <label htmlFor="year" className="text-sm font-medium text-text-muted">
                    Year
                </label>
                <div className="flex items-center w-full rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden">
                    <input
                        id="year"
                        type="number"
                        min={minimumYear}
                        max={maximumYear}
                        value={sharedDraft.year}
                        onChange={(e) => onSharedDraftChange((draft) => ({ ...draft, year: Number(e.target.value) }))}
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                    <div className="flex flex-col h-full">
                        <button
                            type="button"
                            onClick={() => onSharedDraftChange((draft) => ({ ...draft, year: Math.min(draft.year + 1, maximumYear) }))}
                            className="flex-1 px-2.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                            aria-label="Increment year"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="h-px bg-border" />
                        <button
                            type="button"
                            onClick={() => onSharedDraftChange((draft) => ({ ...draft, year: Math.max(draft.year - 1, minimumYear) }))}
                            className="flex-1 px-2.5 flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                            aria-label="Decrement year"
                        >
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="vacationDays" className="text-sm font-medium text-text-muted">
                    Vacation Days Budget
                </label>
                <div className="flex items-center gap-3">
                    <input
                        id="vacationDays"
                        type="range"
                        min={1}
                        max={40}
                        value={sharedDraft.vacationDays}
                        onChange={(e) => onSharedDraftChange((draft) => ({ ...draft, vacationDays: Math.max(Number(e.target.value), lockedVacationDaysCount ?? 0) }))}
                        className="flex-1 themed-range"
                    />
                    <span className="text-lg font-semibold text-primary min-w-[2ch] text-right tabular-nums">
                        {sharedDraft.vacationDays}
                    </span>
                    {(lockedVacationDaysCount ?? 0) > 0 && onResetLockedDays && (
                        <button
                            type="button"
                            onClick={onResetLockedDays}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-text cursor-pointer whitespace-nowrap"
                            title="Reset all locked vacation days"
                        >
                            <LockOpen className="w-3 h-3" />
                            Reset locks
                        </button>
                    )}
                </div>
            </div>

            <div className="pt-1 space-y-3">
                <button
                    type="button"
                    onClick={() => onShowAdvancedChange((value) => !value)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-all duration-150 cursor-pointer"
                >
                    <span>Advanced constraints</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
                </button>

                {showAdvanced && (
                    <div className="space-y-4 px-3 py-3 rounded-lg border border-border bg-surface">
                        <div className="space-y-2">
                            <label htmlFor="minimumDaysPerRange" className="text-xs font-medium text-text-muted">
                                Minimum days per range
                            </label>
                            <p className="text-xs text-text-muted/70">Exclude ranges smaller than this. For example, set to 4 to exclude 3-day ranges.</p>
                            <div className="flex items-center gap-3">
                                <input
                                    id="minimumDaysPerRange"
                                    type="range"
                                    min={1}
                                    max={14}
                                    value={sharedDraft.minimumDaysPerRange ?? 1}
                                    onChange={(e) => onSharedDraftChange((draft) => ({ ...draft, minimumDaysPerRange: Number(e.target.value) }))}
                                    className="flex-1 themed-range"
                                />
                                <span className="text-sm font-semibold text-accent min-w-[3ch] text-right tabular-nums">
                                    {sharedDraft.minimumDaysPerRange ?? "off"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="maximumDaysPerRange" className="text-xs font-medium text-text-muted">
                                Maximum days per range
                            </label>
                            <p className="text-xs text-text-muted/70">Exclude ranges larger than this. For example, set to 10 to avoid very long vacation blocks.</p>
                            <div className="flex items-center gap-3">
                                <input
                                    id="maximumDaysPerRange"
                                    type="range"
                                    min={1}
                                    max={31}
                                    value={sharedDraft.maximumDaysPerRange ?? 31}
                                    onChange={(e) => onSharedDraftChange((draft) => ({ ...draft, maximumDaysPerRange: Number(e.target.value) }))}
                                    className="flex-1 themed-range"
                                />
                                <span className="text-sm font-semibold text-accent min-w-[3ch] text-right tabular-nums">
                                    {sharedDraft.maximumDaysPerRange ?? "off"}
                                </span>
                            </div>
                        </div>

                        <MonthlyVacationCapEditor
                            value={monthlyVacationLimits}
                            onChange={(next) => onSharedDraftChange((draft) => ({ ...draft, maxNumberOfVacationsPerMonth: next }))}
                        />

                        <CustomFreeDaysManager customFreeDays={customFreeDays} onUpdate={onCustomFreeDaysChange} />
                    </div>
                )}
            </div>

            <Button type="submit" disabled={isSubmitDisabled || (lockedVacationDaysCount ?? 0) >= sharedDraft.vacationDays} fullWidth>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />}
                {isLoading ? "Optimizing..." : "Optimize"}
            </Button>
        </>
    );
}


