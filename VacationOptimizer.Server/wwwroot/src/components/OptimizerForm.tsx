import { useState } from "react";
import { useCountries } from "../api/vacationApi";
import type { OptimizeRequest, CustomFreeDay } from "../types/models";
import { Plane, Loader2, Info } from "lucide-react";
import CustomFreeDaysManager from "./CustomFreeDaysManager";

interface Props {
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
}

export default function OptimizerForm({ onResult, isLoading }: Props) {
    const currentYear = new Date().getFullYear();
    const [country, setCountry] = useState("ES");
    const [year, setYear] = useState(currentYear);
    const [vacationDays, setVacationDays] = useState(25);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [minimumDaysPerRange, setMinimumDaysPerRange] = useState<number | null>(4);
    const [maximumDaysPerRange, setMaximumDaysPerRange] = useState<number | null>(14);
    const [customFreeDays, setCustomFreeDays] = useState<CustomFreeDay[]>([]);

    const { data: countries, isLoading: countriesLoading } = useCountries();

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
        if (customFreeDays.length > 0) {
            request.customFreeDays = customFreeDays;
        }
        onResult(request);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
            {/* Country */}
            <div className="space-y-1.5">
                <label htmlFor="country" className="text-sm font-medium text-text-muted">
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

            {/* Year */}
            <div className="space-y-1.5">
                <label htmlFor="year" className="text-sm font-medium text-text-muted">
                    Year
                </label>
                <input
                    id="year"
                    type="number"
                    min={currentYear}
                    max={currentYear + 5}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all"
                />
            </div>

            {/* Vacation Days */}
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
                        value={vacationDays}
                        onChange={(e) => setVacationDays(Number(e.target.value))}
                        className="flex-1 themed-range"
                    />
                    <span className="text-lg font-semibold text-primary min-w-[2ch] text-right tabular-nums">
                        {vacationDays}
                    </span>
                </div>
            </div>

            {/* Advanced Options */}
            <div className="pt-2 space-y-3 border-t border-border/50">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors"
                >
                    <Info className="w-3.5 h-3.5" />
                    {showAdvanced ? "Hide" : "Show"} vacation range constraints (optional)
                </button>

                {showAdvanced && (
                    <div className="space-y-4 pl-5 py-2 border-l border-border/50">
                        {/* Minimum Days */}
                        <div className="space-y-2">
                            <label htmlFor="minimumDaysPerRange" className="text-xs font-medium text-text-muted">
                                Minimum days per range
                            </label>
                            <p className="text-xs text-text-muted/70">
                                Exclude ranges smaller than this. For example, set to 4 to exclude 3-day ranges.
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    id="minimumDaysPerRange"
                                    type="range"
                                    min={1}
                                    max={14}
                                    value={minimumDaysPerRange ?? 1}
                                    onChange={(e) => setMinimumDaysPerRange(Number(e.target.value))}
                                    className="flex-1 themed-range"
                                />
                                <span className="text-sm font-semibold text-accent min-w-[3ch] text-right tabular-nums">
                                    {minimumDaysPerRange ?? "off"}
                                </span>
                            </div>
                        </div>

                        {/* Maximum Days */}
                        <div className="space-y-2">
                            <label htmlFor="maximumDaysPerRange" className="text-xs font-medium text-text-muted">
                                Maximum days per range
                            </label>
                            <p className="text-xs text-text-muted/70">
                                Exclude ranges larger than this. For example, set to 10 to avoid very long vacation blocks.
                            </p>
                            <div className="flex items-center gap-3">
                                <input
                                    id="maximumDaysPerRange"
                                    type="range"
                                    min={1}
                                    max={31}
                                    value={maximumDaysPerRange ?? 31}
                                    onChange={(e) => setMaximumDaysPerRange(Number(e.target.value))}
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
                                onUpdate={setCustomFreeDays}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || countriesLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3
                   text-sm font-semibold text-white
                   hover:bg-primary-hover active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-150 cursor-pointer"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Plane className="w-4 h-4" />
                )}
                {isLoading ? "Optimizing..." : "Optimize"}
            </button>
        </form>
    );
}
