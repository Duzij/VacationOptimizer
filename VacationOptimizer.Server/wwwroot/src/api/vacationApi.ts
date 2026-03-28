import { useQuery, useMutation } from "@tanstack/react-query";
import {
    isIndiaOptimizeRequest,
    isSpainOptimizeRequest,
    type Country,
    type DetectedCountry,
    type IndiaCountrySchema,
    type IndiaOptimizeRequest,
    type OptimizeRequest,
    type OptimizeResult,
    type SpainCountrySchema,
    type SpainOptimizeRequest,
    type StateOption,
} from "../types/models";

const BASE = "/api/vacations";

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

export async function fetchIndiaSchema(): Promise<IndiaCountrySchema> {
    const res = await fetch(`${BASE}/countries/IN/schema`);
    if (!res.ok) throw new Error("Failed to fetch India form schema");
    return res.json();
}

export async function fetchSpainSchema(): Promise<SpainCountrySchema> {
    const res = await fetch(`${BASE}/countries/ES/schema`);
    if (!res.ok) throw new Error("Failed to fetch Spain form schema");
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
        throw new Error(err.error || "Optimization failed");
    }
    return res.json();
}

async function optimizeIndiaVacation(request: IndiaOptimizeRequest): Promise<OptimizeResult> {
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

async function optimizeSpainVacation(request: SpainOptimizeRequest): Promise<OptimizeResult> {
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

export async function optimizeVacation(request: OptimizeRequest): Promise<OptimizeResult> {
    return isIndiaOptimizeRequest(request)
        ? optimizeIndiaVacation(request)
        : isSpainOptimizeRequest(request)
            ? optimizeSpainVacation(request)
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

export function useIndiaSchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "IN"],
        queryFn: fetchIndiaSchema,
        staleTime: Infinity,
        enabled,
    });
}

export function useSpainSchema(enabled: boolean) {
    return useQuery({
        queryKey: ["country-schema", "ES"],
        queryFn: fetchSpainSchema,
        staleTime: Infinity,
        enabled,
    });
}

export function useOptimize() {
    return useMutation({
        mutationFn: optimizeVacation,
    });
}
