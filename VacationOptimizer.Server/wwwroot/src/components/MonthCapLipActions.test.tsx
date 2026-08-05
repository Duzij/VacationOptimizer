import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthCapLipActions } from "./MonthCapLipActions";

describe("MonthCapLipActions", () => {
    afterEach(() => {
        cleanup();
    });

    it("increases and decreases the cap", async () => {
        const user = userEvent.setup();
        const onApply = vi.fn();

        render(<MonthCapLipActions month="January" initialValue={3} onApply={onApply} />);

        await user.click(screen.getByRole("button", { name: /Increase January cap/i }) as HTMLButtonElement);
        expect(onApply).toHaveBeenLastCalledWith(4);

        await user.click(screen.getByRole("button", { name: /Decrease January cap/i }) as HTMLButtonElement);
        expect(onApply).toHaveBeenLastCalledWith(3);
    });

    it("disables the decrease button at the minimum value", async () => {
        const user = userEvent.setup();
        const onApply = vi.fn();

        render(<MonthCapLipActions month="January" initialValue={2} minValue={2} onApply={onApply} />);

        const decreaseButton = screen.getByRole("button", { name: /Decrease January cap/i }) as HTMLButtonElement;
        expect(decreaseButton.disabled).toBe(true);

        await user.click(decreaseButton);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("disables the increase button at the maximum value", async () => {
        const user = userEvent.setup();
        const onApply = vi.fn();

        render(<MonthCapLipActions month="January" initialValue={31} onApply={onApply} />);

        const increaseButton = screen.getByRole("button", { name: /Increase January cap/i }) as HTMLButtonElement;
        expect(increaseButton.disabled).toBe(true);

        await user.click(increaseButton);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("clicks apply immediately when decreasing", async () => {
        const user = userEvent.setup();
        const onApply = vi.fn();

        render(<MonthCapLipActions month="January" initialValue={5} onApply={onApply} />);

        await user.click(screen.getByRole("button", { name: /Decrease January cap/i }) as HTMLButtonElement);
        expect(onApply).toHaveBeenCalledTimes(1);
        expect(onApply).toHaveBeenCalledWith(4);
    });

    it("updates the displayed value when the initial cap changes", async () => {
        const onApply = vi.fn();
        const { rerender } = render(<MonthCapLipActions month="January" initialValue={5} onApply={onApply} />);

        expect(screen.getByLabelText("January cap value").textContent).toBe("5");

        rerender(<MonthCapLipActions month="February" initialValue={3} onApply={onApply} />);
        expect(screen.getByLabelText("February cap value").textContent).toBe("3");

        rerender(<MonthCapLipActions month="January" initialValue={5} onApply={onApply} />);
        expect(screen.getByLabelText("January cap value").textContent).toBe("5");
    });
});
