import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OptimizerForm from "./components/OptimizerForm";
import CalendarView from "./components/CalendarView";
import ResultsSummary from "./components/ResultsSummary";
import Legend from "./components/Legend";
import { useOptimize } from "./api/vacationApi";
import type { OptimizeRequest, OptimizeResult } from "./types/models";
import { Sparkles, Sun, Moon, X, Send, Loader2 } from "lucide-react";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
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
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface shadow-xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

function Main() {
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [activeRequest, setActiveRequest] = useState<OptimizeRequest | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const optimize = useOptimize();

  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Close modal on Escape
  useEffect(() => {
    if (!showFeedback) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFeedback(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showFeedback]);

  const handleOptimize = (req: OptimizeRequest) => {
    setActiveRequest(req);
    optimize.mutate(req, {
      onSuccess: (data) => setResult(data),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          <h1 className="text-base font-bold bg-gradient-to-r bg-clip-text">
            Vakie Takie
          </h1>
          <Sparkles className="w-5 h-5 text-primary" />
          <button
            onClick={() => setIsDark((prev) => !prev)}
            className="ml-auto p-2 rounded-full border border-border bg-surface hover:bg-surface-hover transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 space-y-8">
        <OptimizerForm onResult={handleOptimize} isLoading={optimize.isPending} />

        {optimize.isError && (
          <div className="max-w-md mx-auto text-center text-sm text-holiday-text bg-holiday/30 rounded-lg px-4 py-3">
            {optimize.error.message}
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ResultsSummary result={result} />
            <Legend />
            <CalendarView
              calendar={result.calendar}
              year={activeRequest?.year ?? new Date().getFullYear()}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 px-4 flex items-center justify-center">
        <span className="text-[11px] text-text-muted/50">
          Vacation Optimizer · {new Date().getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => setShowFeedback(true)}
          className="ml-auto text-[11px] text-text-muted/50 hover:text-text-muted transition-colors cursor-pointer underline-offset-2 hover:underline"
        >
          Share feedback
        </button>
      </footer>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}