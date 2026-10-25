import { useState } from "react";
import { useCanadaSchema } from "./api";
import { isCanadaOptimizeRequest } from "../models";
import { buildBaseRequest, isValidCustomPeriod, type CountryOptimizerFormProps, SharedOptimizerControls, StateSelectField } from "../shared/optimizerFormShared";

export default function CanadaCountryOptimizerForm({
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
}: CountryOptimizerFormProps<"CA">) {
    const [provinceCode, setProvinceCode] = useState(
        initialRequest && isCanadaOptimizeRequest(initialRequest) && initialRequest.country === country
            ? initialRequest.provinceCode
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { data: schema, isLoading: schemaLoading } = useCanadaSchema(true);

    const selectedProvinceCode = schema?.provinces.some((entry) => entry.code === provinceCode)
        ? provinceCode
        : "";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProvinceCode) {
            return;
        }

        onResult({
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            country: "CA",
            provinceCode: selectedProvinceCode,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <StateSelectField
                id="provinceCode"
                label="Province / Territory"
                value={selectedProvinceCode}
                onChange={setProvinceCode}
                disabled={schemaLoading}
                includeEmptyOption
                emptyOptionLabel={schemaLoading ? "Loading..." : "Select province / territory"}
                states={schema?.provinces ?? []}
            />

            <SharedOptimizerControls
                sharedDraft={sharedDraft}
                onSharedDraftChange={onSharedDraftChange}
                onCustomPeriodChanged={onCustomPeriodChanged}
                customFreeDays={customFreeDays}
                onCustomFreeDaysChange={onCustomFreeDaysChange}
                isLoading={isLoading}
                isSubmitDisabled={isLoading || schemaLoading || !selectedProvinceCode || !isValidCustomPeriod(sharedDraft)}
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
