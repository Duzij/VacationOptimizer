import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import IndiaCountryOptimizerForm from "./IndiaCountryOptimizerForm";

vi.mock("./api", () => ({
    useIndiaSchema: () => ({
        data: {
            countryCode: "IN",
            component: "india",
            yearRange: { min: 2026, max: 2031 },
            defaults: { vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 },
            stateSelectionRequired: true,
            states: [{ code: "IN-KA", name: "Karnataka" }],
        },
        isLoading: false,
    }),
}));

describe("IndiaCountryOptimizerForm", () => {
    it("requires a state and emits an India request", async () => {
        const user = userEvent.setup();
        const onResult = vi.fn();

        render(
            <IndiaCountryOptimizerForm
                country="IN"
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
        await user.selectOptions(screen.getByLabelText("State / Region"), "IN-KA");
        await user.click(screen.getByRole("button", { name: /Optimize/i }));

        expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ country: "IN", stateCode: "IN-KA" }));
    });
});
