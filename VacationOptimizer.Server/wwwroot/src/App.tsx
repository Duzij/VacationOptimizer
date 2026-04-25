import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import DetailsLip from "./components/DetailsLip";
import ResultsSummary from "./components/ResultsSummary";
import Legend from "./components/Legend";
import FeedbackModal from "./components/FeedbackModal";
import ConfirmCustomDayModal from "./components/ConfirmCustomDayModal";
import AppHeader from "./components/AppHeader";
import {
  AboutPage,
  ContactPage,
  HomePage,
  NotFoundPage,
  PrivacyPage,
  PublicFooter,
  RouteMeta,
  TermsPage,
} from "./components/PublicPages";
import OptimizerForm from "./components/OptimizerForm";
import CalendarView from "./components/CalendarView";
import { getDefaultYear } from "./optimizerDefaults";
import { useTheme } from "./hooks/useTheme";
import { useOptimizationSession } from "./hooks/useOptimizationSession";
import { useCalendarInteractions } from "./hooks/useCalendarInteractions";
import { useDetectedCountry } from "./api/vacationApi";
import { DayType } from "./types/models";
import type { CalendarDay, OptimizeRequest } from "./types/models";
import type { DayLipDetails } from "./components/DetailsLip";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Main />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function Main() {
  const { isDark, setIsDark } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />

      <main className="flex-1 px-4 py-8 space-y-8">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <RouteMeta
                  title="Vacation Optimizer | Plan PTO Around Public Holidays"
                  description="Learn how Vacation Optimizer helps employees turn limited PTO into longer breaks. Explore planning guidance, examples, FAQs, and the interactive planner."
                  canonicalPath="/"
                />
                <HomePage />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <RouteMeta
                  title="About Vacation Optimizer"
                  description="Learn what Vacation Optimizer is, who it helps, and how it combines public guidance with an interactive PTO planning tool."
                  canonicalPath="/about"
                />
                <AboutPage />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <RouteMeta
                  title="Contact Vacation Optimizer"
                  description="Use the same feedback channel as the planner to report product issues, data corrections, accessibility concerns, or feature requests."
                  canonicalPath="/contact"
                />
                <ContactPage />
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <RouteMeta
                  title="Privacy Policy | Vacation Optimizer"
                  description="Read the Vacation Optimizer privacy overview and understand the expectations around data minimization, consent, and deployment accuracy."
                  canonicalPath="/privacy"
                />
                <PrivacyPage />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <RouteMeta
                  title="Terms of Use | Vacation Optimizer"
                  description="Read the Vacation Optimizer terms overview, including informational use, holiday data limitations, and user responsibility."
                  canonicalPath="/terms"
                />
                <TermsPage />
              </>
            }
          />
          <Route path="/app" element={<PlannerPage />} />
          <Route
            path="*"
            element={
              <>
                <RouteMeta
                  title="Page Not Found | Vacation Optimizer"
                  description="The page could not be found."
                  canonicalPath="/"
                />
                <NotFoundPage />
              </>
            }
          />
        </Routes>
      </main>

      <PublicFooter />
    </div>
  );
}

