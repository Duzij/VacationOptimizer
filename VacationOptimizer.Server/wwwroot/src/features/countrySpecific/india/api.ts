import { useQuery } from "@tanstack/react-query";
import type { OptimizeResult } from "../../../types/models";
import type { IndiaCountrySchema, IndiaOptimizeRequest } from "./models";

const BASE = "/api/vacations";

export async function fetchIndiaSchema(): Promise<IndiaCountrySchema> {
    const res = await fetch(`${BASE}/countries/IN/schema`);
    if (!res.ok) throw new Error("Failed to fetch India form schema");
    return res.json();
}

export async function optimizeIndiaVacation(request: IndiaOptimizeRequest): Promise<OptimizeResult> {
    const { country: _country, ...body } = request;
    const res = await fetch(`${BASE}/countries/IN/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Optimization failed");
    }
    return res.json();
}

export function useIndiaSchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "IN"],
        queryFn: fetchIndiaSchema,
        staleTime: Infinity,
        enabled,
    });
}
