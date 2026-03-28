import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import OptimizerForm from "./OptimizerForm";

const countries = [
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
];

const indiaSchema = {
  countryCode: "IN" as const,
  component: "india" as const,
  yearRange: { min: 2026, max: 2031 },
  defaults: {
    vacationDays: 25,
    minimumDaysPerRange: 4,
    maximumDaysPerRange: 14,
  },
  stateSelectionRequired: true as const,
  states: [
    { code: "IN-KA", name: "Karnataka" },
    { code: "IN-TN", name: "Tamil Nadu" },
  ],
};

vi.mock("../api/vacationApi", () => ({
  useCountries: () => ({
    data: countries,
    isLoading: false,
  }),
  useDetectedCountry: () => ({
    data: {
      hasGeoHeaders: false,
      countryCode: null,
    },
    isLoading: false,
  }),
  useStates: () => ({
    data: [],
    isLoading: false,
  }),
  useIndiaSchema: () => ({
    data: indiaSchema,
    isLoading: false,
  }),
  useSpainSchema: () => ({
    data: {
      countryCode: "ES" as const,
      component: "spain" as const,
      yearRange: { min: 2026, max: 2031 },
      defaults: {
        vacationDays: 25,
        minimumDaysPerRange: 4,
        maximumDaysPerRange: 14,
      },
      states: [],
      cities: [],
    },
    isLoading: false,
  }),
}));

describe("OptimizerForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders only the country selector before a country is chosen", () => {
    render(
      <OptimizerForm
        onResult={vi.fn()}
        isLoading={false}
        customFreeDays={[]}
        onCustomFreeDaysChange={vi.fn()}
        initialRequest={null}
      />,
    );

    expect(screen.getByLabelText("Country")).toBeTruthy();
    expect(screen.queryByLabelText("Year")).toBeNull();
    expect(screen.queryByLabelText("State / Region")).toBeNull();
  });

  it("mounts the India form and requires a state before submit", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <OptimizerForm
        onResult={onResult}
        isLoading={false}
        customFreeDays={[]}
        onCustomFreeDaysChange={vi.fn()}
        initialRequest={null}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Country"), "IN");

    expect(screen.getByLabelText("State / Region")).toBeTruthy();
    expect((screen.getByRole("button", { name: /Optimize/i }) as HTMLButtonElement).disabled).toBe(true);

    await user.selectOptions(screen.getByLabelText("State / Region"), "IN-KA");

    const optimizeButton = screen.getByRole("button", { name: /Optimize/i });
    expect((optimizeButton as HTMLButtonElement).disabled).toBe(false);
  });
});
