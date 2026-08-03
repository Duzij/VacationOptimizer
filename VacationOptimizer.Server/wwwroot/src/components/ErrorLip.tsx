import { X, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

interface Props {
    error: string;
    onClose: () => void;
}

export default function ErrorLip({ error, onClose }: Props) {
    const content = (
        <>
            {/* Mobile View */}
            <div className="fixed inset-x-0 bottom-0 z-20 sm:hidden">
                <div className="border border-holiday-text/20 border-b-0 rounded-t-[1.75rem] bg-holiday px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-[0_-16px_40px_rgba(185,28,28,0.15)]">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-holiday-text shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[1.15rem] font-semibold leading-tight text-holiday-text">
                                    Optimization failed
                                </p>
                                <p className="text-sm leading-snug text-holiday-text/90">
                                    {error}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close error message"
                            className="inline-flex items-center justify-center rounded-lg border border-holiday-text/30 bg-holiday-text/10 p-2 text-holiday-text transition-colors hover:bg-holiday-text/20 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="fixed inset-x-0 bottom-0 z-20 sm:inset-x-auto sm:left-1/2 hidden sm:block sm:bottom-4 sm:w-full sm:max-w-md sm:-translate-x-1/2">
                <div className="border border-holiday-text/20 border-b-0 rounded-t-2xl bg-holiday shadow-lg px-4 py-3 sm:border-b sm:rounded-2xl">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-2 min-w-0">
                            <AlertCircle className="w-5 h-5 text-holiday-text shrink-0" />
                            <div className="min-w-0 pt-0.5">
                                <p className="text-sm font-semibold text-holiday-text">
                                    Optimization failed
                                </p>
                                <p className="text-sm text-holiday-text/90 mt-0.5">
                                    {error}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close error message"
                            className="shrink-0 inline-flex items-center justify-center rounded-lg border border-holiday-text/30 bg-holiday-text/10 p-2 text-holiday-text transition-colors hover:bg-holiday-text/20 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    if (typeof document === "undefined") {
        return content;
    }

    return createPortal(content, document.body);
}