function PlannerPage() {

  const currentYear = getDefaultYear();
  const { data: detectedCountry, isLoading: detectedCountryLoading } = useDetectedCountry();
  const [shouldScrollResults, setShouldScrollResults] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<DayLipDetails | null>(null);

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
    shuffleOptimization,
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

  const handleRunOptimization = useCallback((req: OptimizeRequest) => {
    setShouldScrollResults(true);
    setSelectedDayDetails(null);
    runOptimization(req);
  }, [runOptimization]);

  const handleShuffleOptimization = useCallback(() => {
    setShouldScrollResults(false);
    setSelectedDayDetails(null);
    void shuffleOptimization();
  }, [shuffleOptimization]);

  const handleDaySelect = useCallback((day: CalendarDay) => {
    setSelectedDayDetails(getDayLipDetails(day));
  }, []);

  return (
    <>
      <RouteMeta
        title="Vacation Planner | Vacation Optimizer"
        description="Use the Vacation Optimizer planner to compare PTO scenarios around public holidays, weekends, and custom free days."
        canonicalPath="/app"
      />

      <section id="planner" className="scroll-mt-24">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-text sm:text-4xl">Vacation planner</h1>
            <p className="max-w-3xl text-sm leading-6 text-text-muted">
              Enter your country and PTO rules, then generate suggested vacation ranges. Results are meant to support planning,
              not replace checking your employer policy, local holiday changes, or team availability.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] xl:items-start">
            <OptimizerForm
              onResult={handleRunOptimization}
              isLoading={isUserOptimizing || detectedCountryLoading}
              detectedCountry={detectedCountry}
              customFreeDays={customFreeDays}
              onCustomFreeDaysChange={setCustomFreeDays}
              initialRequest={initialRequest}
            />

            <details className="content-panel group xl:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-text">
                <span>How to use the planner well</span>
                <span className="text-sm font-medium text-text-muted group-open:hidden">Show</span>
                <span className="hidden text-sm font-medium text-text-muted group-open:inline">Hide</span>
              </summary>
              <div className="mt-4 space-y-4">
                <div className="space-y-3 text-sm leading-6 text-text-muted">
                  <p>Start with holiday clusters, decide whether you want one long break or several smaller ones, then add local context such as office closures or school schedules.</p>
                  <p>Use the planner to compare real date combinations instead of guessing, then verify the best option against approvals, cost, team coverage, and travel constraints.</p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <h3 className="text-base font-semibold text-text">Need help or spotted something off?</h3>
                  <p className="text-sm leading-6 text-text-muted">
                    Share feedback if you notice incorrect holiday data, confusing behavior, or a missing planning detail we should support.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedbackDraft({
                      title: "Share feedback",
                      message: "",
                    })}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover cursor-pointer"
                  >
                    Share feedback
                  </button>
                </div>
              </div>
            </details>

            <aside className="content-panel hidden space-y-5 xl:block">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-text">How to use the planner well</h2>
                <div className="space-y-3 text-sm leading-6 text-text-muted">
                  <p>Start with holiday clusters, decide whether you want one long break or several smaller ones, then add local context such as office closures or school schedules.</p>
                  <p>Use the planner to compare real date combinations instead of guessing, then verify the best option against approvals, cost, team coverage, and travel constraints.</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-5">
                <h3 className="text-base font-semibold text-text">Need help or spotted something off?</h3>
                <p className="text-sm leading-6 text-text-muted">
                  Share feedback if you notice incorrect holiday data, confusing behavior, or a missing planning detail we should support.
                </p>
                <button
                  type="button"
                  onClick={() => setFeedbackDraft({
                    title: "Share feedback",
                    message: "",
                  })}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover cursor-pointer"
                >
                  Share feedback
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {optimize.isError && (
        <div className="max-w-md mx-auto text-center text-sm text-holiday-text bg-holiday/30 rounded-lg px-4 py-3">
          {optimize.error.message}
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <ResultsSummary result={result} shouldScroll={shouldScrollResults} />
          <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Legend />
            <button
              id="shuffle-optimization-desktop"
              type="button"
              disabled={isUserOptimizing}
              onClick={handleShuffleOptimization}
              className="action-btn action-btn-secondary hidden sm:inline-flex"
              title="Shuffle — generate a different optimization with the same settings"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>

          <CalendarView
            calendar={result.calendar.days}
            year={activeRequest?.year ?? currentYear}
            country={activeRequest?.country}
            onDayLongPress={handleDayLongPress}
            onDaySelect={handleDaySelect}
            locale={detectedCountry?.countryCode}
          />
        </div>
      )}

      {result && (
        <DetailsLip
          isLoading={isUserOptimizing}
          onShuffle={handleShuffleOptimization}
          dayDetails={selectedDayDetails}
        />
      )}

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
    </>
  );
}

function getDayLipDetails(day: CalendarDay): DayLipDetails {
  return {
    formattedDate: parseCalendarDate(day.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    label: getDayLabel(day),
    detail: getDayDetail(day),
  };
}

function parseCalendarDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getDayLabel(day: CalendarDay): string {
  switch (day.type) {
    case DayType.Vacation:
      return "Vacation day";
    case DayType.CustomFreeDay:
      return "Custom free day";
    case DayType.PublicHoliday:
      return "Public holiday";
    case DayType.Weekend:
      return "Weekend";
    case DayType.PassedDay:
      return "Past day";
    case DayType.Today:
      return "Today";
    case DayType.WorkDay:
    default:
      return "Work day";
  }
}

function getDayDetail(day: CalendarDay): string | null {
  if (day.type === DayType.CustomFreeDay && (!day.holidayName || day.holidayName.startsWith("Custom free day"))) {
    return null;
  }

  if (day.holidayName) {
    return day.holidayName;
  }

  if (day.type === DayType.Today) {
    return "Current day";
  }

  return null;
}
