import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import { MAX_SHUFFLE_HISTORY } from "../hooks/useOptimizationSession";

interface Props {
    onClose: () => void;
}

export default function ShuffleLimitModal({ onClose }: Props) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text">
                        Shuffle limit reached
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-text-muted leading-6">
                    You've explored all available variations for these settings. Shuffle cannot generate a new result anymore, so change your vacation days, range limits, locked days, or custom free days to find different options.
                </p>

                <div className="flex justify-end pt-2">
                    <Button type="button" onClick={onClose} variant="primary" className="w-full sm:w-auto">
                        Got it
                    </Button>
                </div>
            </div>
        </div>
    );
}
