import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { decodeSeed } from "./vacationApi";
import { DayType } from "../types/models";

describe("vacationApi", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    describe("decodeSeed", () => {
        it("returns day types on success", async () => {
            const mockResponse = [DayType.WorkDay, DayType.Vacation];
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await decodeSeed("test-token");
            expect(result).toEqual(mockResponse);
            expect(globalThis.fetch).toHaveBeenCalledWith("/api/vacations/decode-seed", expect.any(Object));
        });

        it("throws ApiError on failure", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: "Invalid token" }),
            });

            await expect(decodeSeed("test-token")).rejects.toThrow("Invalid token");
        });
    });
});
