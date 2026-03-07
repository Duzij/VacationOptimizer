import { useCallback, useRef, useState } from "react";

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD = 10; // px – cancels if finger/mouse moves more than this

export function useLongPress(onLongPress: (e: React.TouchEvent | React.MouseEvent) => void) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startPos = useRef<{ x: number; y: number } | null>(null);
    const firedRef = useRef(false);
    const [isPressed, setIsPressed] = useState(false);

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        startPos.current = null;
        firedRef.current = false;
        setIsPressed(false);
    }, []);

    const onTouchStart = useCallback(
        (e: React.TouchEvent) => {
            firedRef.current = false;
            setIsPressed(true);
            const touch = e.touches[0];
            startPos.current = { x: touch.clientX, y: touch.clientY };
            timerRef.current = setTimeout(() => {
                firedRef.current = true;
                onLongPress(e);
            }, LONG_PRESS_MS);
        },
        [onLongPress],
    );

    const onTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!startPos.current) return;
            const touch = e.touches[0];
            const dx = touch.clientX - startPos.current.x;
            const dy = touch.clientY - startPos.current.y;
            if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
                clear();
            }
        },
        [clear],
    );

    const onTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            // Prevent the click/tap that follows a long press
            if (firedRef.current) {
                e.preventDefault();
            }
            clear();
        },
        [clear],
    );

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return; // left-click only
            firedRef.current = false;
            setIsPressed(true);
            startPos.current = { x: e.clientX, y: e.clientY };
            timerRef.current = setTimeout(() => {
                firedRef.current = true;
                onLongPress(e);
                setIsPressed(false);
            }, LONG_PRESS_MS);
        },
        [onLongPress],
    );

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!startPos.current) return;
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
                clear();
            }
        },
        [clear],
    );

    const onMouseUp = useCallback(() => {
        clear();
    }, [clear]);

    const onContextMenu = useCallback(
        (e: React.MouseEvent) => {
            // Prevent right-click context menu on long-press (especially mobile)
            if (firedRef.current) {
                e.preventDefault();
            }
        },
        [],
    );

    return {
        isPressed,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onContextMenu,
    };
}
