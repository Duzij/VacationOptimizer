import { useQuery, useMutation } from "@tanstack/react-query";
import {
    type Country,
    type DetectedCountry,
    type OptimizeRequest,
    type OptimizeResult,
    type StateOption,
    type DayType,
} from "../types/models";
import {
    isIndiaOptimizeRequest,
    isSpainOptimizeRequest,
    isSwitzerlandOptimizeRequest,
} from "../features/countrySpecific/models";
import {
    optimizeIndiaVacation,
    optimizeSpainVacation,
    optimizeSwitzerlandVacation,
} from "../features/countrySpecific/countrySpecificApi";

const BASE = "/api/vacations";

export interface ApiError extends Error {
    status?: number;
}

export function createApiError(message: string, status: number): ApiError {
    return Object.assign(new Error(message), { status });
}

export async function fetchCountries(): Promise<Country[]> {
    const res = await fetch(`${BASE}/countries`);
    if (!res.ok) throw new Error("Failed to fetch countries");
    return res.json();
}

export async function fetchStates(countryCode: string): Promise<StateOption[]> {
    const res = await fetch(`${BASE}/countries/${countryCode}/states`);
    if (!res.ok) throw new Error("Failed to fetch states");
    return res.json();
}

export async function fetchDetectedCountry(): Promise<DetectedCountry> {
    const res = await fetch(`${BASE}/detected-country`);
    if (!res.ok) throw new Error("Failed to detect country");
    return res.json();
}

export async function decodeSeed(seedToken: string): Promise<DayType[]> {
    const res = await fetch(`${BASE}/decode-seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedToken }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw createApiError(err.error || "Failed to decode seed", res.status);
    }
    return res.json();
}

async function optimizeLegacyVacation(request: OptimizeRequest): Promise<OptimizeResult> {
    const res = await fetch(`${BASE}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw createApiError(err.error || "Optimization failed", res.status);
    }
    return res.json();
}

export async function optimizeVacation(request: OptimizeRequest): Promise<OptimizeResult> {
    return isIndiaOptimizeRequest(request)
        ? optimizeIndiaVacation(request)
        : isSpainOptimizeRequest(request)
            ? optimizeSpainVacation(request)
            : isSwitzerlandOptimizeRequest(request)
                ? optimizeSwitzerlandVacation(request)
                : optimizeLegacyVacation(request);
}

export function useCountries() {
    return useQuery({
        queryKey: ["countries"],
        queryFn: fetchCountries,
        staleTime: Infinity,
    });
}

export function useStates(countryCode: string) {
    return useQuery({
        queryKey: ["states", countryCode],
        queryFn: () => fetchStates(countryCode),
        staleTime: Infinity,
        enabled: Boolean(countryCode),
    });
}

export function useDetectedCountry() {
    return useQuery({
        queryKey: ["detected-country"],
        queryFn: fetchDetectedCountry,
        staleTime: Infinity,
    });
}

export function useOptimize() {
    return useMutation({
        mutationFn: optimizeVacation,
    });
}
