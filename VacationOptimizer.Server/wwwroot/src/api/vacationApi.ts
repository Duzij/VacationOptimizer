import { useQuery, useMutation } from "@tanstack/react-query";
import type { Country, OptimizeRequest, OptimizeResult } from "../types/models";

const BASE = "/api/vacations";

export async function fetchCountries(): Promise<Country[]> {
    const res = await fetch(`${BASE}/countries`);
    if (!res.ok) throw new Error("Failed to fetch countries");
    return res.json();
}

export async function optimizeVacation(
    request: OptimizeRequest
): Promise<OptimizeResult> {
    const res = await fetch(`${BASE}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Optimization failed");
    }
    return res.json();
}

export function useCountries() {
    return useQuery({
        queryKey: ["countries"],
        queryFn: fetchCountries,
        staleTime: Infinity,
    });
}

export function useOptimize() {
    return useMutation({
        mutationFn: optimizeVacation,
    });
}
