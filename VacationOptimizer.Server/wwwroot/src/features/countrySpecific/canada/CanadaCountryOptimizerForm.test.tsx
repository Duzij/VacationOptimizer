import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CanadaCountryOptimizerForm from "./CanadaCountryOptimizerForm";

vi.mock("./api", () => ({
    useCanadaSchema: () => ({
        data: {
            countryCode: "CA",
            component: "canada",
            yearRange: { min: 2026, max: 2031 },
            defaults: { vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 },
            provinceSelectionRequired: true,
            provinces: [{ code: "CA-ON", name: "Ontario" }],
        },
        isLoading: false,
    }),
}));

describe("CanadaCountryOptimizerForm", () => {
    it("requires a province and emits a Canada request", async () => {
        const user = userEvent.setup();
        const onResult = vi.fn();

        render(
            <CanadaCountryOptimizerForm
                country="CA"
                onResult={onResult}
                isLoading={false}
                customFreeDays={[]}
                onCustomFreeDaysChange={vi.fn()}
                initialRequest={null}
                sharedDraft={{ year: 2026, vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 }}
                onSharedDraftChange={vi.fn()}
            />,
        );

        expect((screen.getByRole("button", { name: /Optimize/i }) as HTMLButtonElement).disabled).toBe(true);
        await user.selectOptions(screen.getByLabelText("Province / Territory"), "CA-ON");
        await user.click(screen.getByRole("button", { name: /Optimize/i }));

        expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ country: "CA", provinceCode: "CA-ON" }));
    });
});
