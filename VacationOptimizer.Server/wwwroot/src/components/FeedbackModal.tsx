import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";

interface Props {
    onClose: () => void;
}

export default function FeedbackModal({ onClose }: Props) {
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("sending");
        const form = e.currentTarget;
        const data = new FormData(form);
        try {
            const res = await fetch("https://formspree.io/f/xvzblown", {
                method: "POST",
                body: data,
                headers: { Accept: "application/json" },
            });
            if (res.ok) {
                setStatus("sent");
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

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
                    <h2 className="text-base font-semibold text-text">Share feedback</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {status === "sent" ? (
                    <div className="py-8 text-center space-y-2">
                        <p className="text-sm font-medium text-text">Thanks for your feedback!</p>
                        <p className="text-xs text-text-muted">We'll read every message.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-text-muted">
                                Your email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text
                           placeholder:text-text-muted/50
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="message" className="text-sm font-medium text-text-muted">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={4}
                                placeholder="What's on your mind?"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text
                           placeholder:text-text-muted/50 resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           transition-all"
                            />
                        </div>

                        {status === "error" && (
                            <p className="text-xs text-holiday-text bg-holiday/20 rounded-lg px-3 py-2">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === "sending"}
                            className="optimize-btn w-full flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "sending" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {status === "sending" ? "Sending..." : "Send feedback"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
