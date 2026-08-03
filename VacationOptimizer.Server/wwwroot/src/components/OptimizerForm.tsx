import { useEffect, useState } from "react";
import { useCountries, useStates } from "../api/vacationApi";
import { type CustomFreeDay, type DetectedCountry, type OptimizeRequest } from "../types/models";
import { defaultMaximumDaysPerRange, defaultMinimumDaysPerRange, defaultVacationDays, getDefaultYear } from "../optimizerDefaults";
import { isIndiaOptimizeRequest } from "../features/countrySpecific/models";
import IndiaCountryOptimizerForm from "../features/countrySpecific/india/IndiaCountryOptimizerForm";
import SpainCountryOptimizerForm from "../features/countrySpecific/spain/SpainCountryOptimizerForm";
import SwitzerlandCountryOptimizerForm from "../features/countrySpecific/switzerland/SwitzerlandCountryOptimizerForm";
import {
    buildBaseRequest,
    type SharedDraft,
    SharedOptimizerControls,
    StateSelectField,
} from "../features/countrySpecific/shared/optimizerFormShared";

interface Props {
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: OptimizeRequest | null;
    detectedCountry?: DetectedCountry | null;
    lockedVacationDaysCount?: number;
    onResetLockedDays?: () => void;
}

function getInitialSharedDraft(initialRequest: OptimizeRequest | null | undefined, currentYear: number): SharedDraft {
    return {
        year: initialRequest?.year ?? currentYear,
        vacationDays: initialRequest?.vacationDays ?? defaultVacationDays,
        minimumDaysPerRange: initialRequest?.minimumDaysPerRange ?? defaultMinimumDaysPerRange,
        maximumDaysPerRange: initialRequest?.maximumDaysPerRange ?? defaultMaximumDaysPerRange,
        maxNumberOfVacationsPerMonth: initialRequest?.maxNumberOfVacationsPerMonth ?? {},
    };
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
    lockedVacationDaysCount,
    onResetLockedDays,
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
        if (countriesLoading || countries === undefined || detectedCountry === undefined || country) {
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

    return (
        <div className="w-full max-w-md mx-auto space-y-5 xl:mx-0 xl:max-w-[38rem]">
            <div className="space-y-1.5">
                <label htmlFor="country" className="text-sm font-medium text-text-muted">
                    Country
                </label>
                <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={countriesLoading}
                    className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                     transition-all appearance-none cursor-pointer ${country ? "text-text" : "text-text-muted"}`}
                >
                    {countriesLoading && <option>Loading...</option>}
                    {!countriesLoading && <option value="">Select country</option>}
                    {countries?.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {detectedCountry?.hasGeoHeaders && !country && (
                    <p className="text-xs text-text-muted">Choose your country to continue.</p>
                )}
            </div>

            {country === "IN" && (
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
                    lockedVacationDaysCount={lockedVacationDaysCount}
                    onResetLockedDays={onResetLockedDays}
                />
            )}
            {country === "ES" && (
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
                    lockedVacationDaysCount={lockedVacationDaysCount}
                    onResetLockedDays={onResetLockedDays}
                />
            )}
            {country === "CH" && (
                <SwitzerlandCountryOptimizerForm
                    key={country}
                    country={country}
                    onResult={onResult}
                    isLoading={isLoading}
                    customFreeDays={customFreeDays}
                    onCustomFreeDaysChange={onCustomFreeDaysChange}
                    initialRequest={initialRequest}
                    sharedDraft={sharedDraft}
                    onSharedDraftChange={setSharedDraft}
                    lockedVacationDaysCount={lockedVacationDaysCount}
                    onResetLockedDays={onResetLockedDays}
                />
            )}
            {country && !["IN", "ES", "CH"].includes(country) && (
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
                    lockedVacationDaysCount={lockedVacationDaysCount}
                    onResetLockedDays={onResetLockedDays}
                />
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
    lockedVacationDaysCount,
    onResetLockedDays,
}: {
    country: string;
    onResult: (req: OptimizeRequest) => void;
    isLoading: boolean;
    customFreeDays: CustomFreeDay[];
    onCustomFreeDaysChange: (days: CustomFreeDay[]) => void;
    initialRequest?: OptimizeRequest | null;
    sharedDraft: SharedDraft;
    onSharedDraftChange: React.Dispatch<React.SetStateAction<SharedDraft>>;
    lockedVacationDaysCount?: number;
    onResetLockedDays?: () => void;
}) {
    const [state, setState] = useState(
        initialRequest && !isIndiaOptimizeRequest(initialRequest) && initialRequest.country === country
            ? (initialRequest.state ?? "")
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { data: states, isLoading: statesLoading } = useStates(country);

    useEffect(() => {
        if (!states?.some((entry) => entry.code === state)) {
            setState("");
        }
    }, [state, states]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onResult({
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            state: state || undefined,
        });
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
                lockedVacationDaysCount={lockedVacationDaysCount}
                onResetLockedDays={onResetLockedDays}
            />
        </form>
    );

}
