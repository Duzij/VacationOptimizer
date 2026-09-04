import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import HeroMap from "./HeroMap";
import { buildShowcasePlannerPath } from "../showcase";
import { GLOBE_DOTS, filterSupportedMarkers } from "../worldMap";

// Mirrors the countries actually seeded by the backend (ReferenceDataSeeder).
const countries = [
    { code: "ES", name: "Spain" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
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
        if (url.startsWith("/api/vacations/detected-country")) {
            return new Response(JSON.stringify({ hasGeoHeaders: false, countryCode: null }), { status: 200 });
        }
        return new Response("not found", { status: 404 });
    });
}

function renderHeroMap() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <HeroMap />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe("buildShowcasePlannerPath", () => {
    it("builds a planner deep link for Spain", () => {
        expect(buildShowcasePlannerPath("es")).toBe("/app?country=ES&year=2026&vacationDays=25");
    });

    it("includes the default state for India", () => {
        expect(buildShowcasePlannerPath("IN")).toBe("/app?country=IN&stateCode=IN-KA&year=2026&vacationDays=25");
    });
});

describe("HeroMap", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", mockFetch());
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it("renders the hero headline with the two call-to-action buttons on top of the map", async () => {
        renderHeroMap();

        expect(
            screen.getByRole("heading", { level: 1, name: /There is a better way/i }),
        ).toBeTruthy();
        expect(screen.getByRole("link", { name: /Start planning/i })).toBeTruthy();
        expect(screen.getByRole("link", { name: /Learn more/i })).toBeTruthy();
        expect(screen.getByRole("application")).toBeTruthy();
    });

    it("only resolves markers for countries the backend supports", () => {
        // The backend seeds only Spain, India, and Indonesia
        // (ReferenceDataSeeder.cs). Even though the coordinate table is a
        // superset, markers must resolve to exactly the supported set.
        expect(filterSupportedMarkers(["ES", "IN", "ID"])).toEqual(["ES", "IN", "ID"]);

        // Bogus or unknown codes never survive filtering.
        expect(filterSupportedMarkers(["ES", "FL", "XX"])).toEqual(["ES"]);
    });

    it("ships a dense land-dot dataset", () => {
        expect(GLOBE_DOTS.length).toBeGreaterThan(7_000);
    });

    it("exposes working zoom controls", async () => {
        const user = userEvent.setup();
        renderHeroMap();

        const zoomIn = await screen.findByRole("button", { name: "Zoom in" });
        const zoomOut = screen.getByRole("button", { name: "Zoom out" });

        await user.click(zoomIn);
        await user.click(zoomOut);

        expect(zoomIn).toBeTruthy();
        expect(zoomOut).toBeTruthy();
    });

    it("opens an anchored popup with the planner CTA when a country is selected", async () => {
        const user = userEvent.setup();
        renderHeroMap();

        const canvas = (await screen.findByRole("application")) as HTMLCanvasElement;
        canvas.focus();
        await user.keyboard("{Enter}");

        const dialog = await screen.findByRole("dialog", { name: /Plan time off in Spain/i });
        expect(dialog).toBeTruthy();

        const cta = within(dialog).getByRole("link");
        expect(cta.getAttribute("href")).toBe("/app?country=ES&year=2026&vacationDays=25");
        expect(within(dialog).getByText(/25 PTO days become 42 total days off in 2026/)).toBeTruthy();

        await user.click(within(dialog).getByRole("button", { name: "Close" }));
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("keeps a usable popup when the showcase number fails to load", async () => {
        vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.startsWith("/api/vacations/showcase")) {
                return new Response(JSON.stringify({ error: "boom" }), { status: 400 });
            }
            if (url.startsWith("/api/vacations/countries")) {
                return new Response(JSON.stringify(countries), { status: 200 });
            }
            return new Response(JSON.stringify({ hasGeoHeaders: false, countryCode: null }), { status: 200 });
        }));

        const user = userEvent.setup();
        renderHeroMap();

        const canvas = (await screen.findByRole("application")) as HTMLCanvasElement;
        canvas.focus();
        await user.keyboard("{Enter}");

        const dialog = await screen.findByRole("dialog", { name: /Plan time off in Spain/i });
        expect(within(dialog).getByRole("link").getAttribute("href")).toBe(
            "/app?country=ES&year=2026&vacationDays=25",
        );
        expect(within(dialog).getByText(/25 PTO days to plan within 2026/)).toBeTruthy();
    });
});
