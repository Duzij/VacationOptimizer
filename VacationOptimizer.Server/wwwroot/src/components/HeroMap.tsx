import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowRight,
    LoaderCircle,
    Minus,
    Plus,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    useCountries,
    useDetectedCountry,
    useShowcaseDaysOff,
} from "../api/vacationApi";
import {
    SHOWCASE_YEAR,
    SHOWCASE_VACATION_DAYS,
    buildShowcasePlannerPath,
} from "../showcase";
import {
    COUNTRY_COORDS,
    GLOBE_DOTS,
    MAP_HEIGHT,
    MAP_WIDTH,
    filterSupportedMarkers,
    projectPoint,
} from "../worldMap";

const HIT_TEST_RADIUS_PX = 26;
const TAP_MAX_MOVEMENT_PX = 8;
const TAP_MAX_DURATION_MS = 400;
const ZOOM_WHEEL_FACTOR = 0.0015;
const DOT_RADIUS_MAP_UNITS = 0.42;

// Desktop framing includes Europe and the Americas. Mobile starts closer to
// the countries currently supported by the planner.
const DESKTOP_TARGET_LNG_SPAN_DEG = 150;
const DESKTOP_FOCUS: [number, number] = [-32, 46];
const MOBILE_FOCUS: [number, number] = [14, 51];

const dotPoints = GLOBE_DOTS.map(projectPoint);

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function isNarrowViewport() {
    return typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(max-width: 767px)").matches;
}

interface View {
    scale: number;
    tx: number;
    ty: number;
}

interface Marker {
    code: string;
    point: { x: number; y: number };
}

interface ScreenMarker {
    code: string;
    x: number;
    y: number;
}

