import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import DetailsLipDesktop from "./DetailsLipDesktop";

describe("DetailsLipDesktop", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders day details, close button, and triggers onClose when clicked", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <DetailsLipDesktop
                formattedDate="May 1, 2027"
                dateTime="2027-05-01"
                label="Public holiday"
                detail="Labour Day"
                onClose={onClose}
            />,
        );

        expect(screen.getByText("May 1, 2027")).toBeTruthy();
        expect(screen.getByText(/Public holiday · Labour Day/)).toBeTruthy();

        const closeButton = screen.getByRole("button", { name: "Close day details" });
        expect(closeButton).toBeTruthy();

        await user.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders settings button next to close button when onSettings is provided and calls onSettings", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onSettings = vi.fn();

        render(
            <DetailsLipDesktop
                formattedDate="May 1, 2027"
                dateTime="2027-05-01"
                label="Public holiday"
                detail="Labour Day"
                onClose={onClose}
                onSettings={onSettings}
            />,
        );

        const settingsButton = screen.getByRole("button", { name: "Day settings" });
        expect(settingsButton).toBeTruthy();

        await user.click(settingsButton);
        expect(onSettings).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not render settings button when onSettings is not provided", () => {
        render(
            <DetailsLipDesktop
                formattedDate="January 2027"
                label="Max vacation days"
                onClose={vi.fn()}
            />,
        );

        expect(screen.queryByRole("button", { name: "Day settings" })).toBeNull();
    });
});
