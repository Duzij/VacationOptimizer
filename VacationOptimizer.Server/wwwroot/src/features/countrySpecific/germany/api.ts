import { useQuery } from "@tanstack/react-query";
import { createApiError } from "../../../api/vacationApi";
import type { OptimizeResult } from "../../../types/models";
import type { GermanyCountrySchema, GermanyOptimizeRequest } from "./models";

const BASE = "/api/vacations";

export async function fetchGermanySchema(): Promise<GermanyCountrySchema> {
    const res = await fetch(`${BASE}/countries/DE/schema`);
    if (!res.ok) throw new Error("Failed to fetch Germany form schema");
    return res.json();
}

export async function optimizeGermanyVacation(request: GermanyOptimizeRequest): Promise<OptimizeResult> {
    const { country, ...body } = request;
    void country;
    const res = await fetch(`${BASE}/countries/DE/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw createApiError(err.error || "Optimization failed", res.status);
    }
    return res.json();
}

export function useGermanySchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "DE"],
        queryFn: fetchGermanySchema,
        staleTime: Infinity,
        enabled,
    });
}
