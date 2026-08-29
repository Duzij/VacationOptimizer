import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import Button from "./Button";
import posthog from "../posthog";

export interface FeedbackDraft {
  title: string;
  description?: string;
  message: string;
  submitLabel?: string;
}

interface FeedbackFormProps {
  draft?: FeedbackDraft;
  onSuccess?: () => void;
  successMessage?: string;
}

export default function FeedbackForm({
  draft,
  onSuccess,
  successMessage = "We'll read every message.",
}: FeedbackFormProps) {
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
        posthog.capture("feedback_submitted");
        setStatus("sent");
        form.reset();
        onSuccess?.();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="py-8 text-center space-y-2">
        <p className="text-sm font-medium text-text">Thanks for your feedback!</p>
        <p className="text-xs text-text-muted">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {draft?.description && (
        <p className="text-sm text-text-muted bg-surface-hover rounded-lg px-3 py-2.5">
          {draft.description}
        </p>
      )}

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
          defaultValue={draft?.message}
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

      <Button
        type="submit"
        disabled={status === "sending"}
        fullWidth
      >
        {status === "sending" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {status === "sending" ? "Sending..." : draft?.submitLabel ?? "Send feedback"}
      </Button>
    </form>
  );
}
