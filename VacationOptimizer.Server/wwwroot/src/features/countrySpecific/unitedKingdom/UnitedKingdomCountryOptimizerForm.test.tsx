import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UnitedKingdomCountryOptimizerForm from "./UnitedKingdomCountryOptimizerForm";

vi.mock("./api", () => ({
    useUnitedKingdomSchema: () => ({
        data: {
            countryCode: "GB",
            component: "unitedKingdom",
            yearRange: { min: 2026, max: 2031 },
            defaults: { vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 },
            nationSelectionRequired: true,
            nations: [
                { code: "GB-ENG", name: "England & Wales" },
                { code: "GB-SCT", name: "Scotland" },
                { code: "GB-NIR", name: "Northern Ireland" },
            ],
        },
        isLoading: false,
    }),
}));

describe("UnitedKingdomCountryOptimizerForm", () => {
    it("requires a nation and emits a United Kingdom request", async () => {
        const user = userEvent.setup();
        const onResult = vi.fn();

        render(
            <UnitedKingdomCountryOptimizerForm
                country="GB"
                onResult={onResult}
                isLoading={false}
                customFreeDays={[]}
                onCustomFreeDaysChange={vi.fn()}
                initialRequest={null}
                sharedDraft={{ year: 2027, vacationDays: 20, minimumDaysPerRange: 4, maximumDaysPerRange: 14 }}
                onSharedDraftChange={vi.fn()}
            />,
        );

        expect((screen.getByRole("button", { name: /Optimize/i }) as HTMLButtonElement).disabled).toBe(true);
        await user.selectOptions(screen.getByLabelText("Nation"), "GB-SCT");
        await user.click(screen.getByRole("button", { name: /Optimize/i }));

        expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ country: "GB", nationCode: "GB-SCT" }));
    });
});
