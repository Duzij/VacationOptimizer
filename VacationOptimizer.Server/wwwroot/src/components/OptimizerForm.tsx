import { useEffect, useState } from "react";
import { useCountries, useDetectedCountry, useStates } from "../api/vacationApi";
import type { CustomFreeDay, OptimizeRequest } from "../types/models";
import { defaultMaximumDaysPerRange, defaultMinimumDaysPerRange, defaultVacationDays, getDefaultYear, hasNonDefaultAdvancedSettings } from "../optimizerDefaults";
import { ChevronDown, ChevronUp, Loader2, Plane } from "lucide-react";
import CustomFreeDaysManager from "./CustomFreeDaysManager";

interface Props {
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: OptimizeRequest | null;
}

function supportsNationalHolidaysOnly(countryCode: string) {
    // TODO: replace this hardcoded exception with backend capability metadata.
    return countryCode !== "IN";
}

function getBrowserLanguageTags(): string[] {
    var language = navigator.language || (navigator as any).userLanguage;
    console.log("Detected browser language:", language);
    return language ? [language.toLowerCase()] : [];
}

function isEnglishLanguage(language: string): boolean {
    return language === "en" || language.startsWith("en-");
}

function extractSupportedCountryFromLanguages(languages: string[], supportedCountryCodes: Set<string>): string | null {
    for (const language of languages) {
        if (isEnglishLanguage(language)) {
            continue;
        }

        const segments = language.split(/[-_]/);
        const region = segments.at(-1)?.toUpperCase();
        if (region && region.length === 2 && supportedCountryCodes.has(region)) {
            return region;
        }
    }

    return null;
}

export default function OptimizerForm({
    onResult,
    isLoading,
    customFreeDays,
    onCustomFreeDaysChange,
    initialRequest,
}: Props) {
    const currentYear = getDefaultYear();
    const [country, setCountry] = useState(initialRequest?.country ?? "");
    const [state, setState] = useState(initialRequest?.state ?? "");
    const [year, setYear] = useState(initialRequest?.year ?? currentYear);
    const [vacationDays, setVacationDays] = useState(initialRequest?.vacationDays ?? defaultVacationDays);
    const [showAdvanced, setShowAdvanced] = useState(hasNonDefaultAdvancedSettings(initialRequest));
    const [minimumDaysPerRange, setMinimumDaysPerRange] = useState<
        number | null
    >(initialRequest?.minimumDaysPerRange ?? defaultMinimumDaysPerRange);
    const [maximumDaysPerRange, setMaximumDaysPerRange] = useState<
        number | null
    >(initialRequest?.maximumDaysPerRange ?? defaultMaximumDaysPerRange);


    const { data: countries, isLoading: countriesLoading } = useCountries();
    const { data: detectedCountry, isLoading: detectedCountryLoading } = useDetectedCountry();
    const { data: states, isLoading: statesLoading } = useStates(country);

    useEffect(() => {
        if (!initialRequest) {
            return;
        }

        setCountry(initialRequest.country);
        setState(initialRequest.state ?? "");
        setYear(initialRequest.year);
        setVacationDays(initialRequest.vacationDays);
        setMinimumDaysPerRange(initialRequest.minimumDaysPerRange ?? defaultMinimumDaysPerRange);
        setMaximumDaysPerRange(initialRequest.maximumDaysPerRange ?? defaultMaximumDaysPerRange);
        onCustomFreeDaysChange(initialRequest.customFreeDays ?? []);
        setShowAdvanced(hasNonDefaultAdvancedSettings(initialRequest));
    }, [initialRequest, onCustomFreeDaysChange]);

    useEffect(() => {
        if (countriesLoading || detectedCountryLoading || countries === undefined || detectedCountry === undefined) {
            return;
        }

        if (country) {
            return;
        }

        const supportedCountryCodes = new Set(countries.map((entry) => entry.code));
        const browserLanguages = getBrowserLanguageTags();
        const preferredLocaleCountry = extractSupportedCountryFromLanguages(browserLanguages, supportedCountryCodes);
        const prefersEnglish = browserLanguages.some(isEnglishLanguage);

        if (preferredLocaleCountry) {
            setCountry(preferredLocaleCountry);
            return;
        }

        if (prefersEnglish) {
            if (detectedCountry.countryCode && supportedCountryCodes.has(detectedCountry.countryCode)) {
                setCountry(detectedCountry.countryCode);
            }
            return;
        }

    }, [countries, countriesLoading, country, detectedCountry, detectedCountryLoading]);

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
                    disabled={countriesLoading || detectedCountryLoading}
                    className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer ${country ? "text-text" : "text-text-muted"}`}
                >
                    {(countriesLoading || detectedCountryLoading) && <option>Loading...</option>}
                    {!countriesLoading && !detectedCountryLoading && <option value="">Select country</option>}
                    {countries?.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {detectedCountry?.hasGeoHeaders && !country && (
                    <p className="text-xs text-text-muted">
                        Choose your country to continue.
                    </p>
                )}
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
                        {supportsNationalHolidaysOnly(country) && (
                            <option value="">National holidays only</option>
                        )}
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
                disabled={isLoading || countriesLoading || detectedCountryLoading || !country}
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
