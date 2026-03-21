import { X } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "./Button";

interface Props {
    formattedDate: string;
    label: string;
    detail?: string | null;
    onClose: () => void;
}

export default function LegendLip({ formattedDate, label, detail, onClose }: Props) {
    const content = (
        <div className="fixed inset-x-0 bottom-0 z-20 sm:inset-x-auto sm:left-1/2 sm:bottom-4 sm:w-full sm:max-w-md sm:-translate-x-1/2">
            <div className="border border-border border-b-0 rounded-t-2xl bg-surface shadow-lg px-4 py-3 sm:border-b sm:rounded-2xl">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-text">
                            {formattedDate}
                        </p>
                        <p className="text-sm text-text-muted">
                            {label}
                            {detail ? ` · ${detail}` : ""}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        aria-label="Close day details"
                    >
                        <X className="h-4 w-4" />
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
