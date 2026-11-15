import { CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import CountryShowcase from "./CountryShowcase";
import HtmlFragment from "./HtmlFragment";
import landingBoxesHtml from "../content/landing-boxes.html?raw";
import landingSeoHtml from "../content/landing-seo.html?raw";

const popularGuides = [
  { href: "/blog/maximize-your-vacation-in-the-us-in-2027/", label: "US federal holidays and PTO planner 2027" },
  { href: "/blog/maximize-your-annual-leave-in-the-uk-in-2027/", label: "UK bank holidays and annual leave 2027" },
  { href: "/blog/germany-holiday-planner/", label: "Germany state-specific holiday planner" },
  { href: "/blog/canada-holiday-planner/", label: "Canada province-specific holiday planner" },
  { href: "/blog/maximize-your-pto-in-spain-in-2027/", label: "Spain 2027 holidays and bridge days" },
  { href: "/blog/maximize-your-pto-in-the-netherlands-in-2027/", label: "Netherlands 2027 PTO guide" },
  { href: "/blog/how-to-maximize-your-holidays-in-australia-in-2027/", label: "Australia 2027 holiday guide" },
  { href: "/blog/indonesia-public-holidays-and-collective-leave/", label: "Indonesia public holidays and cuti bersama" },
];

export default function LandingContent() {
  return (
    <>
      <div className="landing-page">
        <section className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] bg-surface/55">
            <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <div className="py-4 md:py-10">
                <div className="space-y-6">
                  <div className="max-w-2xl space-y-4">
                    <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-text md:text-7xl">
                      The holiday optimizer that turns
                      <br />
                      <span className="text-[var(--landing-accent)] italic">
                        vacation days into longer breaks.
                      </span>
                    </h1>
                    <h2 className="max-w-xl text-base leading-7 text-text-muted md:text-lg">
                      Long Vacation is a free holiday optimizer, PTO planner, and
                      time off planner that turns scattered public holidays and
                      weekends into longer breaks.
                    </h2>
                  </div>

                  <div className="flex flex-nowrap gap-2">
                    <Link
                      to="/app"
                      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--landing-accent)_18%,var(--color-border))] bg-[color-mix(in_srgb,var(--landing-accent)_88%,black)] px-3 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,123,131,0.18)] sm:px-6"
                    >
                      Start planning
                      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                    </Link>

                    <Link
                      to="/about"
                      className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border bg-background px-3 py-3 text-sm font-medium text-text sm:px-6"
                    >
                      <span className="sm:hidden">How it works</span>
                      <span className="hidden sm:inline">How the vacation optimizer works</span>
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="border-border bg-background/65 py-4 md:py-8">
                <CountryShowcase />
              </aside>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="landing-section"
          aria-labelledby="features-title"
        >
          <div className="section-head">
            <p className="section-head__eyebrow">
              Why Long Vacation - Vacation Optimizer
            </p>
          </div>
          <div className="features-grid">
            <HtmlFragment
              html={landingBoxesHtml}
              className="features-grid-inner"
            />
          </div>
        </section>

        <section
          id="how-it-works"
          className="landing-section"
          aria-labelledby="how-it-works-title"
        >
          <div className="section-head">
            <p className="section-head__eyebrow">How it works</p>
            <h2 id="how-it-works-title" className="section-head__title">
              From scattered holidays to a ready-to-request plan
            </h2>
          </div>
          <ol className="steps">
            <li className="step">
              <h3 className="step__title">Pick your country</h3>
              <p className="step__text">
                Choose from 43 supported countries, including Czech Republic
                (Czechia), with regional, state, and city holidays where available.
              </p>
            </li>
            <li className="step">
              <h3 className="step__title">Set your time-off budget</h3>
              <p className="step__text">
                Enter your vacation days and optional rules: minimum or maximum
                trip length, monthly caps, custom free days.
              </p>
            </li>
            <li className="step">
              <h3 className="step__title">Get ranked stretches</h3>
              <p className="step__text">
                See the best vacation-day combinations scored by days off gained
                per day used, on a full year calendar.
              </p>
            </li>
          </ol>
        </section>

        <section className="landing-section" aria-labelledby="guides-title">
          <div className="section-head">
            <p className="section-head__eyebrow">Planning guides</p>
            <h2 id="guides-title" className="section-head__title">
              Popular 2027 vacation guides
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularGuides.map((guide) => (
              <Link
                key={guide.href}
                to={guide.href}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
              >
                {guide.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="closing-cta" aria-labelledby="closing-cta-title">
          <h2 id="closing-cta-title" className="closing-cta__title">
            Ready to turn scattered holidays into real vacations?
          </h2>
          <p className="closing-cta__text">
            Pick a country, set your day budget, and get a ranked plan you can
            request at work tomorrow.
          </p>
          <div className="closing-cta__actions">
            <Link to="/app" className="btn-pill btn-pill--primary">
              Open the free planner
              <CalendarPlus aria-hidden="true" />
            </Link>
            <a href="/blog/" className="btn-pill btn-pill--ghost">
              Read planning guides
            </a>
          </div>
          <p className="closing-cta__trust">
            Free &middot; No sign-up &middot; Your data stays in your browser
          </p>
        </section>

        <HtmlFragment html={landingSeoHtml} className="contents" />
      </div>
    </>
  );
}
