import { useEffect, useState } from "react";
import { useCountries, useIndiaSchema, useSpainSchema, useStates } from "../api/vacationApi";
import { isIndiaOptimizeRequest, isSpainOptimizeRequest, type CustomFreeDay, type DetectedCountry, type OptimizeRequest, type SpainCityOption, type StateOption } from "../types/models";
import { defaultMaximumDaysPerRange, defaultMinimumDaysPerRange, defaultVacationDays, getDefaultYear, hasNonDefaultAdvancedSettings } from "../optimizerDefaults";
import { ChevronDown, ChevronUp, Loader2, Plane } from "lucide-react";
import Button from "./Button";
import CustomFreeDaysManager from "./CustomFreeDaysManager";

interface Props {
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: OptimizeRequest | null;
    detectedCountry?: DetectedCountry | null;
}

interface SharedDraft {
    year: number;
    vacationDays: number;
    minimumDaysPerRange: number | null;
    maximumDaysPerRange: number | null;
}

function getInitialSharedDraft(initialRequest: OptimizeRequest | null | undefined, currentYear: number): SharedDraft {
    return {
        year: initialRequest?.year ?? currentYear,
        vacationDays: initialRequest?.vacationDays ?? defaultVacationDays,
        minimumDaysPerRange: initialRequest?.minimumDaysPerRange ?? defaultMinimumDaysPerRange,
        maximumDaysPerRange: initialRequest?.maximumDaysPerRange ?? defaultMaximumDaysPerRange,
    };
}

function buildBaseRequest(country: string, draft: SharedDraft, customFreeDays: CustomFreeDay[]) {
    const request = {
        country,
        year: draft.year,
        vacationDays: draft.vacationDays,
        minimumDaysPerRange: draft.minimumDaysPerRange ?? undefined,
        maximumDaysPerRange: draft.maximumDaysPerRange ?? undefined,
        customFreeDays: customFreeDays.length > 0 ? customFreeDays : undefined,
    };

    return request;
}

