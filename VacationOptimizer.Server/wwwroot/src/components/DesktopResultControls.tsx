import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { createPortal } from "react-dom";
import useScrollDirection from "../hooks/useScrollDirection";

interface Props {
    isLoading: boolean;
    canNavigatePrevious: boolean;
    canNavigateNext: boolean;
    hasReachedShuffleLimit?: boolean;
    hasLockedBudgetLimit?: boolean;
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

export default function DesktopResultControls({
    isLoading,
    canNavigatePrevious,
    canNavigateNext,
    hasReachedShuffleLimit,
    hasLockedBudgetLimit,
    onShuffle,
    onPrevious,
    onNext,
}: Props) {
    const visible = useScrollDirection(isLoading);

    const content = (
        <div className={`pointer-events-none fixed inset-x-4 bottom-6 z-30 hidden transition-transform duration-300 ease-in-out sm:block ${visible ? "translate-y-0" : "translate-y-[calc(100%+1.5rem)]"}`}>
            <div className="mx-auto flex w-full max-w-6xl justify-end">
                <div
                    role="group"
                    aria-label="Result controls"
                    className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                >
                    <button
                        id="previous-optimization-desktop"
                        type="button"
                        disabled={!canNavigatePrevious || isLoading}
                        onClick={onPrevious}
                        className="action-btn action-btn-secondary h-10 shrink-0 items-center justify-center"
                        aria-label="Previous result"
                        title="Previous result"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        id="next-optimization-desktop"
                        type="button"
                        disabled={!canNavigateNext || isLoading}
                        onClick={onNext}
                        className="action-btn action-btn-secondary h-10 shrink-0 items-center justify-center"
                        aria-label="Next result"
                        title="Next result"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        id="shuffle-optimization-desktop"
                        type="button"
                        disabled={isLoading || hasReachedShuffleLimit || hasLockedBudgetLimit}
                        onClick={onShuffle}
                        className="action-btn action-btn-secondary h-10 shrink-0 items-center justify-center"
                        title="Shuffle — generate a different optimization with the same settings"
                    >
                        <Shuffle className="h-4 w-4" />
                        Shuffle
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document === "undefined") {
        return content;
    }

    return createPortal(content, document.body);
}
