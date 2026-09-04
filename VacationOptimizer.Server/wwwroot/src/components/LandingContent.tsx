import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CountryShowcase from "./CountryShowcase";
import HtmlFragment from "./HtmlFragment";
import landingBoxesHtml from "../content/landing-boxes.html?raw";
import landingSeoHtml from "../content/landing-seo.html?raw";

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
                  There is a better way
                  <br />
                  <span className="text-[var(--landing-accent)] italic">
                    to use vacation days.
                  </span>
                </h1>
                <h2 className="max-w-xl text-base leading-7 text-text-muted md:text-lg">
                  Vacation Optimizer is a holiday optimizer and PTO optimizer
                  that turns scattered public holidays and weekends into longer,
                  more useful breaks.
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--landing-accent)_18%,var(--color-border))] bg-[color-mix(in_srgb,var(--landing-accent)_88%,black)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,123,131,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--landing-accent)_96%,black)] hover:shadow-[0_14px_30px_rgba(15,123,131,0.22)]"
                >
                  Start planning
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/about"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border bg-background px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
                >
                  Learn more
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
            <p className="section-head__eyebrow">Why Vacation Optimizer</p>
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
                Start with India, Spain, or Indonesia — each with regional
                holiday detail down to states and provinces.
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
              <ArrowRight aria-hidden="true" />
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
