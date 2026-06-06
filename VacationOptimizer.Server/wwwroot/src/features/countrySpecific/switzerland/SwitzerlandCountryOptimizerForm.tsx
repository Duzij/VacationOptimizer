import { useEffect, useState } from "react";
import { useSwitzerlandSchema } from "./api";
import { isSwitzerlandOptimizeRequest } from "../models";
import { buildBaseRequest, type CountryOptimizerFormProps, SharedOptimizerControls, StateSelectField } from "../shared/optimizerFormShared";

export default function SwitzerlandCountryOptimizerForm({
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
}: CountryOptimizerFormProps<"CH">) {
    const [cantonCode, setCantonCode] = useState(
        initialRequest && isSwitzerlandOptimizeRequest(initialRequest) && initialRequest.country === country
            ? initialRequest.cantonCode
            : ""
    );
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { data: schema, isLoading: schemaLoading } = useSwitzerlandSchema(true);

    useEffect(() => {
        if (!schema?.cantons.some((entry) => entry.code === cantonCode)) {
            setCantonCode("");
        }
    }, [schema?.cantons, cantonCode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cantonCode) {
            return;
        }

        onResult({
            ...buildBaseRequest(country, sharedDraft, customFreeDays),
            country: "CH",
            cantonCode,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <StateSelectField
                id="cantonCode"
                label="Canton"
                value={cantonCode}
                onChange={setCantonCode}
                disabled={schemaLoading}
                includeEmptyOption
                emptyOptionLabel={schemaLoading ? "Loading..." : "Select canton"}
                states={schema?.cantons ?? []}
            />

            <SharedOptimizerControls
                sharedDraft={sharedDraft}
                onSharedDraftChange={onSharedDraftChange}
                customFreeDays={customFreeDays}
                onCustomFreeDaysChange={onCustomFreeDaysChange}
                isLoading={isLoading}
                isSubmitDisabled={isLoading || schemaLoading || !cantonCode}
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
