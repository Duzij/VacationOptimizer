import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchShowcaseDaysOff, useCountries, useShowcaseDaysOff } from "../api/vacationApi";
import {
    FEATURED_COUNTRY_CODES,
    SHOWCASE_VACATION_DAYS,
    buildShowcasePlannerPath,
} from "../showcase";

const ROTATION_INTERVAL_MS = 4500;

function prefersReducedMotion() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function CountryShowcase() {
    const { data: countries } = useCountries();
    const [selectedCode, setSelectedCode] = useState<string>(FEATURED_COUNTRY_CODES[0]);
    const [isPaused, setIsPaused] = useState(false);
    const reducedMotionRef = useRef(prefersReducedMotion());

    // Prefetch every featured country's number so the rotation never pops in.
    useQueries({
        queries: FEATURED_COUNTRY_CODES.map((code) => ({
            queryKey: ["showcase", code],
            queryFn: () => fetchShowcaseDaysOff(code),
            staleTime: Infinity,
        })),
    });

    useEffect(() => {
        if (isPaused || reducedMotionRef.current) {
            return;
        }

        const timer = window.setInterval(() => {
            setSelectedCode((current) => {
                const index = FEATURED_COUNTRY_CODES.indexOf(
                    current as (typeof FEATURED_COUNTRY_CODES)[number],
                );
                const nextIndex = index === -1 ? 0 : (index + 1) % FEATURED_COUNTRY_CODES.length;
                return FEATURED_COUNTRY_CODES[nextIndex];
            });
        }, ROTATION_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [isPaused]);

    const countryNameByCode = useMemo(() => {
        const map = new Map<string, string>();
        countries?.forEach((country) => map.set(country.code.toUpperCase(), country.name));
        return map;
    }, [countries]);

    const selectedName = countryNameByCode.get(selectedCode) ?? selectedCode;
    const showcaseQuery = useShowcaseDaysOff(selectedCode);
    const totalDaysOff = showcaseQuery.data;
    const plannerPath = buildShowcasePlannerPath(selectedCode);

    return (
        <section
            aria-label="Vacation days by country"
            className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-surface/55"
            onPointerEnter={() => setIsPaused(true)}
            onPointerLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
        >
            <div className="grid gap-6 px-4 py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] md:items-center md:px-8 md:py-8">
                <div
                    key={selectedCode}
                    className="showcase-enter flex items-center gap-5"
                    aria-live="polite"
                >
                    <span
                        aria-hidden="true"
                        className={`showcase-flag fi fi-${selectedCode.toLowerCase()} text-6xl md:text-7xl`}
                    />
                    <div className="space-y-1">
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-text-muted">
                            {selectedName}
                        </p>
                        <p className="text-2xl font-semibold tracking-tight text-text md:text-3xl">
                            {SHOWCASE_VACATION_DAYS} PTO days
                            <span className="mx-2 text-[var(--landing-accent)]" aria-hidden="true">&rarr;</span>
                            {typeof totalDaysOff === "number" ? (
                                <span className="showcase-number text-[var(--landing-accent)]">
                                    {totalDaysOff} days off
                                </span>
                            ) : (
                                <span className="text-text-muted">…</span>
                            )}
                            <span className="sr-only">
                                {typeof totalDaysOff === "number"
                                    ? `${SHOWCASE_VACATION_DAYS} vacation days become ${totalDaysOff} total days off in ${selectedName}`
                                    : `Loading total days off for ${selectedName}`}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="showcase-country"
                            className="text-sm font-medium text-text"
                        >
                            Pick your country
                        </label>
                        <select
                            id="showcase-country"
                            value={selectedCode}
                            onChange={(event) => {
                                setSelectedCode(event.target.value);
                                setIsPaused(true);
                            }}
                            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
                        >
                            {(countries ?? []).map((country) => (
                                <option key={country.code} value={country.code.toUpperCase()}>
                                    {country.name}
                                </option>
                            ))}
                            {!countries?.some((country) => country.code.toUpperCase() === selectedCode) && (
                                <option value={selectedCode}>{selectedName}</option>
                            )}
                        </select>
                    </div>

                    <Link
                        to={plannerPath}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--landing-accent)_18%,var(--color-border))] bg-[color-mix(in_srgb,var(--landing-accent)_88%,black)] px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,123,131,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--landing-accent)_96%,black)] hover:shadow-[0_14px_30px_rgba(15,123,131,0.22)]"
                    >
                        {showcaseQuery.isError
                            ? `Start planning in ${selectedName}`
                            : `In ${selectedName} from ${SHOWCASE_VACATION_DAYS} days to ${typeof totalDaysOff === "number" ? totalDaysOff : "…"} overall days`}
                        <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
