import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OptimizerForm from "./components/OptimizerForm";
import CalendarView from "./components/CalendarView";
import ResultsSummary from "./components/ResultsSummary";
import Legend from "./components/Legend";
import FeedbackModal from "./components/FeedbackModal";
import ConfirmCustomDayModal from "./components/ConfirmCustomDayModal";
import { getDefaultYear } from "./optimizerDefaults";
import { useTheme } from "./hooks/useTheme";
import { useOptimizationSession } from "./hooks/useOptimizationSession";
import { useCalendarInteractions } from "./hooks/useCalendarInteractions";
import { normalizeCanonicalAppPath } from "./utils/optimizationPersistence";
import { Sun, Moon, TreePalm } from "lucide-react";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
}

function Main() {
  normalizeCanonicalAppPath();

  const currentYear = getDefaultYear();
  const { isDark, setIsDark } = useTheme();
  const {
    initialRequest,
    result,
    activeRequest,
    optimize,
    customFreeDays,
    setCustomFreeDays,
    ignoredHolidayDates,
    setIgnoredHolidayDates,
    isUserOptimizing,
    runOptimization,
  } = useOptimizationSession();
  const {
    feedbackDraft,
    setFeedbackDraft,
    confirmDay,
    setConfirmDay,
    handleDayLongPress,
    handleConfirmCustomDay,
    handleIgnoreHoliday,
  } = useCalendarInteractions({
    activeRequest,
    result,
    ignoredHolidayDates,
    setIgnoredHolidayDates,
    customFreeDays,
    setCustomFreeDays,
    runOptimization,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          <h1 className="text-base font-bold bg-gradient-to-r bg-clip-text">
            Vacation Optimizer
          </h1>
          <TreePalm className="w-5 h-5 text-primary" />
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
          onResult={runOptimization}
          isLoading={isUserOptimizing}
          customFreeDays={customFreeDays}
          onCustomFreeDaysChange={setCustomFreeDays}
          initialRequest={initialRequest}
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
              year={activeRequest?.year ?? currentYear}
              country={activeRequest?.country}
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
          onClick={() => setFeedbackDraft({
            title: "Share feedback",
            message: "",
          })}
          className="ml-auto text-[11px] text-text-muted/50 hover:text-text-muted transition-colors cursor-pointer underline-offset-2 hover:underline"
        >
          Share feedback
        </button>
      </footer>

      {feedbackDraft && <FeedbackModal onClose={() => setFeedbackDraft(null)} draft={feedbackDraft} />}
      {confirmDay && (
        <ConfirmCustomDayModal
          date={confirmDay.date}
          mode={confirmDay.mode}
          holidayName={confirmDay.holidayName}
          onConfirm={handleConfirmCustomDay}
          onIgnoreHoliday={confirmDay.mode === "reportHoliday" ? handleIgnoreHoliday : undefined}
          onCancel={() => setConfirmDay(null)}
        />
      )}
    </div>
  );
}
