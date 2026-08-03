import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CalendarView from "./CalendarView";
import { DayType } from "../types/models";

const useQueryMock = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

describe("CalendarView", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    useQueryMock.mockReset();
  });

  it("hides passed months only for the currently selected year", () => {
    useQueryMock.mockReturnValue({ data: undefined });
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 6, 5)));

    const { rerender } = render(<CalendarView year={2026} calendar={[]} />);

    expect(screen.queryByText("January 2026")).toBeNull();
    expect(screen.getByText("July 2026")).toBeTruthy();

    rerender(<CalendarView year={2027} calendar={[]} />);

    expect(screen.getByText("January 2027")).toBeTruthy();
    expect(screen.getByText("December 2027")).toBeTruthy();
  });

  it("extends the shared range styling through continuous matched holiday, weekend, and vacation days", () => {
    useQueryMock.mockReturnValue({
      data: [
        DayType.PublicHoliday,
        DayType.Weekend,
        DayType.Vacation,
      ],
    });

    const { container } = render(
      <CalendarView
        year={2027}
        calendar={[
          {
            date: "2027-12-24",
            type: DayType.PublicHoliday,
            holidayName: "Holiday",
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
          {
            date: "2027-12-25",
            type: DayType.Weekend,
            holidayName: null,
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
          {
            date: "2027-12-26",
            type: DayType.Vacation,
            holidayName: null,
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
        ]}
        ranges={[
          {
            start: "2027-12-24",
            end: "2027-12-26",
            totalDaysOff: 3,
            vacationDaysUsed: 1,
          },
        ]}
        connectedToken="shared-seed"
      />,
    );

    const cells = Array.from(container.querySelectorAll(".shared-holiday-range"));

    expect(cells).toHaveLength(3);
    expect(cells[0]?.className).toContain("shared-holiday-range-first");
    expect(cells[1]?.className).toContain("shared-holiday-range-middle");
    expect(cells[2]?.className).toContain("shared-holiday-range-last");
  });

  it("builds shared matched ranges from overlapping continuous dates instead of exact range signatures", () => {
    useQueryMock.mockReturnValue({
      data: [
        DayType.WorkDay,
        DayType.PublicHoliday,
        DayType.Weekend,
        DayType.Vacation,
      ],
    });

    const { container } = render(
      <CalendarView
        year={2027}
        calendar={[
          {
            date: "2027-12-23",
            type: DayType.WorkDay,
            holidayName: null,
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
          {
            date: "2027-12-24",
            type: DayType.PublicHoliday,
            holidayName: "Holiday",
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
          {
            date: "2027-12-25",
            type: DayType.Weekend,
            holidayName: null,
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
          {
            date: "2027-12-26",
            type: DayType.Vacation,
            holidayName: null,
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
        ]}
        ranges={[
          {
            start: "2027-12-24",
            end: "2027-12-26",
            totalDaysOff: 3,
            vacationDaysUsed: 1,
          },
        ]}
        connectedToken="shared-seed"
      />,
    );

    const cells = Array.from(container.querySelectorAll(".shared-holiday-range"));

    expect(cells).toHaveLength(3);
    expect(cells[0]?.textContent).toBe("24");
    expect(cells[1]?.textContent).toBe("25");
    expect(cells[2]?.textContent).toBe("26");
  });

  it("shows the shared vacation indicator when both calendars use vacation on the same day", () => {
    useQueryMock.mockReturnValue({
      data: [DayType.Vacation],
    });

    const { container } = render(
      <CalendarView
        year={2027}
        calendar={[
          {
            date: "2027-08-16",
            type: DayType.Vacation,
            holidayName: null,
            sharedType: undefined,
            sharedMatchedRange: undefined,
          },
        ]}
        connectedToken="shared-seed"
      />,
    );

    const sharedVacationCell = container.querySelector(".shared-vacation-icon.shared-vacation");

    expect(sharedVacationCell).toBeTruthy();
  });

  it("updates shared matched ranges when the result changes, such as after shuffle", () => {
    useQueryMock.mockReturnValue({
      data: [
        DayType.PublicHoliday,
        DayType.Weekend,
        DayType.Vacation,
        DayType.WorkDay,
      ],
    });

    const calendar = [
      {
        date: "2027-12-24",
        type: DayType.PublicHoliday,
        holidayName: "Holiday",
        sharedType: undefined,
        sharedMatchedRange: undefined,
      },
      {
        date: "2027-12-25",
        type: DayType.Weekend,
        holidayName: null,
        sharedType: undefined,
        sharedMatchedRange: undefined,
      },
      {
        date: "2027-12-26",
        type: DayType.Vacation,
        holidayName: null,
        sharedType: undefined,
        sharedMatchedRange: undefined,
      },
      {
        date: "2027-12-27",
        type: DayType.WorkDay,
        holidayName: null,
        sharedType: undefined,
        sharedMatchedRange: undefined,
      },
    ];

    const { container, rerender } = render(
      <CalendarView
        year={2027}
        calendar={calendar}
        ranges={[
          {
            start: "2027-12-24",
            end: "2027-12-26",
            totalDaysOff: 3,
            vacationDaysUsed: 1,
          },
        ]}
        connectedToken="shared-seed"
      />,
    );

    expect(container.querySelectorAll(".shared-holiday-range")).toHaveLength(3);

    rerender(
      <CalendarView
        year={2027}
        calendar={calendar}
        ranges={[]}
        connectedToken="shared-seed"
      />,
    );

    expect(container.querySelectorAll(".shared-holiday-range")).toHaveLength(0);
  });

  it("shows a monthly cap value and opens the cap editor when the month icon is clicked", async () => {
    useQueryMock.mockReturnValue({ data: undefined });
    const onSetMonthCap = vi.fn();

    render(
      <CalendarView
        year={2027}
        calendar={[]}
        monthlyCaps={{ January: 3 }}
        onSetMonthCap={onSetMonthCap}
      />,
    );

    expect(screen.getByText("3")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /Set January vacation-day cap/i }));
    expect(onSetMonthCap).toHaveBeenCalledWith(0);
  });
});