export default function HeroMap() {
    const { data: countries } = useCountries();
    const { data: detected } = useDetectedCountry();
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [hoveredCode, setHoveredCode] = useState<string | null>(null);

    const stageRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const popupSizeRef = useRef({ width: 250, height: 170 });
    const viewRef = useRef<View>({ scale: 0, tx: 0, ty: 0 });
    const markersRef = useRef<Marker[]>([]);
    const hoveredCodeRef = useRef<string | null>(null);
    const selectionRef = useRef<string | null>(null);
    const requestRenderRef = useRef<() => void>(() => undefined);

    const markers = useMemo(
        () =>
            filterSupportedMarkers((countries ?? []).map((country) => country.code))
                .sort()
                .map((code) => ({
                    code,
                    point: projectPoint(COUNTRY_COORDS[code]),
                })),
        [countries],
    );

    const detectedCode = detected?.countryCode?.toUpperCase();
    const effectiveSelection =
        selectedCode
        ?? (detectedCode && COUNTRY_COORDS[detectedCode] ? detectedCode : null);

    useEffect(() => {
        markersRef.current = markers;
        requestRenderRef.current();
    }, [markers]);

    useEffect(() => {
        hoveredCodeRef.current = hoveredCode;
        requestRenderRef.current();
    }, [hoveredCode]);

    useEffect(() => {
        selectionRef.current = effectiveSelection;
        requestRenderRef.current();
    }, [effectiveSelection]);

    useEffect(() => {
        const popup = popupRef.current;
        if (!popup || typeof ResizeObserver !== "function") {
            return;
        }
        const observer = new ResizeObserver(([entry]) => {
            popupSizeRef.current = {
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            };
            requestRenderRef.current();
        });
        observer.observe(popup);
        return () => observer.disconnect();
    }, [effectiveSelection]);

    const nameFor = useCallback(
        (code: string | null) => {
            if (!code) {
                return "";
            }
            return countries?.find((country) => country.code.toUpperCase() === code)?.name ?? code;
        },
        [countries],
    );

    const markerScreenPositions = useCallback((view: View): ScreenMarker[] => {
        const markers = markersRef.current;
        const contentWidth = MAP_WIDTH * view.scale;
        if (!(contentWidth > 0)) {
            return markers.map((marker) => ({ code: marker.code, x: 0, y: 0 }));
        }
        const baseTx = ((view.tx % contentWidth) + contentWidth) % contentWidth;
        const offsets = [baseTx - contentWidth, baseTx, baseTx + contentWidth];
        const positions: ScreenMarker[] = [];
        for (const marker of markers) {
            for (const offset of offsets) {
                positions.push({
                    code: marker.code,
                    x: marker.point.x * view.scale + offset,
                    y: marker.point.y * view.scale + view.ty,
                });
            }
        }
        return positions;
    }, []);

    const findMarkerAt = useCallback((clientX: number, clientY: number) => {
        const stage = stageRef.current;
        const view = viewRef.current;
        if (!stage || view.scale === 0) {
            return null;
        }
        const rect = stage.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        let nearest: ScreenMarker | null = null;
        let nearestDistance = HIT_TEST_RADIUS_PX;

        for (const candidate of markerScreenPositions(view)) {
            const distance = Math.hypot(candidate.x - x, candidate.y - y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = candidate;
            }
        }
        return nearest;
    }, [markerScreenPositions]);

    const clampView = useCallback((width: number, height: number): View => {
        const view = viewRef.current;
        const fitScale = Math.min(width / MAP_WIDTH, height / MAP_HEIGHT);
        view.scale = Math.max(view.scale, fitScale);
        const contentHeight = MAP_HEIGHT * view.scale;
        view.ty = contentHeight <= height
            ? (height - contentHeight) / 2
            : clamp(view.ty, height - contentHeight, 0);
        return view;
    }, []);

    const zoomAbout = useCallback((factor: number, px: number, py: number) => {
        const stage = stageRef.current;
        if (!stage || factor === 1) {
            return;
        }
        const view = viewRef.current;
        const fitScale = Math.min(
            stage.clientWidth / MAP_WIDTH,
            stage.clientHeight / MAP_HEIGHT,
        );
        const nextScale = clamp(view.scale * factor, fitScale, 8);
        if (nextScale === view.scale) {
            return;
        }
        const k = nextScale / view.scale;
        view.tx = px - (px - view.tx) * k;
        view.ty = py - (py - view.ty) * k;
        view.scale = nextScale;
        clampView(stage.clientWidth, stage.clientHeight);
        requestRenderRef.current();
    }, [clampView]);

    useEffect(() => {
        const stage = stageRef.current;
        const canvas = canvasRef.current;
        if (!stage || !canvas) {
            return;
        }
        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        // A single Path2D turns thousands of individual canvas operations
        // into three fills (one per wrapped world tile).
        const dotPath = new Path2D();
        for (const point of dotPoints) {
            dotPath.moveTo(point.x + DOT_RADIUS_MAP_UNITS, point.y);
            dotPath.arc(point.x, point.y, DOT_RADIUS_MAP_UNITS, 0, Math.PI * 2);
        }

        let rafId = 0;
        let dotColor = "#9ab8ba";
        let markerColor = "#0f7b83";
        const readColors = () => {
            const colors = getComputedStyle(document.documentElement);
            dotColor = colors.getPropertyValue("--globe-dot").trim() || dotColor;
            markerColor = colors.getPropertyValue("--landing-accent").trim() || markerColor;
        };
        const requestRender = () => {
            if (rafId) {
                return;
            }
            rafId = requestAnimationFrame(() => {
                rafId = 0;
                draw();
            });
        };

        const draw = () => {
            const width = stage.clientWidth;
            const height = stage.clientHeight;
            if (width === 0 || height === 0) {
                return;
            }

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (canvas.width !== Math.round(width * dpr)
                || canvas.height !== Math.round(height * dpr)) {
                canvas.width = Math.round(width * dpr);
                canvas.height = Math.round(height * dpr);
                viewRef.current.scale = 0;
            }
            if (viewRef.current.scale === 0) {
                const coverScale = Math.max(width / MAP_WIDTH, height / MAP_HEIGHT);
                const focus = projectPoint(isNarrowViewport() ? MOBILE_FOCUS : DESKTOP_FOCUS);
                const scale = isNarrowViewport()
                    ? coverScale * 2.4
                    : Math.max(coverScale, (width * 360) / (DESKTOP_TARGET_LNG_SPAN_DEG * MAP_WIDTH));
                viewRef.current = {
                    scale,
                    tx: width / 2 - focus.x * scale,
                    ty: height / 2 - focus.y * scale,
                };
                clampView(width, height);
            }

            const view = viewRef.current;
            const contentWidth = MAP_WIDTH * view.scale;
            const baseTx = ((view.tx % contentWidth) + contentWidth) % contentWidth;
            const offsets = [baseTx - contentWidth, baseTx, baseTx + contentWidth];

            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.clearRect(0, 0, width, height);
            context.fillStyle = dotColor;
            for (const offset of offsets) {
                if (offset > width || offset + contentWidth < 0) {
                    continue;
                }
                context.save();
                context.translate(offset, view.ty);
                context.scale(view.scale, view.scale);
                context.fill(dotPath);
                context.restore();
            }

            const markerRadius = Math.max(3.5, view.scale * 1.1);
            const hoveredCode = hoveredCodeRef.current;
            const selectedCode = selectionRef.current;
            let hoveredScreen: ScreenMarker | null = null;
            let selectedScreen: ScreenMarker | null = null;

            for (const marker of markersRef.current) {
                const isHovered = marker.code === hoveredCode;
                const isSelected = marker.code === selectedCode;
                for (const offset of offsets) {
                    const x = marker.point.x * view.scale + offset;
                    const y = marker.point.y * view.scale + view.ty;
                    if (x < -markerRadius * 5 || x > width + markerRadius * 5
                        || y < -markerRadius * 5 || y > height + markerRadius * 5) {
                        continue;
                    }
                    if (isHovered) {
                        hoveredScreen = { code: marker.code, x, y };
                    }
                    if (isSelected && !selectedScreen) {
                        selectedScreen = { code: marker.code, x, y };
                    }
                    if (isHovered || isSelected) {
                        context.beginPath();
                        context.arc(x, y, markerRadius * (isHovered ? 3 : 2.5), 0, Math.PI * 2);
                        context.fillStyle = markerColor;
                        context.globalAlpha = isHovered ? 0.26 : 0.16;
                        context.fill();
                        context.globalAlpha = 1;
                    }
                    context.beginPath();
                    context.arc(x, y, markerRadius * (isHovered ? 1.4 : 1), 0, Math.PI * 2);
                    context.fillStyle = markerColor;
                    context.fill();
                    if (isSelected) {
                        context.beginPath();
                        context.arc(x, y, markerRadius * 2.1, 0, Math.PI * 2);
                        context.strokeStyle = markerColor;
                        context.lineWidth = 1.5;
                        context.stroke();
                    }
                }
            }

            const tooltip = tooltipRef.current;
            if (tooltip) {
                if (hoveredCode && hoveredScreen) {
                    tooltip.style.opacity = "1";
                    tooltip.style.transform =
                        `translate(${hoveredScreen.x}px, ${hoveredScreen.y}px) translate(-50%, -135%)`;
                } else {
                    tooltip.style.opacity = "0";
                }
            }

            const popup = popupRef.current;
            if (popup) {
                if (selectedCode && selectedScreen) {
                    const { width: popupWidth, height: popupHeight } = popupSizeRef.current;
                    const anchorX = clamp(selectedScreen.x, popupWidth / 2 + 8, width - popupWidth / 2 - 8);
                    const aboveY = selectedScreen.y - markerRadius * 3 - popupHeight;
                    const popupY = aboveY >= 8
                        ? aboveY
                        : Math.min(selectedScreen.y + markerRadius * 3 + 10, height - popupHeight - 8);
                    popup.style.opacity = "1";
                    popup.style.transform = `translate(${anchorX - popupWidth / 2}px, ${popupY}px)`;
                } else {
                    popup.style.opacity = "0";
                }
            }
        };

        requestRenderRef.current = requestRender;
        const observer = new ResizeObserver(requestRender);
        observer.observe(stage);
        const themeObserver = new MutationObserver(() => {
            readColors();
            requestRender();
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        readColors();
        requestRender();

        return () => {
            if (requestRenderRef.current === requestRender) {
                requestRenderRef.current = () => undefined;
            }
            cancelAnimationFrame(rafId);
            observer.disconnect();
            themeObserver.disconnect();
        };
    }, [clampView]);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) {
            return;
        }

        let pointerId: number | null = null;
        let startX = 0;
        let startY = 0;
        let lastX = 0;
        let lastY = 0;
        let moved = false;
        let startTime = 0;
        const activePointers = new Map<number, { x: number; y: number }>();
        let lastPinchDistance: number | null = null;
        let pinching = false;

        const onPointerDown = (event: PointerEvent) => {
            // Do not capture a pointer that began on a control: capturing it
            // on the map prevents the button from receiving its click event.
            if (event.target instanceof Element && event.target.closest("button, a")) {
                return;
            }
            activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (activePointers.size === 2) {
                pinching = true;
                moved = true;
                lastPinchDistance = null;
                return;
            }
            pointerId = event.pointerId;
            startX = lastX = event.clientX;
            startY = lastY = event.clientY;
            moved = false;
            startTime = performance.now();
            stage.setPointerCapture?.(event.pointerId);
        };

        const onPointerMove = (event: PointerEvent) => {
            const tracked = activePointers.get(event.pointerId);
            if (tracked) {
                tracked.x = event.clientX;
                tracked.y = event.clientY;
            }
            if (pinching && activePointers.size >= 2) {
                const [a, b] = [...activePointers.values()];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                if (lastPinchDistance !== null && distance > 0) {
                    const midX = (a.x + b.x) / 2;
                    const midY = (a.y + b.y) / 2;
                    const rect = stage.getBoundingClientRect();
                    zoomAbout(distance / lastPinchDistance, midX - rect.left, midY - rect.top);
                }
                lastPinchDistance = distance;
                return;
            }
            if (pointerId === event.pointerId) {
                const dx = event.clientX - lastX;
                const dy = event.clientY - lastY;
                lastX = event.clientX;
                lastY = event.clientY;
                if (!moved && (Math.abs(event.clientX - startX) > TAP_MAX_MOVEMENT_PX
                    || Math.abs(event.clientY - startY) > TAP_MAX_MOVEMENT_PX)) {
                    moved = true;
                }
                if (moved) {
                    viewRef.current.tx += dx;
                    viewRef.current.ty += dy;
                    clampView(stage.clientWidth, stage.clientHeight);
                    requestRenderRef.current();
                }
                return;
            }
            if (event.pointerType === "mouse") {
                setHoveredCode(findMarkerAt(event.clientX, event.clientY)?.code ?? null);
            }
        };

        const endPointer = (event: PointerEvent, isCancel: boolean) => {
            activePointers.delete(event.pointerId);
            if (activePointers.size < 2 && pinching) {
                pinching = false;
                lastPinchDistance = null;
                const remaining = [...activePointers.keys()][0];
                pointerId = null;
                if (remaining !== undefined) {
                    const point = activePointers.get(remaining)!;
                    pointerId = remaining;
                    startX = lastX = point.x;
                    startY = lastY = point.y;
                    moved = true;
                    startTime = 0;
                }
            }
            if (pointerId !== event.pointerId) {
                return;
            }
            pointerId = null;
            const isTap = !isCancel && !moved && performance.now() - startTime < TAP_MAX_DURATION_MS;
            if (isTap) {
                const hit = findMarkerAt(event.clientX, event.clientY);
                setSelectedCode((current) => (hit && hit.code !== current ? hit.code : null));
            }
        };

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const rect = stage.getBoundingClientRect();
            zoomAbout(
                Math.exp(-event.deltaY * ZOOM_WHEEL_FACTOR),
                event.clientX - rect.left,
                event.clientY - rect.top,
            );
        };

        const onPointerUp = (event: PointerEvent) => endPointer(event, false);
        const onPointerCancel = (event: PointerEvent) => endPointer(event, true);
        const onPointerLeave = () => setHoveredCode(null);

        stage.addEventListener("pointerdown", onPointerDown);
        stage.addEventListener("pointermove", onPointerMove);
        stage.addEventListener("pointerup", onPointerUp);
        stage.addEventListener("pointercancel", onPointerCancel);
        stage.addEventListener("pointerleave", onPointerLeave);
        stage.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            stage.removeEventListener("pointerdown", onPointerDown);
            stage.removeEventListener("pointermove", onPointerMove);
            stage.removeEventListener("pointerup", onPointerUp);
            stage.removeEventListener("pointercancel", onPointerCancel);
            stage.removeEventListener("pointerleave", onPointerLeave);
            stage.removeEventListener("wheel", onWheel);
        };
    }, [clampView, findMarkerAt, zoomAbout]);

    const onKeyDown = (event: React.KeyboardEvent) => {
        const stage = stageRef.current;
        switch (event.key) {
            case "ArrowLeft":
            case "ArrowRight":
            case "ArrowUp":
            case "ArrowDown": {
                if (!stage) {
                    return;
                }
                const step = 60;
                viewRef.current.tx += event.key === "ArrowLeft" ? step : event.key === "ArrowRight" ? -step : 0;
                viewRef.current.ty += event.key === "ArrowUp" ? step : event.key === "ArrowDown" ? -step : 0;
                clampView(stage.clientWidth, stage.clientHeight);
                requestRenderRef.current();
                break;
            }
            case "+":
            case "-":
                if (!stage) {
                    return;
                }
                zoomAbout(event.key === "+" ? 1.25 : 0.8, stage.clientWidth / 2, stage.clientHeight / 2);
                break;
            case "Escape":
                setSelectedCode(null);
                return;
            case "Enter":
            case " ": {
                event.preventDefault();
                if (!stage) {
                    return;
                }
                const centerX = stage.clientWidth / 2;
                const centerY = stage.clientHeight / 2;
                let best: string | null = null;
                let bestScore = Infinity;
                for (const candidate of markerScreenPositions(viewRef.current)) {
                    const score = Math.hypot(candidate.x - centerX, candidate.y - centerY);
                    if (score < bestScore) {
                        bestScore = score;
                        best = candidate.code;
                    }
                }
                if (best) {
                    setSelectedCode((current) => (current === best ? null : best));
                }
                return;
            }
            default:
                return;
        }
        event.preventDefault();
    };

    const selectedQuery = useShowcaseDaysOff(effectiveSelection ?? "");
    const selectedName = nameFor(effectiveSelection);
    const selectedDays = typeof selectedQuery.data === "number" ? selectedQuery.data : null;
    const hoveredName = nameFor(hoveredCode);

    return (
        <section className="hero" aria-labelledby="hero-title">
            <div className="hero__overlay">
                <h1 id="hero-title" className="hero-title">
                    There is a better way
                    <br />
                    <span className="hero-title-accent">to use vacation days.</span>
                </h1>
                <div className="hero-actions">
                    <Link to="/app" className="btn-pill btn-pill--primary">
                        Start planning
                        <ArrowRight aria-hidden="true" />
                    </Link>
                    <Link to="/about" className="btn-pill btn-pill--ghost">
                        Learn more
                    </Link>
                </div>
            </div>

            <div ref={stageRef} className="hero__stage">
                <canvas
                    ref={canvasRef}
                    className="worldmap__canvas"
                    role="application"
                    aria-label="Interactive dotted world map. Drag to pan, scroll or pinch to zoom, then activate a highlighted country to see how many days off your vacation budget can become."
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                />

                <div className="worldmap__hud">
                    <div className="worldmap__zoom">
                        <button
                            type="button"
                            className="globe-zoom-btn"
                            aria-label="Zoom in"
                            onClick={() => {
                                const stage = stageRef.current;
                                if (stage) {
                                    zoomAbout(1.25, stage.clientWidth / 2, stage.clientHeight / 2);
                                }
                            }}
                        >
                            <Plus aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="globe-zoom-btn"
                            aria-label="Zoom out"
                            onClick={() => {
                                const stage = stageRef.current;
                                if (stage) {
                                    zoomAbout(0.8, stage.clientWidth / 2, stage.clientHeight / 2);
                                }
                            }}
                        >
                            <Minus aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div ref={tooltipRef} className="worldmap__tooltip" aria-hidden="true">
                    {hoveredName}
                </div>

                {effectiveSelection && (
                    <div
                        ref={popupRef}
                        className="worldmap__popup"
                        role="dialog"
                        aria-label={`Plan time off in ${selectedName}`}
                    >
                        <button
                            type="button"
                            className="worldmap__popup-close"
                            aria-label="Close"
                            onClick={() => setSelectedCode(null)}
                        >
                            <X aria-hidden="true" />
                        </button>
                        <p className="worldmap__panel-title">{selectedName}</p>
                        <p className="worldmap__panel-days" aria-live="polite">
                            {selectedQuery.isPending && (
                                <LoaderCircle className="worldmap__spinner" aria-hidden="true" />
                            )}
                            {selectedDays !== null
                                ? `${SHOWCASE_VACATION_DAYS} PTO days become ${selectedDays} total days off in ${SHOWCASE_YEAR}`
                                : `${SHOWCASE_VACATION_DAYS} PTO days to plan within ${SHOWCASE_YEAR}`}
                        </p>
                        <Link
                            to={buildShowcasePlannerPath(effectiveSelection)}
                            className="btn-pill btn-pill--primary worldmap__cta"
                        >
                            Plan time off in {selectedName}
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
