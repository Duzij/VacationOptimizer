import { useEffect, useState } from "react";
import { Menu, Moon, Sun, TreePalm, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleRow from "./ThemeToggleRow";
import siteShellData from "../site-shell-data.json";

const navLinks = siteShellData.navLinks;

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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "site-nav-pill--active" : "";

  return (
    <header
      className={`site-header-shell bg-background ${
        isMobileMenuOpen
          ? "border-b-0 md:border-b md:border-border"
          : "border-b border-border"
      }`}
    >
      <div className="site-header-shell__inner w-full max-w-6xl">
        <div className="site-header__row">
          <Link to="/" className="site-brand">
            <TreePalm className="site-brand__mark text-primary" />
            <h1 className="site-brand__label bg-gradient-to-r bg-clip-text">
              Vacation Optimizer
            </h1>
          </Link>

          {/* Desktop nav — hidden below md */}
          <nav className="site-nav-shell site-nav-shell--desktop">
            {navLinks.map((link) => (
              link.isDocument ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={`site-nav-pill ${location.pathname.startsWith("/blog") ? "site-nav-pill--active" : ""}`}
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === "/" || link.href === "/app"}
                  className={({ isActive }) => `site-nav-pill ${navLinkClass({ isActive })}`}
                >
                  {link.label}
                </NavLink>
              )
            ))}
          </nav>

          {/* Desktop theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="site-theme-toggle site-theme-toggle--desktop"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun />
            ) : (
              <Moon />
            )}
          </button>

          {/* Mobile hamburger — visible below md */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="site-hamburger"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile nav panel — only rendered when open, hidden at md+ */}
        {isMobileMenuOpen && (
          <div
            id="mobile-site-menu"
            className="mx-[-1rem] mt-3 grid gap-2 border-b border-border bg-background/95 px-4 pb-3 pt-3 md:hidden"
          >
            {navLinks.map((link) => (
              link.isDocument ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={`site-nav-pill site-nav-pill--mobile ${location.pathname.startsWith("/blog") ? "site-nav-pill--active" : ""}`}
                >
                  <span>{link.label}</span>
                </a>
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === "/" || link.href === "/app"}
                  className={({ isActive }) => `site-nav-pill site-nav-pill--mobile ${navLinkClass({ isActive })}`}
                >
                  <span>{link.label}</span>
                </NavLink>
              )
            ))}

            <ThemeToggleRow isDark={isDark} onToggleTheme={onToggleTheme} />
          </div>
        )}
      </div>
    </header>
  );
}
