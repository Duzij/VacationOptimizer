import { Settings, X } from "lucide-react";
import { createPortal } from "react-dom";
import { type ReactNode } from "react";
import Button from "./Button";
import useScrollDirection from "../hooks/useScrollDirection";

interface Props {
    isLoading?: boolean;
    formattedDate: string;
    dateTime?: string;
    label: string;
    detail?: string | null;
    sharedDetail?: string | null;
    actions?: ReactNode;
    onClose: () => void;
    onSettings?: () => void;
}

export default function DetailsLipDesktop({ isLoading = false, formattedDate, dateTime, label, detail, sharedDetail, actions, onClose, onSettings }: Props) {
    const visible = useScrollDirection(isLoading);

    const content = (
        <div className={`pointer-events-none fixed inset-x-4 bottom-6 z-20 hidden transition-transform duration-300 ease-in-out sm:block ${visible ? "translate-y-0" : "translate-y-[calc(100%+1.5rem)]"}`}>
            <div className="mx-auto flex w-full max-w-6xl justify-start">
                <div className="pointer-events-auto w-[min(22rem,100%)] border border-border rounded-2xl bg-background shadow-lg px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text">
                                {dateTime ? <time dateTime={dateTime}>{formattedDate}</time> : formattedDate}
                            </p>
                            <p className="text-sm text-text-muted">
                                {label}
                                {detail ? ` · ${detail}` : ""}
                            </p>
                            {sharedDetail && (
                                <p className="text-xs text-text-muted mt-0.5">
                                    {sharedDetail}
                                </p>
                            )}
                            {actions && (
                                <div className="mt-2">
                                    {actions}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {onSettings && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onSettings}
                                    aria-label="Day settings"
                                >
                                    <Settings className="h-4 w-4" />
                                </Button>
                            )}
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
            </div>
        </div>
    );

    if (typeof document === "undefined") {
        return content;
    }

    return createPortal(content, document.body);
}
