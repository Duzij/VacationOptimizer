import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import DetailsLipMobile from "./DetailsLipMobile";

describe("DetailsLipMobile", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders result controls when dayDetails is null", () => {
        render(
            <DetailsLipMobile
                isLoading={false}
                onShuffle={vi.fn()}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
                canNavigatePrevious={true}
                canNavigateNext={true}
                dayDetails={null}
            />,
        );

        expect(screen.getByText("Not happy with the result?")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Shuffle optimization" })).toBeTruthy();
    });

    it("renders day details with settings button when onSettings is provided", async () => {
        const user = userEvent.setup();
        const onSettings = vi.fn();

        render(
            <DetailsLipMobile
                isLoading={false}
                onShuffle={vi.fn()}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
                canNavigatePrevious={true}
                canNavigateNext={true}
                dayDetails={{
                    formattedDate: "May 1, 2027",
                    dateTime: "2027-05-01",
                    label: "Public holiday",
                    detail: "Labour Day",
                    onSettings,
                }}
            />,
        );

        expect(screen.getByText("May 1, 2027")).toBeTruthy();
        expect(screen.getByText("Labour Day")).toBeTruthy();

        const settingsButton = screen.getByRole("button", { name: "Day settings" });
        expect(settingsButton).toBeTruthy();

        await user.click(settingsButton);
        expect(onSettings).toHaveBeenCalledTimes(1);
    });

    it("does not render settings button when dayDetails.onSettings is not provided", () => {
        render(
            <DetailsLipMobile
                isLoading={false}
                onShuffle={vi.fn()}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
                canNavigatePrevious={true}
                canNavigateNext={true}
                dayDetails={{
                    formattedDate: "January 2027",
                    label: "Max vacation days",
                }}
            />,
        );

        expect(screen.queryByRole("button", { name: "Day settings" })).toBeNull();
    });
});
