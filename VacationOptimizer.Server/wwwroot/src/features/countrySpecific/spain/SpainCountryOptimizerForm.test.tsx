import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SpainCountryOptimizerForm from "./SpainCountryOptimizerForm";

vi.mock("./api", () => ({
    useSpainSchema: () => ({
        data: {
            countryCode: "ES",
            component: "spain",
            yearRange: { min: 2026, max: 2031 },
            defaults: { vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 },
            states: [{ code: "ES-CT", name: "Catalonia" }],
            cities: [{ code: "ES-CT-BCN", name: "Barcelona", stateCode: "ES-CT" }],
        },
        isLoading: false,
    }),
}));

describe("SpainCountryOptimizerForm", () => {
    it("filters city selection by region and emits a Spain request", async () => {
        const user = userEvent.setup();
        const onResult = vi.fn();

        render(
            <SpainCountryOptimizerForm
                country="ES"
                onResult={onResult}
                isLoading={false}
                customFreeDays={[]}
                onCustomFreeDaysChange={vi.fn()}
                initialRequest={null}
                sharedDraft={{ year: 2026, vacationDays: 25, minimumDaysPerRange: 4, maximumDaysPerRange: 14 }}
                onSharedDraftChange={vi.fn()}
            />,
        );

        await user.selectOptions(screen.getByLabelText("Autonomous Region"), "ES-CT");
        await user.selectOptions(screen.getByLabelText("City"), "ES-CT-BCN");
        await user.click(screen.getByRole("button", { name: /Optimize/i }));

        expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ country: "ES", stateCode: "ES-CT", cityCode: "ES-CT-BCN" }));
    });
});
