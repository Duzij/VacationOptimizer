import { useEffect, useState } from "react";
import { Menu, Moon, Sun, TreePalm, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleRow from "./ThemeToggleRow";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      isActive
        ? "border-border bg-surface text-text"
        : "border-transparent text-text-muted hover:border-border hover:bg-surface-hover hover:text-text"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "border-border bg-surface text-text"
        : "border-transparent text-text-muted hover:border-border hover:bg-surface-hover hover:text-text"
    }`;

  return (
    <header
      className={`sticky top-0 z-60 bg-background ${
        isMobileMenuOpen
          ? "border-b-0 md:border-b md:border-border"
          : "border-b border-border"
      }`}
    >
      <div className={"w-full max-w-6xl mx-auto px-4 " + (isMobileMenuOpen ? "pt-4" : "py-4")}>
        <div className="flex items-center gap-3">
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
                className={desktopNavLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            className="ml-auto hidden md:flex p-2 rounded-full border border-border bg-surface hover:bg-surface-hover transition-colors items-center justify-center cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="ml-auto inline-flex md:hidden items-center justify-center rounded-full bg-background p-2 text-text transition-colors hover:bg-surface-hover"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div
            id="mobile-site-menu"
            className="mx-[-1rem] mt-3 grid gap-2 border-b border-border bg-background/95 px-4 pb-3 pt-3 md:hidden"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/" || link.to === "/app"}
                className={mobileNavLinkClass}
              >
                <span>{link.label}</span>
              </NavLink>
            ))}

            <ThemeToggleRow isDark={isDark} onToggleTheme={onToggleTheme} />
          </div>
        )}
      </div>
    </header>
  );
}
