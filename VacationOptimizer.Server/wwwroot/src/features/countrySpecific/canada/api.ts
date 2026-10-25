import { useQuery } from "@tanstack/react-query";
import { createApiError } from "../../../api/vacationApi";
import type { OptimizeResult } from "../../../types/models";
import type { CanadaCountrySchema, CanadaOptimizeRequest } from "./models";

const BASE = "/api/vacations";

export async function fetchCanadaSchema(): Promise<CanadaCountrySchema> {
    const res = await fetch(`${BASE}/countries/CA/schema`);
    if (!res.ok) throw new Error("Failed to fetch Canada form schema");
    return res.json();
}

export async function optimizeCanadaVacation(request: CanadaOptimizeRequest): Promise<OptimizeResult> {
    const { country, ...body } = request;
    void country;
    const res = await fetch(`${BASE}/countries/CA/optimize`, {
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

export function useCanadaSchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "CA"],
        queryFn: fetchCanadaSchema,
        staleTime: Infinity,
        enabled,
    });
}
