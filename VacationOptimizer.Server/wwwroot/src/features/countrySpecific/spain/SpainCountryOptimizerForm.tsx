import { useEffect, useState } from "react";
import { useSpainSchema } from "./api";
import { isSpainOptimizeRequest } from "../models";
import type { SpainCityOption } from "./models";
import { buildBaseRequest, type CountryOptimizerFormProps, SharedOptimizerControls, StateSelectField } from "../shared/optimizerFormShared";

export default function SpainCountryOptimizerForm({
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
}: CountryOptimizerFormProps<"ES">) {
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
    const [showAdvanced, setShowAdvanced] = useState(false);
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
                <CitySelectField value={cityCode} onChange={setCityCode} disabled={schemaLoading} cities={availableCities} />
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
                lockedVacationDaysCount={lockedVacationDaysCount}
                onResetLockedDays={onResetLockedDays}
            />
        </form>
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
            <label htmlFor="cityCode" className="text-sm font-medium text-text-muted">
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
