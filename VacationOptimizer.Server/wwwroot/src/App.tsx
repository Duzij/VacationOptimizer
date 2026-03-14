import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OptimizerForm from "./components/OptimizerForm";
import CalendarView from "./components/CalendarView";
import ResultsSummary from "./components/ResultsSummary";
import Legend from "./components/Legend";
import FeedbackModal from "./components/FeedbackModal";
import ConfirmCustomDayModal from "./components/ConfirmCustomDayModal";
import { useOptimize } from "./api/vacationApi";
import { DayType, type CalendarDay, type CustomFreeDay, type OptimizeRequest, type OptimizeResult } from "./types/models";
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
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [activeRequest, setActiveRequest] = useState<OptimizeRequest | null>(null);
  const [ignoredHolidayDates, setIgnoredHolidayDates] = useState<string[]>([]);
  const [feedbackDraft, setFeedbackDraft] = useState<{
    title: string;
    description?: string;
    message: string;
    submitLabel?: string;
  } | null>(null);
  const [customFreeDays, setCustomFreeDays] = useState<CustomFreeDay[]>([]);
  const [confirmDay, setConfirmDay] = useState<{ date: string; mode: "add" | "remove" | "reportHoliday"; holidayName?: string | null } | null>(null);
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
    if (!feedbackDraft) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFeedbackDraft(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [feedbackDraft]);

  const withIgnoredHolidayDates = (req: OptimizeRequest, nextIgnoredHolidayDates = ignoredHolidayDates): OptimizeRequest => ({
    ...req,
    ignoredHolidayDates: nextIgnoredHolidayDates.length > 0 ? nextIgnoredHolidayDates : undefined,
  });

  const hasSameHolidayScope = (left: OptimizeRequest | null, right: OptimizeRequest) =>
    left?.country === right.country &&
    left?.year === right.year &&
    (left?.state ?? "") === (right.state ?? "");

  const handleOptimize = (req: OptimizeRequest, overrideIgnoredHolidayDates?: string[]) => {
    const nextIgnoredHolidayDates = hasSameHolidayScope(activeRequest, req) ? ignoredHolidayDates : [];
    const effectiveIgnoredHolidayDates = overrideIgnoredHolidayDates ?? nextIgnoredHolidayDates;

    if (!hasSameHolidayScope(activeRequest, req) && ignoredHolidayDates.length > 0 && !overrideIgnoredHolidayDates) {
      setIgnoredHolidayDates([]);
    }

    const requestWithIgnoredDates = withIgnoredHolidayDates(req, effectiveIgnoredHolidayDates);
    setActiveRequest(requestWithIgnoredDates);
    optimize.mutate(requestWithIgnoredDates, {
      onSuccess: (data) => setResult(data),
    });
  };

  const formatReportDate = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const openHolidayReport = (day: CalendarDay, isIgnoredInApp = ignoredHolidayDates.includes(day.date)) => {
    const country = activeRequest?.country ?? "unknown";
    const state = activeRequest?.state ?? "national";
    setFeedbackDraft({
      title: "Report public holiday",
      description: "Send a report if this holiday looks incorrect and should be removed from the calendar.",
      submitLabel: "Send report",
      message: [
        "Issue type: Public holiday removal request",
        `Ignored in app: ${isIgnoredInApp ? "yes" : "no"}`,
        `Country: ${country}`,
        `State: ${state}`,
        `Date: ${formatReportDate(day.date)} (${day.date})`,
        `Holiday name: ${day.holidayName ?? "Unknown"}`,
        "",
        "Why this holiday should be removed:",
      ].join("\n"),
    });
  };

  const handleDayLongPress = (day: CalendarDay) => {
    if (day.type === DayType.PassedDay) {
      return;
    }

    if (day.type === DayType.PublicHoliday) {
      setConfirmDay({ date: day.date, mode: "reportHoliday", holidayName: day.holidayName });
      return;
    }

    const isExisting = customFreeDays.some((d) => d.date === day.date);
    setConfirmDay({ date: day.date, mode: isExisting ? "remove" : "add" });
  };

  const handleConfirmCustomDay = () => {
    if (!confirmDay || !activeRequest) {
      return;
    }

    if (confirmDay.mode === "reportHoliday") {
      const holidayDay = result?.calendar.find((day) => day.date === confirmDay.date);
      if (holidayDay) {
        openHolidayReport(holidayDay, ignoredHolidayDates.includes(confirmDay.date));
      }
      setConfirmDay(null);
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

  const handleIgnoreAndReportHoliday = () => {
    if (!confirmDay || !activeRequest || confirmDay.mode !== "reportHoliday") {
      return;
    }

    const holidayDay = result?.calendar.find((day) => day.date === confirmDay.date);
    if (!holidayDay) {
      setConfirmDay(null);
      return;
    }

    const updatedIgnoredHolidayDates = ignoredHolidayDates.includes(confirmDay.date)
      ? ignoredHolidayDates
      : [...ignoredHolidayDates, confirmDay.date];

    setIgnoredHolidayDates(updatedIgnoredHolidayDates);
    openHolidayReport(holidayDay, true);
    setConfirmDay(null);
    handleOptimize(activeRequest, updatedIgnoredHolidayDates);
  };

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
          onIgnoreAndReport={confirmDay.mode === "reportHoliday" ? handleIgnoreAndReportHoliday : undefined}
          onCancel={() => setConfirmDay(null)}
        />
      )}
    </div>
  );
}
