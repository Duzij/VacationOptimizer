import { Moon, Sun, TreePalm } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { to: "/app", label: "Planner" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/about", label: "About" },
];

interface AppHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function AppHeader({ isDark, onToggleTheme }: AppHeaderProps) {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive
        ? "border-border bg-surface text-text"
        : "border-transparent text-text-muted hover:border-border hover:bg-surface-hover hover:text-text"
    }`;

  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="w-full max-w-6xl mx-auto px-4 lg:px-0 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <TreePalm className="w-5 h-5 text-primary" />
          <h1 className="text-base font-bold bg-gradient-to-r bg-clip-text">
            Vacation Optimizer
          </h1>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/" || link.to === "/app"}
              className={navLinkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={onToggleTheme}
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
  );
}
