import { useQuery } from "@tanstack/react-query";
import type { OptimizeResult } from "../../../types/models";
import type { SwitzerlandCountrySchema, SwitzerlandOptimizeRequest } from "./models";

const BASE = "/api/vacations";

export async function fetchSwitzerlandSchema(): Promise<SwitzerlandCountrySchema> {
    const res = await fetch(`${BASE}/countries/CH/schema`);
    if (!res.ok) throw new Error("Failed to fetch Switzerland form schema");
    return res.json();
}

export async function optimizeSwitzerlandVacation(request: SwitzerlandOptimizeRequest): Promise<OptimizeResult> {
    const { country: _country, ...body } = request;
    const res = await fetch(`${BASE}/countries/CH/optimize`, {
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

export function useSwitzerlandSchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "CH"],
        queryFn: fetchSwitzerlandSchema,
        staleTime: Infinity,
        enabled,
    });
}
