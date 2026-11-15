import { useState } from "react";
import { useUnitedKingdomSchema } from "./api";
import { isUnitedKingdomOptimizeRequest } from "../models";
import { buildBaseRequest, isValidCustomPeriod, type CountryOptimizerFormProps, SharedOptimizerControls, StateSelectField } from "../shared/optimizerFormShared";

export default function UnitedKingdomCountryOptimizerForm({
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
}: CountryOptimizerFormProps<"GB">) {
    const [nationCode, setNationCode] = useState(
        initialRequest && isUnitedKingdomOptimizeRequest(initialRequest) && initialRequest.country === country
            ? initialRequest.nationCode
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { data: schema, isLoading: schemaLoading } = useUnitedKingdomSchema(true);

    const selectedNationCode = schema?.nations.some((entry) => entry.code === nationCode)
        ? nationCode
        : "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNationCode) {
            return;
        }

        onResult({
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            country: "GB",
            nationCode: selectedNationCode,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <StateSelectField
                id="nationCode"
                label="Nation"
                value={selectedNationCode}
                onChange={setNationCode}
                disabled={schemaLoading}
                includeEmptyOption
                isInvalid={!schema?.nations.some((entry) => entry.code === nationCode)}
                emptyOptionLabel={schemaLoading ? "Loading..." : "Select nation"}
                states={schema?.nations ?? []}
            />

            <SharedOptimizerControls
                sharedDraft={sharedDraft}
                onSharedDraftChange={onSharedDraftChange}
                onCustomPeriodChanged={onCustomPeriodChanged}
                customFreeDays={customFreeDays}
                onCustomFreeDaysChange={onCustomFreeDaysChange}
                isLoading={isLoading}
                isSubmitDisabled={isLoading || schemaLoading || !selectedNationCode || !isValidCustomPeriod(sharedDraft)}
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
