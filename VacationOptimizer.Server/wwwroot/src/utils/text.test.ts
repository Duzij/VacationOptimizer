import { describe, expect, it } from "vitest";
import { capitalizeFirstLetter } from "./text";

describe("capitalizeFirstLetter", () => {
    it("capitalizes the first letter of a lowercase word", () => {
        expect(capitalizeFirstLetter("september")).toBe("September");
    });

    it("leaves an already capitalized string unchanged", () => {
        expect(capitalizeFirstLetter("September")).toBe("September");
    });

    it("only capitalizes the first letter of multi-word strings", () => {
        expect(capitalizeFirstLetter("jumada al-awwal")).toBe("Jumada al-awwal");
    });

    it("uses the provided locale for capitalization", () => {
        expect(capitalizeFirstLetter("istanbul", "tr-TR")).toBe("İstanbul");
    });

    it("returns empty strings unchanged", () => {
        expect(capitalizeFirstLetter("")).toBe("");
    });
});
