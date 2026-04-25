import { useEffect, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "./Button";

export interface DayLipDetails {
    formattedDate: string;
    label: string;
    detail?: string | null;
}

interface Props {
    isLoading: boolean;
    onShuffle: () => void;
    dayDetails?: DayLipDetails | null;
}

function useScrollDirection(isLoading: boolean, revealKey: unknown, thresholdPixels = 24) {
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
    const ignoreUntil = useRef(0);

    // Keep it visible and prevent hiding from layout-shift scrolls during/after loading
    useEffect(() => {
        if (isLoading) {
            setVisible(true);
            ignoreUntil.current = Date.now() + 800;
        }
    }, [isLoading]);

    useEffect(() => {
        if (revealKey) {
            setVisible(true);
            ignoreUntil.current = Date.now() + 300;
        }
    }, [revealKey]);

    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const currentY = window.scrollY;

                // If we recently shuffled, ignore this scroll to avoid layout-shift hiding
                if (Date.now() < ignoreUntil.current) {
                    lastScrollY.current = currentY;
                    ticking = false;
                    return;
                }

                const delta = currentY - lastScrollY.current;

                if (Math.abs(delta) >= thresholdPixels) {
                    // standard pattern: scroll down → hide, scroll up → show
                    setVisible(delta < 0);
                    lastScrollY.current = currentY;
                }

                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [thresholdPixels]);

    return visible;
}

export default function DetailsLip({ isLoading, onShuffle, dayDetails }: Props) {
    const visible = useScrollDirection(isLoading, dayDetails);
    const isShowingDayDetails = Boolean(dayDetails);

    const content = (
        <div
            className={`fixed inset-x-0 bottom-0 transition-transform duration-300 ease-in-out ${visible ? "translate-y-0" : "translate-y-full"} ${isShowingDayDetails ? "z-20 sm:inset-x-auto sm:left-1/2 sm:bottom-4 sm:w-full sm:max-w-md sm:-translate-x-1/2" : "z-10 sm:hidden"}`}
        >
            <div className="border border-border border-b-0 rounded-t-2xl bg-background shadow-lg px-4 py-3 sm:border-b sm:rounded-2xl">
                {dayDetails ? (
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text">
                                {dayDetails.formattedDate}
                            </p>
                            <p className="text-sm text-text-muted">
                                {dayDetails.label}
                                {dayDetails.detail ? ` · ${dayDetails.detail}` : ""}
                            </p>
                        </div>
                        <Button
                            id="shuffle-optimization"
                            type="button"
                            variant="secondary"
                            disabled={isLoading}
                            onClick={onShuffle}
                            aria-label="Shuffle optimization"
                        >
                            <Shuffle className="w-4 h-4" />
                            Shuffle
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-text-muted">
                            Not happy with the result?
                        </p>
                        <Button
                            id="shuffle-optimization"
                            type="button"
                            variant="secondary"
                            disabled={isLoading}
                            onClick={onShuffle}
                            aria-label="Shuffle optimization"
                        >
                            <Shuffle className="w-4 h-4" />
                            Shuffle
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    if (typeof document === "undefined") {
        return content;
    }

    return createPortal(content, document.body);
}
