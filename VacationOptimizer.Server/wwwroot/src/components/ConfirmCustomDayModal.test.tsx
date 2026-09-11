import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ConfirmCustomDayModal from "./ConfirmCustomDayModal";

describe("ConfirmCustomDayModal", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders public holiday actions with helpful tooltips", () => {
        render(
            <ConfirmCustomDayModal
                date="2027-05-01"
                mode="holidayActions"
                holidayName="Labour Day"
                onConfirmCustomDay={vi.fn()}
                onConfirmNeverHoliday={vi.fn()}
                onConfirmLockedVacationDay={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        expect(screen.getByText("Public holiday actions")).toBeTruthy();
        expect(screen.getByText(/Choose how/)).toBeTruthy();

        const reportCheckboxLabel = screen.getByText("Report this holiday as incorrect").closest("label");
        expect(reportCheckboxLabel?.title).toBe("Submit feedback that this holiday is incorrect or does not apply to this region");

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        expect(cancelButton.title).toBe("Keep this holiday unchanged and close without saving changes");

        const neverVacationButton = screen.getByRole("button", { name: "Never vacation" });
        expect(neverVacationButton.title).toBe("Exclude this day from the algorithm so vacation is never placed on it");

        const ignoreButton = screen.getByRole("button", { name: "Ignore" });
        expect(ignoreButton.title).toBe("Ignore this public holiday and treat it as a normal work day in optimization");
    });

    it("calls onConfirmNeverHoliday when clicked", async () => {
        const user = userEvent.setup();
        const onConfirmNeverHoliday = vi.fn();

        render(
            <ConfirmCustomDayModal
                date="2027-05-01"
                mode="holidayActions"
                holidayName="Labour Day"
                onConfirmCustomDay={vi.fn()}
                onConfirmNeverHoliday={onConfirmNeverHoliday}
                onConfirmLockedVacationDay={vi.fn()}
                onCancel={vi.fn()}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Never vacation" }));
        expect(onConfirmNeverHoliday).toHaveBeenCalledTimes(1);
    });

    it("calls onIgnoreHoliday when ignore is clicked", async () => {
        const user = userEvent.setup();
        const onIgnoreHoliday = vi.fn();

        render(
            <ConfirmCustomDayModal
                date="2027-05-01"
                mode="holidayActions"
                holidayName="Labour Day"
                onConfirmCustomDay={vi.fn()}
                onConfirmNeverHoliday={vi.fn()}
                onConfirmLockedVacationDay={vi.fn()}
                onIgnoreHoliday={onIgnoreHoliday}
                onCancel={vi.fn()}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Ignore" }));
        expect(onIgnoreHoliday).toHaveBeenCalledWith(false);
    });
});
