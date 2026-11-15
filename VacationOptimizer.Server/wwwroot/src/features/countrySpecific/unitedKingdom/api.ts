import { useQuery } from "@tanstack/react-query";
import { createApiError } from "../../../api/vacationApi";
import type { OptimizeResult } from "../../../types/models";
import type { UnitedKingdomCountrySchema, UnitedKingdomOptimizeRequest } from "./models";

const BASE = "/api/vacations";

export async function fetchUnitedKingdomSchema(): Promise<UnitedKingdomCountrySchema> {
    const res = await fetch(`${BASE}/countries/GB/schema`);
    if (!res.ok) throw new Error("Failed to fetch United Kingdom form schema");
    return res.json();
}

export async function optimizeUnitedKingdomVacation(request: UnitedKingdomOptimizeRequest): Promise<OptimizeResult> {
    const { country, ...body } = request;
    void country;
    const res = await fetch(`${BASE}/countries/GB/optimize`, {
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

export function useUnitedKingdomSchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "GB"],
        queryFn: fetchUnitedKingdomSchema,
        staleTime: Infinity,
        enabled,
    });
}