function getBrowserLanguageTags(): string[] {
    const language = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
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
    detectedCountry,
}: Props) {
    const currentYear = getDefaultYear();
    const [country, setCountry] = useState(initialRequest?.country ?? "");
    const [sharedDraft, setSharedDraft] = useState<SharedDraft>(() => getInitialSharedDraft(initialRequest, currentYear));

    const { data: countries, isLoading: countriesLoading } = useCountries();

    useEffect(() => {
        if (!initialRequest) {
            return;
        }

        setCountry(initialRequest.country);
        setSharedDraft(getInitialSharedDraft(initialRequest, currentYear));
        onCustomFreeDaysChange(initialRequest.customFreeDays ?? []);
    }, [currentYear, initialRequest, onCustomFreeDaysChange]);

    useEffect(() => {
        if (countriesLoading || countries === undefined || detectedCountry === undefined) {
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

        if (prefersEnglish && detectedCountry?.countryCode && supportedCountryCodes.has(detectedCountry.countryCode)) {
            setCountry(detectedCountry.countryCode);
        }
    }, [countries, countriesLoading, country, detectedCountry]);

    const handleCountryChange = (nextCountry: string) => {
        setCountry(nextCountry);
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-5 xl:mx-0 xl:max-w-[38rem]">
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
                    onChange={(e) => handleCountryChange(e.target.value)}
                    disabled={countriesLoading}
                    className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer ${country ? "text-text" : "text-text-muted"}`}
                >
                    {(countriesLoading) && <option>Loading...</option>}
                    {!countriesLoading && <option value="">Select country</option>}
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

            {country && (
                country === "IN" ? (
                    <IndiaCountryOptimizerForm
                        key={country}
                        country={country}
                        onResult={onResult}
                        isLoading={isLoading}
                        customFreeDays={customFreeDays}
                        onCustomFreeDaysChange={onCustomFreeDaysChange}
                        initialRequest={initialRequest}
                        sharedDraft={sharedDraft}
                        onSharedDraftChange={setSharedDraft}
                    />
                ) : country === "ES" ? (
                    <SpainCountryOptimizerForm
                        key={country}
                        country={country}
                        onResult={onResult}
                        isLoading={isLoading}
                        customFreeDays={customFreeDays}
                        onCustomFreeDaysChange={onCustomFreeDaysChange}
                        initialRequest={initialRequest}
                        sharedDraft={sharedDraft}
                        onSharedDraftChange={setSharedDraft}
                    />
                ) : (
                    <LegacyCountryOptimizerForm
                        key={country}
                        country={country}
                        onResult={onResult}
                        isLoading={isLoading}
                        customFreeDays={customFreeDays}
                        onCustomFreeDaysChange={onCustomFreeDaysChange}
                        initialRequest={initialRequest}
                        sharedDraft={sharedDraft}
                        onSharedDraftChange={setSharedDraft}
                    />
                )
            )}
        </div>
    );
}

function LegacyCountryOptimizerForm({
    country,
    onResult,
    isLoading,
    customFreeDays,
    onCustomFreeDaysChange,
    initialRequest,
    sharedDraft,
    onSharedDraftChange,
}: {
    country: string;
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: OptimizeRequest | null;
    sharedDraft: SharedDraft;
    onSharedDraftChange: React.Dispatch<React.SetStateAction<SharedDraft>>;
}) {
    const [state, setState] = useState(
        initialRequest && !isIndiaOptimizeRequest(initialRequest) && initialRequest.country === country
            ? (initialRequest.state ?? "")
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(hasNonDefaultAdvancedSettings(initialRequest));
    const { data: states, isLoading: statesLoading } = useStates(country);

    useEffect(() => {
        if (!states?.some((entry) => entry.code === state)) {
            setState("");
        }
    }, [state, states]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const request: OptimizeRequest = {
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            state: state || undefined,
        };

        onResult(request);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {states && states.length > 0 && (
                <StateSelectField
                    id="state"
                    label="State / Region"
                    value={state}
                    onChange={setState}
                    disabled={statesLoading}
                    includeEmptyOption
                    emptyOptionLabel="National holidays only"
                    states={states}
                />
            )}

            <SharedOptimizerControls
                sharedDraft={sharedDraft}
                onSharedDraftChange={onSharedDraftChange}
                customFreeDays={customFreeDays}
                onCustomFreeDaysChange={onCustomFreeDaysChange}
                isLoading={isLoading}
                isSubmitDisabled={isLoading}
                showAdvanced={showAdvanced}
                onShowAdvancedChange={setShowAdvanced}
            />
        </form>
    );
}

function IndiaCountryOptimizerForm({
    country,
    onResult,
    isLoading,
    customFreeDays,
    onCustomFreeDaysChange,
    initialRequest,
    sharedDraft,
    onSharedDraftChange,
}: {
    country: "IN";
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: OptimizeRequest | null;
    sharedDraft: SharedDraft;
    onSharedDraftChange: React.Dispatch<React.SetStateAction<SharedDraft>>;
}) {
    const [stateCode, setStateCode] = useState(
        initialRequest && isIndiaOptimizeRequest(initialRequest) && initialRequest.country === country
            ? initialRequest.stateCode
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(hasNonDefaultAdvancedSettings(initialRequest));
    const { data: schema, isLoading: schemaLoading } = useIndiaSchema(true);

    useEffect(() => {
        if (!schema?.states.some((entry) => entry.code === stateCode)) {
            setStateCode("");
        }
    }, [schema?.states, stateCode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stateCode) {
            return;
        }

        onResult({
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            country: "IN",
            stateCode,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <StateSelectField
                id="stateCode"
                label="State / Region"
                value={stateCode}
                onChange={setStateCode}
                disabled={schemaLoading}
                includeEmptyOption
                emptyOptionLabel={schemaLoading ? "Loading..." : "Select state / region"}
                states={schema?.states ?? []}
            />

            <SharedOptimizerControls
                sharedDraft={sharedDraft}
                onSharedDraftChange={onSharedDraftChange}
                customFreeDays={customFreeDays}
                onCustomFreeDaysChange={onCustomFreeDaysChange}
                isLoading={isLoading}
                isSubmitDisabled={isLoading || schemaLoading || !stateCode}
                showAdvanced={showAdvanced}
                onShowAdvancedChange={setShowAdvanced}
                yearMin={schema?.yearRange.min}
                yearMax={schema?.yearRange.max}
            />
        </form>
    );
}

function SpainCountryOptimizerForm({
    country,
    onResult,
    isLoading,
    customFreeDays,
    onCustomFreeDaysChange,
    initialRequest,
    sharedDraft,
    onSharedDraftChange,
}: {
    country: "ES";
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: OptimizeRequest | null;
    sharedDraft: SharedDraft;
    onSharedDraftChange: React.Dispatch<React.SetStateAction<SharedDraft>>;
}) {
    const [stateCode, setStateCode] = useState(
        initialRequest && isSpainOptimizeRequest(initialRequest) && initialRequest.country === country
            ? (initialRequest.stateCode ?? "")
            : ""
    );
    const [cityCode, setCityCode] = useState(
        initialRequest && isSpainOptimizeRequest(initialRequest) && initialRequest.country === country
            ? (initialRequest.cityCode ?? "")
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(hasNonDefaultAdvancedSettings(initialRequest));
    const { data: schema, isLoading: schemaLoading } = useSpainSchema(true);

    useEffect(() => {
        if (!schema) {
            return;
        }

        if (cityCode) {
            const city = schema.cities.find((entry) => entry.code === cityCode);
            if (!city) {
                setCityCode("");
                return;
            }

            if (stateCode !== city.stateCode) {
                setStateCode(city.stateCode);
            }
            return;
        }

        if (stateCode && !schema.states.some((entry) => entry.code === stateCode)) {
            setStateCode("");
        }
    }, [cityCode, schema, stateCode]);

    const handleStateChange = (nextStateCode: string) => {
        setStateCode(nextStateCode);
        if (!nextStateCode) {
            setCityCode("");
            return;
        }

        const selectedCity = schema?.cities.find((entry) => entry.code === cityCode);
        if (selectedCity && selectedCity.stateCode !== nextStateCode) {
            setCityCode("");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onResult({
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            country: "ES",
            stateCode: stateCode || undefined,
            cityCode: cityCode || undefined,
        });
    };

    const availableCities = schema?.cities.filter((entry) => !stateCode || entry.stateCode === stateCode) ?? [];

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <StateSelectField
                id="stateCode"
                label="Autonomous Region"
                value={stateCode}
                onChange={handleStateChange}
                disabled={schemaLoading}
                includeEmptyOption
                emptyOptionLabel={schemaLoading ? "Loading..." : "National holidays only"}
                states={schema?.states ?? []}
            />

            {availableCities.length > 0 && (
                <CitySelectField
                    value={cityCode}
                    onChange={setCityCode}
                    disabled={schemaLoading}
                    cities={availableCities}
                />
            )}

            <SharedOptimizerControls
                sharedDraft={sharedDraft}
                onSharedDraftChange={onSharedDraftChange}
                customFreeDays={customFreeDays}
                onCustomFreeDaysChange={onCustomFreeDaysChange}
                isLoading={isLoading}
                isSubmitDisabled={isLoading || schemaLoading}
                showAdvanced={showAdvanced}
                onShowAdvancedChange={setShowAdvanced}
                yearMin={schema?.yearRange.min}
                yearMax={schema?.yearRange.max}
            />
        </form>
    );
}

function StateSelectField({
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
            <label
                htmlFor={id}
                className="text-sm font-medium text-text-muted"
            >
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

function CitySelectField({
    value,
    onChange,
    disabled,
    cities,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    cities: SpainCityOption[];
}) {
    return (
        <div className="space-y-1.5">
            <label
                htmlFor="cityCode"
                className="text-sm font-medium text-text-muted"
            >
                City
            </label>
            <select
                id="cityCode"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer"
            >
                <option value="">{disabled ? "Loading..." : "No city selected"}</option>
                {cities.map((entry) => (
                    <option key={entry.code} value={entry.code}>
                        {entry.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function SharedOptimizerControls({
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
}) {
    const currentYear = getDefaultYear();
    const minimumYear = yearMin ?? currentYear;
    const maximumYear = yearMax ?? currentYear + 5;

    return (
        <>
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
                        min={minimumYear}
                        max={maximumYear}
                        value={sharedDraft.year}
                        onChange={(e) =>
                            onSharedDraftChange((draft) => ({
                                ...draft,
                                year: Number(e.target.value),
                            }))}
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
                                onSharedDraftChange((draft) => ({
                                    ...draft,
                                    year: Math.min(draft.year + 1, maximumYear),
                                }))}
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
                                onSharedDraftChange((draft) => ({
                                    ...draft,
                                    year: Math.max(draft.year - 1, minimumYear),
                                }))}
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
                        value={sharedDraft.vacationDays}
                        onChange={(e) =>
                            onSharedDraftChange((draft) => ({
                                ...draft,
                                vacationDays: Number(e.target.value),
                            }))}
                        className="flex-1 themed-range"
                    />
                    <span className="text-lg font-semibold text-primary min-w-[2ch] text-right tabular-nums">
                        {sharedDraft.vacationDays}
                    </span>
                </div>
            </div>

            <div className="pt-1 space-y-3">
                <button
                    type="button"
                    onClick={() => onShowAdvancedChange((value) => !value)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5
                               rounded-lg border border-border bg-surface
                               text-xs font-medium text-text-muted
                               hover:bg-surface-hover hover:text-text
                               transition-all duration-150 cursor-pointer"
                >
                    <span>Advanced constraints</span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
                    />
                </button>

                {showAdvanced && (
                    <div className="space-y-4 px-3 py-3 rounded-lg border border-border bg-surface">
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
                                    value={sharedDraft.minimumDaysPerRange ?? 1}
                                    onChange={(e) =>
                                        onSharedDraftChange((draft) => ({
                                            ...draft,
                                            minimumDaysPerRange: Number(e.target.value),
                                        }))}
                                    className="flex-1 themed-range"
                                />
                                <span className="text-sm font-semibold text-accent min-w-[3ch] text-right tabular-nums">
                                    {sharedDraft.minimumDaysPerRange ?? "off"}
                                </span>
                            </div>
                        </div>

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
                                    value={sharedDraft.maximumDaysPerRange ?? 31}
                                    onChange={(e) =>
                                        onSharedDraftChange((draft) => ({
                                            ...draft,
                                            maximumDaysPerRange: Number(e.target.value),
                                        }))}
                                    className="flex-1 themed-range"
                                />
                                <span className="text-sm font-semibold text-accent min-w-[3ch] text-right tabular-nums">
                                    {sharedDraft.maximumDaysPerRange ?? "off"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <CustomFreeDaysManager
                                customFreeDays={customFreeDays}
                                onUpdate={onCustomFreeDaysChange}
                            />
                        </div>
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={isSubmitDisabled}
                fullWidth
            >
                {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Plane className="w-4 h-4" />}
                {isLoading ? "Optimizing..." : "Optimize"}
            </Button>
        </>
    );
}
