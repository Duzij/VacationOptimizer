import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import GermanyCountryOptimizerForm from "./GermanyCountryOptimizerForm";

vi.mock("./api", () => ({
    useGermanySchema: () => ({
        data: {
            countryCode: "DE",
            component: "germany",
            yearRange: { min: 2026, max: 2031 },
            defaults: { vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 },
            stateSelectionRequired: true,
            states: [{ code: "DE-BE", name: "Berlin" }],
        },
        isLoading: false,
    }),
}));

describe("GermanyCountryOptimizerForm", () => {
    it("requires a state and emits a Germany request", async () => {
        const user = userEvent.setup();
        const onResult = vi.fn();

        render(
            <GermanyCountryOptimizerForm
                country="DE"
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
        await user.selectOptions(screen.getByLabelText("State / Region"), "DE-BE");
        await user.click(screen.getByRole("button", { name: /Optimize/i }));

        expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ country: "DE", stateCode: "DE-BE" }));
    });
});
