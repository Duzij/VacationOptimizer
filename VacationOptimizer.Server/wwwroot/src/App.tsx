import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OptimizerForm from "./components/OptimizerForm";
import CalendarView from "./components/CalendarView";
import ResultsSummary from "./components/ResultsSummary";
import Legend from "./components/Legend";
import { useOptimize } from "./api/vacationApi";
import type { OptimizeRequest, OptimizeResult } from "./types/models";
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
  const [activeRequest, setActiveRequest] = useState<OptimizeRequest | null>(
    null,
  );
  const optimize = useOptimize();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Set theme class on mount and when isDark changes
  // This ensures React state and DOM are in sync
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

  const handleOptimize = (req: OptimizeRequest) => {
    setActiveRequest(req);
    optimize.mutate(req, {
      onSuccess: (data) => setResult(data),
    });
  };

  function toggleDarkMode() {
    setIsDark((prev) => !prev);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          <h1 className="text-base font-bold bg-gradient-to-r bg-clip-text">
            Vakie Takie 
          </h1>
          <Sparkles className="w-5 h-5 text-primary" />
          <button
            onClick={toggleDarkMode}
            className="ml-auto p-2 rounded-full border border-border bg-surface hover:bg-surface-hover transition-colors flex items-center justify-center"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8 space-y-8">
        {/* Form */}
        <OptimizerForm
          onResult={handleOptimize}
          isLoading={optimize.isPending}
        />

        {/* Error */}
        {optimize.isError && (
          <div className="max-w-md mx-auto text-center text-sm text-holiday-text bg-holiday/30 rounded-lg px-4 py-3">
            {optimize.error.message}
          </div>
        )}

        {/* Results */}
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

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-[11px] text-text-muted/50">
        Vacation Optimizer · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
