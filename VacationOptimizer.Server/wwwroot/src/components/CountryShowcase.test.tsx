import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import CountryShowcase from "./CountryShowcase";
import { FEATURED_COUNTRY_CODES, buildShowcasePlannerPath } from "../showcase";

const countries = [
    { code: "DE", name: "Germany" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "FR", name: "France" },
    { code: "ES", name: "Spain" },
    { code: "NL", name: "Netherlands" },
    { code: "AU", name: "Australia" },
    { code: "JP", name: "Japan" },
    { code: "IN", name: "India" },
    { code: "CH", name: "Switzerland" },
];

function mockFetch() {
    return vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith("/api/vacations/showcase")) {
            return new Response(JSON.stringify(42), { status: 200 });
        }
        if (url.startsWith("/api/vacations/countries")) {
            return new Response(JSON.stringify(countries), { status: 200 });
        }
        return new Response("not found", { status: 404 });
    });
}

function renderShowcase() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <CountryShowcase />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe("buildShowcasePlannerPath", () => {
    it("builds a planner deep link for a generic country", () => {
        expect(buildShowcasePlannerPath("de")).toBe("/app?country=DE&year=2026&vacationDays=25");
    });

    it("includes the default region for India and Switzerland", () => {
        expect(buildShowcasePlannerPath("IN")).toBe("/app?country=IN&stateCode=IN-KA&year=2026&vacationDays=25");
        expect(buildShowcasePlannerPath("CH")).toBe("/app?country=CH&cantonCode=CH-ZH&year=2026&vacationDays=25");
    });
});

describe("CountryShowcase", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", mockFetch());
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("shows the featured country with its optimized days off and a planner CTA", async () => {
        renderShowcase();

        const cta = await screen.findByRole("link", { name: /In Germany from 25 days to 42 overall days/i });
        expect(cta.getAttribute("href")).toBe("/app?country=DE&year=2026&vacationDays=25");
        expect(screen.getByText("42 days off")).toBeTruthy();
    });

    it("rotates to the next featured country on an interval", async () => {
        vi.useFakeTimers();
        renderShowcase();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(screen.getByText("Germany", { selector: "p" })).toBeTruthy();

        await act(async () => {
            await vi.advanceTimersByTimeAsync(4600);
        });

        const secondCode = FEATURED_COUNTRY_CODES[1];
        const secondName = countries.find((country) => country.code === secondCode)!.name;
        expect(screen.getByText(secondName, { selector: "p" })).toBeTruthy();
    });

    it("updates the CTA when the visitor picks another country", async () => {
        const user = userEvent.setup();
        renderShowcase();

        const select = await screen.findByLabelText("Pick your country");
        await screen.findByRole("option", { name: "India" });
        await user.selectOptions(select, "IN");

        const cta = await screen.findByRole("link", { name: /In India from 25 days to 42 overall days/i });
        expect(cta.getAttribute("href")).toBe("/app?country=IN&stateCode=IN-KA&year=2026&vacationDays=25");
    });

    it("falls back to a generic CTA when the showcase number fails to load", async () => {
        vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.startsWith("/api/vacations/showcase")) {
                return new Response(JSON.stringify({ error: "boom" }), { status: 400 });
            }
            return new Response(JSON.stringify(countries), { status: 200 });
        }));

        renderShowcase();

        const cta = await screen.findByRole("link", { name: /Start planning in Germany/i });
        expect(cta.getAttribute("href")).toBe("/app?country=DE&year=2026&vacationDays=25");
    });
});
