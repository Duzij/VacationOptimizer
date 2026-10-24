import { useEffect, useRef, useState } from "react";

export default function useScrollDirection(isLoading: boolean, revealKey?: unknown, thresholdPixels = 24) {
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
