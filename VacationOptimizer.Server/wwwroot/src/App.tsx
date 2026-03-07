import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OptimizerForm from "./components/OptimizerForm";
import CalendarView from "./components/CalendarView";
import ResultsSummary from "./components/ResultsSummary";
import Legend from "./components/Legend";
import FeedbackModal from "./components/FeedbackModal";
import ConfirmCustomDayModal from "./components/ConfirmCustomDayModal";
import { useOptimize } from "./api/vacationApi";
import type { CustomFreeDay, OptimizeRequest, OptimizeResult } from "./types/models";
import { Sparkles, Sun, Moon } from "lucide-react";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
}

function Main() {
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [activeRequest, setActiveRequest] = useState<OptimizeRequest | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [customFreeDays, setCustomFreeDays] = useState<CustomFreeDay[]>([]);
  const [confirmDay, setConfirmDay] = useState<{ date: string; mode: "add" | "remove" } | null>(null);
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

  const handleDayLongPress = (date: string) => {
    const isExisting = customFreeDays.some((d) => d.date === date);
    setConfirmDay({ date, mode: isExisting ? "remove" : "add" });
  };

  const handleConfirmCustomDay = () => {
    if (!confirmDay || !activeRequest) {

      return;
    }
    const updatedDays = confirmDay.mode === "remove"
      ? customFreeDays.filter((d) => d.date !== confirmDay.date)
      : [...customFreeDays, { date: confirmDay.date }];
    setCustomFreeDays(updatedDays);
    setConfirmDay(null);
    // Re-trigger optimization with the updated custom free days
    const updatedRequest: OptimizeRequest = {
      ...activeRequest,
      customFreeDays: updatedDays.length > 0 ? updatedDays : undefined,
    };
    handleOptimize(updatedRequest);
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
        <OptimizerForm
          onResult={handleOptimize}
          isLoading={optimize.isPending}
          customFreeDays={customFreeDays}
          onCustomFreeDaysChange={setCustomFreeDays}
        />

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
              onDayLongPress={handleDayLongPress}
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
      {confirmDay && (
        <ConfirmCustomDayModal
          date={confirmDay.date}
          mode={confirmDay.mode}
          onConfirm={handleConfirmCustomDay}
          onCancel={() => setConfirmDay(null)}
        />
      )}
    </div>
  );
}