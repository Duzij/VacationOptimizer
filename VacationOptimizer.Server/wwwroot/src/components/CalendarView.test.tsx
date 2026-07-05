import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CalendarView from "./CalendarView";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: undefined }),
}));

describe("CalendarView", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("hides passed months only for the currently selected year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 6, 5)));

    const { rerender } = render(<CalendarView year={2026} calendar={[]} />);

    expect(screen.queryByText("January 2026")).toBeNull();
    expect(screen.getByText("July 2026")).toBeTruthy();

    rerender(<CalendarView year={2027} calendar={[]} />);

    expect(screen.getByText("January 2027")).toBeTruthy();
    expect(screen.getByText("December 2027")).toBeTruthy();
  });
});
