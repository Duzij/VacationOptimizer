import { useEffect, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "./Button";

interface Props {
    isLoading: boolean;
    onShuffle: () => void;
}

function useScrollDirection(isLoading: boolean, thresholdPixels = 24) {
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
                    setVisible(delta > 0);
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

export default function ShuffleLip({ isLoading, onShuffle }: Props) {
    const visible = useScrollDirection(isLoading);

    const content = (
        <div
            className="fixed inset-x-0 bottom-0 z-10 sm:hidden transition-transform duration-300 ease-in-out"
            style={{ transform: visible ? undefined : "translateY(100%)" }}
        >
            <div className="border border-border border-b-0 rounded-t-2xl bg-background shadow-lg px-4 py-3 sm:border-b sm:rounded-2xl">
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
            </div>
        </div>
    );

    if (typeof document === "undefined") {
        return content;
    }

    return createPortal(content, document.body);
}
