import { Moon, Sun } from "lucide-react";

interface ThemeToggleRowProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function ThemeToggleRow({ isDark, onToggleTheme }: ThemeToggleRowProps) {
  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:border-border hover:bg-surface-hover hover:text-text cursor-pointer"
    >
      <span>Theme</span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
          isDark
            ? "border-border bg-primary/90"
            : "border-border bg-surface"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute inline-flex h-5 w-5 items-center justify-center rounded-full bg-background text-primary shadow-sm transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0.5"
          }`}
        >
          {isDark ? (
            <Sun className="h-3 w-3" />
          ) : (
            <Moon className="h-3 w-3" />
          )}
        </span>
      </span>
    </button>
  );
}
