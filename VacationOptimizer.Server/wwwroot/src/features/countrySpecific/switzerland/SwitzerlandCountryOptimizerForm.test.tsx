import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SwitzerlandCountryOptimizerForm from "./SwitzerlandCountryOptimizerForm";

vi.mock("./api", () => ({
    useSwitzerlandSchema: () => ({
        data: {
            countryCode: "CH",
            component: "switzerland",
            yearRange: { min: 2026, max: 2031 },
            defaults: { vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 },
            cantonSelectionRequired: true,
            cantons: [{ code: "CH-ZH", name: "Zurich" }],
        },
        isLoading: false,
    }),
}));

describe("SwitzerlandCountryOptimizerForm", () => {
    it("requires a canton and emits a Switzerland request", async () => {
        const user = userEvent.setup();
        const onResult = vi.fn();

        render(
            <SwitzerlandCountryOptimizerForm
                country="CH"
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
        await user.selectOptions(screen.getByLabelText("Canton"), "CH-ZH");
        await user.click(screen.getByRole("button", { name: /Optimize/i }));

        expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ country: "CH", cantonCode: "CH-ZH" }));
    });
});
