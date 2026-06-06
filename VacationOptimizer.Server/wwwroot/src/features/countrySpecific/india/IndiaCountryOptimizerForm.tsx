import { useEffect, useState } from "react";
import { useIndiaSchema } from "./api";
import { isIndiaOptimizeRequest } from "../models";
import { buildBaseRequest, type CountryOptimizerFormProps, SharedOptimizerControls, StateSelectField } from "../shared/optimizerFormShared";

export default function IndiaCountryOptimizerForm({
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
}: CountryOptimizerFormProps<"IN">) {
    const [stateCode, setStateCode] = useState(
        initialRequest && isIndiaOptimizeRequest(initialRequest) && initialRequest.country === country
            ? initialRequest.stateCode
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(false);
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
                lockedVacationDaysCount={lockedVacationDaysCount}
                onResetLockedDays={onResetLockedDays}
            />
        </form>
    );
}
