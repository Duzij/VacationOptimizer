import { useEffect, useState } from "react";
import { useCountries, useStates } from "../api/vacationApi";
import type { CustomFreeDay, OptimizeRequest } from "../types/models";
import { ChevronDown, ChevronUp, Loader2, Plane } from "lucide-react";
import CustomFreeDaysManager from "./CustomFreeDaysManager";

interface Props {
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
}

export default function OptimizerForm({ onResult, isLoading, customFreeDays, onCustomFreeDaysChange }: Props) {
    const currentYear = new Date().getFullYear();
    const [country, setCountry] = useState("ES");
    const [state, setState] = useState("");
    const [year, setYear] = useState(currentYear);
    const [vacationDays, setVacationDays] = useState(25);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [minimumDaysPerRange, setMinimumDaysPerRange] = useState<
        number | null
    >(4);
    const [maximumDaysPerRange, setMaximumDaysPerRange] = useState<
        number | null
    >(14);


    const { data: countries, isLoading: countriesLoading } = useCountries();
    const { data: states, isLoading: statesLoading } = useStates(country);

    useEffect(() => {
        if (!states?.some((entry) => entry.code === state)) {
            setState("");
        }
    }, [state, states]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const request: OptimizeRequest = {
            country,
            year,
            vacationDays,
        };
        if (minimumDaysPerRange !== null) {
            request.minimumDaysPerRange = minimumDaysPerRange;
        }
        if (maximumDaysPerRange !== null) {
            request.maximumDaysPerRange = maximumDaysPerRange;
        }
        if (state) {
            request.state = state;
        }
        if (customFreeDays.length > 0) {
            request.customFreeDays = customFreeDays;
        }
        onResult(request);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto space-y-5"
        >
            {/* Country */}
            <div className="space-y-1.5">
                <label
                    htmlFor="country"
                    className="text-sm font-medium text-text-muted"
                >
                    Country
                </label>
                <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={countriesLoading}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer"
                >
                    {countriesLoading && <option>Loading...</option>}
                    {countries?.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {states && states.length > 0 && (
                <div className="space-y-1.5">
                    <label
                        htmlFor="state"
                        className="text-sm font-medium text-text-muted"
                    >
                        State / Region
                    </label>
                    <select
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        disabled={statesLoading}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer"
                    >
                        <option value="">National holidays only</option>
                        {states.map((entry) => (
                            <option key={entry.code} value={entry.code}>
                                {entry.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Year */}
            {/* Year */}
            <div className="space-y-1.5">
                <label
                    htmlFor="year"
                    className="text-sm font-medium text-text-muted"
                >
                    Year
                </label>
                <div className="flex items-center w-full rounded-lg border border-border bg-surface
                    focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary
                    transition-all overflow-hidden">
                    <input
                        id="year"
                        type="number"
                        min={currentYear}
                        max={currentYear + 5}
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-text
                       focus:outline-none appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none
                       [&::-webkit-outer-spin-button]:appearance-none
                       [-moz-appearance:textfield]"
                    />
                    <div className="flex flex-col h-full">
                        <button
                            type="button"
                            onClick={() =>
                                setYear((y) =>
                                    Math.min(y + 1, currentYear + 5)
                                )}
                            className="flex-1 px-2.5 flex items-center justify-center
                           text-text-muted hover:text-text hover:bg-surface-hover
                           transition-colors cursor-pointer"
                            aria-label="Increment year"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </button>
                        <div className="h-px bg-border" />
                        <button
                            type="button"
                            onClick={() =>
                                setYear((y) => Math.max(y - 1, currentYear))}
                            className="flex-1 px-2.5 flex items-center justify-center
                           text-text-muted hover:text-text hover:bg-surface-hover
                           transition-colors cursor-pointer"
                            aria-label="Decrement year"
                        >
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Vacation Days */}
            <div className="space-y-1.5">
                <label
                    htmlFor="vacationDays"
                    className="text-sm font-medium text-text-muted"
                >
                    Vacation Days Budget
                </label>
                <div className="flex items-center gap-3">
                    <input
                        id="vacationDays"
                        type="range"
                        min={1}
                        max={40}
                        value={vacationDays}
                        onChange={(e) =>
                            setVacationDays(Number(e.target.value))}
                        className="flex-1 themed-range"
                    />
                    <span className="text-lg font-semibold text-primary min-w-[2ch] text-right tabular-nums">
                        {vacationDays}
                    </span>
                </div>
            </div>

            {/* Advanced Options */}
            <div className="pt-1 space-y-3">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5
                               rounded-lg border border-border bg-surface
                               text-xs font-medium text-text-muted
                               hover:bg-surface-hover hover:text-text
                               transition-all duration-150 cursor-pointer"
                >
                    <span>Advanced constraints</span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {showAdvanced && (
                    <div className="space-y-4 px-3 py-3 rounded-lg border border-border bg-surface">
                        {/* Minimum Days */}
                        <div className="space-y-2">
                            <label
                                htmlFor="minimumDaysPerRange"
                                className="text-xs font-medium text-text-muted"
                            >
                                Minimum days per range
                            </label>
                            <p className="text-xs text-text-muted/70">
                                Exclude ranges smaller than this. For example,
                                set to 4 to exclude 3-day ranges.
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    id="minimumDaysPerRange"
                                    type="range"
                                    min={1}
                                    max={14}
                                    value={minimumDaysPerRange ?? 1}
                                    onChange={(e) =>
                                        setMinimumDaysPerRange(
                                            Number(e.target.value),
                                        )}
                                    className="flex-1 themed-range"
                                />
                                <span className="text-sm font-semibold text-accent min-w-[3ch] text-right tabular-nums">
                                    {minimumDaysPerRange ?? "off"}
                                </span>
                            </div>
                        </div>

                        {/* Maximum Days */}
                        <div className="space-y-2">
                            <label
                                htmlFor="maximumDaysPerRange"
                                className="text-xs font-medium text-text-muted"
                            >
                                Maximum days per range
                            </label>
                            <p className="text-xs text-text-muted/70">
                                Exclude ranges larger than this. For example,
                                set to 10 to avoid very long vacation blocks.
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    id="maximumDaysPerRange"
                                    type="range"
                                    min={1}
                                    max={31}
                                    value={maximumDaysPerRange ?? 31}
                                    onChange={(e) =>
                                        setMaximumDaysPerRange(
                                            Number(e.target.value),
                                        )}
                                    className="flex-1 themed-range"
                                />
                                <span className="text-sm font-semibold text-accent min-w-[3ch] text-right tabular-nums">
                                    {maximumDaysPerRange ?? "off"}
                                </span>
                            </div>
                        </div>

                        {/* Custom Free Days */}
                        <div className="space-y-2">
                            <CustomFreeDaysManager
                                customFreeDays={customFreeDays}
                                onUpdate={onCustomFreeDaysChange}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || countriesLoading}
                className="action-btn action-btn-primary w-full"
            >
                {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Plane className="w-4 h-4" />}
                {isLoading ? "Optimizing..." : "Optimize"}
            </button>
        </form>
    );
}
