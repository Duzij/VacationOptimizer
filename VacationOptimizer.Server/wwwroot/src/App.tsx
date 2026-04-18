import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
              onResult={runOptimization}
              isLoading={isUserOptimizing || detectedCountryLoading}
              detectedCountry={detectedCountry}
              customFreeDays={customFreeDays}
              onCustomFreeDaysChange={setCustomFreeDays}
              initialRequest={initialRequest}
            />

            <aside className="content-panel space-y-5">
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
          <ResultsSummary result={result} />
          <Legend />
          <CalendarView
            calendar={result.calendar}
            year={activeRequest?.year ?? currentYear}
            country={activeRequest?.country}
            onDayLongPress={handleDayLongPress}
            locale={detectedCountry?.countryCode}
          />
        </div>
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
