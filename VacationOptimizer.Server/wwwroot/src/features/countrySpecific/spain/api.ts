import { useQuery } from "@tanstack/react-query";
import type { OptimizeResult } from "../../../types/models";
import type { SpainCountrySchema, SpainOptimizeRequest } from "./models";

const BASE = "/api/vacations";

export async function fetchSpainSchema(): Promise<SpainCountrySchema> {
    const res = await fetch(`${BASE}/countries/ES/schema`);
    if (!res.ok) throw new Error("Failed to fetch Spain form schema");
    return res.json();
}

export async function optimizeSpainVacation(request: SpainOptimizeRequest): Promise<OptimizeResult> {
    const { country: _country, ...body } = request;
    const res = await fetch(`${BASE}/countries/ES/optimize`, {
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

export function useSpainSchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "ES"],
        queryFn: fetchSpainSchema,
        staleTime: Infinity,
        enabled,
    });
}
