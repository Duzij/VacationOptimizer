import { X } from "lucide-react";
import FeedbackForm, { type FeedbackDraft } from "./FeedbackForm";

interface Props {
    onClose: () => void;
    draft?: FeedbackDraft;
}

export default function FeedbackModal({ onClose, draft }: Props) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl p-6 space-y-5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text">{draft?.title ?? "Share feedback"}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <FeedbackForm draft={draft} />
            </div>
        </div>
    );
}
