import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "./Button";

export interface DayLipDetails {
    formattedDate: string;
    label: string;
    detail?: string | null;
    sharedDetail?: string | null;
}

interface Props {
    isLoading: boolean;
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    canNavigatePrevious: boolean;
    canNavigateNext: boolean;
    dayDetails?: DayLipDetails | null;
    hasReachedShuffleLimit?: boolean;
    hasLockedBudgetLimit?: boolean;
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

export default function DetailsLipMobile({
    isLoading,
    onShuffle,
    onPrevious,
    onNext,
    canNavigatePrevious,
    canNavigateNext,
    dayDetails,
    hasReachedShuffleLimit,
    hasLockedBudgetLimit,
}: Props) {
    const visible = useScrollDirection(isLoading, dayDetails);

    const content = (
        <div
            className={`fixed inset-x-0 bottom-0 z-20 sm:hidden transition-transform duration-300 ease-in-out ${visible ? "translate-y-0" : "translate-y-full"}`}
        >
            <div className="border border-border border-b-0 rounded-t-[1.75rem] bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-[0_-16px_40px_rgba(0,0,0,0.26)] backdrop-blur sm:border-b sm:rounded-2xl">
                {dayDetails ? (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <p className="text-[1.15rem] font-semibold leading-tight text-text">
                                {dayDetails.formattedDate}
                            </p>
                            <p className="text-base leading-snug text-text">
                                {dayDetails.label}
                            </p>
                            {dayDetails.detail && (
                                <p className="text-sm leading-snug text-text-muted">
                                    {dayDetails.detail}
                                </p>
                            )}
                            {dayDetails.sharedDetail && (
                                <p className="rounded-2xl border border-border/70 bg-surface/70 px-3 py-2 text-sm leading-snug text-text-muted">
                                    {dayDetails.sharedDetail}
                                </p>
                            )}
                        </div>
                        <ResultControls
                            isLoading={isLoading}
                            onShuffle={onShuffle}
                            onPrevious={onPrevious}
                            onNext={onNext}
                            canNavigatePrevious={canNavigatePrevious}
                            canNavigateNext={canNavigateNext}
                            hasReachedShuffleLimit={hasReachedShuffleLimit}
                            hasLockedBudgetLimit={hasLockedBudgetLimit}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm leading-snug text-text-muted">
                            Not happy with the result?
                        </p>
                        <ResultControls
                            isLoading={isLoading}
                            onShuffle={onShuffle}
                            onPrevious={onPrevious}
                            onNext={onNext}
                            canNavigatePrevious={canNavigatePrevious}
                            canNavigateNext={canNavigateNext}
                            hasReachedShuffleLimit={hasReachedShuffleLimit}
                            hasLockedBudgetLimit={hasLockedBudgetLimit}
                        />
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

function ResultControls({
    isLoading,
    onShuffle,
    onPrevious,
    onNext,
    canNavigatePrevious,
    canNavigateNext,
    hasReachedShuffleLimit,
    hasLockedBudgetLimit,
}: {
    isLoading: boolean;
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    canNavigatePrevious: boolean;
    canNavigateNext: boolean;
    hasReachedShuffleLimit?: boolean;
    hasLockedBudgetLimit?: boolean;
}) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)] gap-2">
            <Button
                id="previous-optimization"
                type="button"
                variant="secondary"
                disabled={!canNavigatePrevious || isLoading}
                onClick={onPrevious}
                aria-label="Previous result"
                fullWidth
                className="justify-center px-0"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
                id="next-optimization"
                type="button"
                variant="secondary"
                disabled={!canNavigateNext || isLoading}
                onClick={onNext}
                aria-label="Next result"
                fullWidth
                className="justify-center px-0"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
                id="shuffle-optimization"
                type="button"
                variant="secondary"
                disabled={isLoading || hasReachedShuffleLimit || hasLockedBudgetLimit}
                onClick={onShuffle}
                aria-label="Shuffle optimization"
                fullWidth
                className="justify-center"
            >
                <Shuffle className="w-4 h-4" />
                Shuffle
            </Button>
        </div>
    );
}
