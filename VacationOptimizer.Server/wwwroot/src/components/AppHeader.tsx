import { useEffect, useState } from "react";
import { Menu, Moon, Sun, TreePalm, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
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

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `site-nav-pill ${isActive ? "site-nav-pill--active" : ""}`;

  return (
    <>
      {isMobileMenuOpen && (
        <button
          type="button"
          className="site-menu-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <header
        className={`site-header-shell ${isMobileMenuOpen ? "site-header-shell--menu-open" : ""}`}
      >
        <div className="site-header-shell__inner">
          <div className="site-header__row">
            <Link to="/" className="site-brand" aria-label="Long Vacation home">
              <TreePalm className="site-brand__mark" aria-hidden="true" />
              <span className="site-brand__label">Long Vacation</span>
            </Link>

            <nav className="site-nav-shell site-nav-shell--desktop" aria-label="Main navigation">
              {navLinks.map((link) => (
                link.isDocument ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`site-nav-pill ${location.pathname.startsWith("/blog") ? "site-nav-pill--active" : ""}`}
                    aria-current={location.pathname.startsWith("/blog") ? "page" : undefined}
                  >
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    end={link.href === "/" || link.href === "/app"}
                    className={navLinkClass}
                  >
                    {link.label}
                  </NavLink>
                )
              ))}
            </nav>

            <div className="site-header__actions">
              <button
                type="button"
                onClick={onToggleTheme}
                className="site-theme-toggle"
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                title={isDark ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="site-hamburger"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-site-menu"
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </button>
            </div>

            <nav
              id="mobile-site-menu"
              className="site-mobile-menu"
              aria-label="Main navigation"
              aria-hidden={!isMobileMenuOpen}
            >
              {navLinks.map((link) => (
                link.isDocument ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`site-nav-pill site-nav-pill--mobile ${location.pathname.startsWith("/blog") ? "site-nav-pill--active" : ""}`}
                    aria-current={location.pathname.startsWith("/blog") ? "page" : undefined}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    end={link.href === "/" || link.href === "/app"}
                    className={({ isActive }) => `site-nav-pill site-nav-pill--mobile ${isActive ? "site-nav-pill--active" : ""}`}
                    tabIndex={isMobileMenuOpen ? 0 : -1}
                  >
                    {link.label}
                  </NavLink>
                )
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
