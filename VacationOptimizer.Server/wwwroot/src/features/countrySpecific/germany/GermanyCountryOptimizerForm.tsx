import { useState } from "react";
import { useGermanySchema } from "./api";
import { isGermanyOptimizeRequest } from "../models";
import { buildBaseRequest, isValidCustomPeriod, type CountryOptimizerFormProps, SharedOptimizerControls, StateSelectField } from "../shared/optimizerFormShared";

export default function GermanyCountryOptimizerForm({
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
    onCustomPeriodChanged,
}: CountryOptimizerFormProps<"DE">) {
    const [stateCode, setStateCode] = useState(
        initialRequest && isGermanyOptimizeRequest(initialRequest) && initialRequest.country === country
            ? initialRequest.stateCode
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { data: schema, isLoading: schemaLoading } = useGermanySchema(true);

    const selectedStateCode = schema?.states.some((entry) => entry.code === stateCode)
        ? stateCode
        : "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStateCode) {
            return;
        }

        onResult({
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            country: "DE",
            stateCode: selectedStateCode,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <StateSelectField
                id="stateCode"
                label="State / Region"
                value={selectedStateCode}
                onChange={setStateCode}
                disabled={schemaLoading}
                includeEmptyOption
                emptyOptionLabel={schemaLoading ? "Loading..." : "Select state / region"}
                states={schema?.states ?? []}
            />

            <SharedOptimizerControls
                sharedDraft={sharedDraft}
                onSharedDraftChange={onSharedDraftChange}
                onCustomPeriodChanged={onCustomPeriodChanged}
                customFreeDays={customFreeDays}
                onCustomFreeDaysChange={onCustomFreeDaysChange}
                isLoading={isLoading}
                isSubmitDisabled={isLoading || schemaLoading || !selectedStateCode || !isValidCustomPeriod(sharedDraft)}
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
