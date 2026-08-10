import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
}));

vi.mock("../features/countrySpecific/countrySpecificApi", () => ({
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
  useSwitzerlandSchema: () => ({
    data: {
      countryCode: "CH" as const,
      component: "switzerland" as const,
      yearRange: { min: 2026, max: 2031 },
      defaults: {
        vacationDays: 25,
        minimumDaysPerRange: 4,
        maximumDaysPerRange: 14,
      },
      cantonSelectionRequired: true,
      cantons: [],
    },
    isLoading: false,
  }),
}));

vi.mock("../features/countrySpecific/india/api", () => ({
  useIndiaSchema: () => ({
    data: indiaSchema,
    isLoading: false,
  }),
}));

vi.mock("../features/countrySpecific/spain/api", () => ({
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

vi.mock("../features/countrySpecific/switzerland/api", () => ({
  useSwitzerlandSchema: () => ({
    data: {
      countryCode: "CH" as const,
      component: "switzerland" as const,
      yearRange: { min: 2026, max: 2031 },
      defaults: {
        vacationDays: 25,
        minimumDaysPerRange: 4,
        maximumDaysPerRange: 14,
      },
      cantonSelectionRequired: true,
      cantons: [],
    },
    isLoading: false,
  }),
}));

describe("OptimizerForm", () => {
  afterEach(() => {
    cleanup();
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

  it("includes a monthly vacation cap in the optimization request", async () => {
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

    await user.selectOptions(screen.getByLabelText("Country"), "DE");
    await user.click(screen.getByRole("button", { name: "Advanced constraints" }));
    await user.selectOptions(screen.getByLabelText("Add monthly vacation-day cap"), "January");
    const increaseJanuaryCap = screen.getByRole("button", { name: /Increase January/i });
    await user.click(increaseJanuaryCap);
    await user.click(increaseJanuaryCap);
    await user.click(screen.getByRole("button", { name: /Optimize/i }));

    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({
      maxNumberOfVacationsPerMonth: { January: 2 },
    }));
  });

  it("resets previous yearly monthly caps and loads new year limits when the year changes", async () => {
    window.localStorage.setItem(
      "vacationOptimizer.v2.savedRequest.2027",
      JSON.stringify({
        country: "DE",
        year: 2027,
        vacationDays: 25,
        minimumDaysPerRange: 4,
        maximumDaysPerRange: 14,
        maxNumberOfVacationsPerMonth: { February: 2 },
      }),
    );

    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <OptimizerForm
        onResult={onResult}
        isLoading={false}
        customFreeDays={[]}
        onCustomFreeDaysChange={vi.fn()}
        initialRequest={{
          country: "DE",
          year: 2026,
          vacationDays: 25,
          minimumDaysPerRange: 4,
          maximumDaysPerRange: 14,
          maxNumberOfVacationsPerMonth: { January: 1 },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Advanced constraints" }));

    const yearInput = screen.getByLabelText("Year") as HTMLInputElement;
    await user.clear(yearInput);
    await user.type(yearInput, "2027");
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Decrease January/i })).toBeNull();
    });

    expect(screen.getByRole("button", { name: /Decrease February/i })).toBeTruthy();
    expect(screen.getByDisplayValue("2")).toBeTruthy();
  });
});
