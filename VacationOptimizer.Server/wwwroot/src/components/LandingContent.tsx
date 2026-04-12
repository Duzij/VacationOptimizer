import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import HtmlFragment from "./HtmlFragment";
import landingBoxesHtml from "../content/landing-boxes.html?raw";

export default function LandingContent() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-[2rem] bg-surface/55">
        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <div className="px-3 py-4 md:px-8 md:py-10">
            <div className="space-y-6">
              <div className="max-w-2xl space-y-4">
                <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-text md:text-7xl">
                  The is a better way
                  <br />
                  <span className="text-[var(--landing-accent)] italic">
                    to use PTOs.
                  </span>
                </h1>
                <h2 className="max-w-xl text-base leading-7 text-text-muted md:text-lg">
                  Vacation Optimizer helps people turn scattered public holidays
                  and weekends into longer, more useful breaks.
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

          <aside className="border-border bg-background/65 px-6 py-8 md:px-8">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[var(--landing-accent-soft)] p-5">
                <div className="pointer-events-none absolute -bottom-4 -right-4 text-[color-mix(in_srgb,var(--landing-accent)_20%,transparent)]">
                  <CalendarDays className="h-28 w-28" strokeWidth={1.5} />
                </div>

                <div className="relative z-10 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-text">
                      Built for a real calendar.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-text-muted">
                      National holidays, regional holidays, and custom free days
                      can all shape the planning outcome.
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-semibold tracking-tight text-text">
                        30+
                      </p>
                      <p className="text-sm text-text-muted">
                        countries supported
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="landing-grid auto-rows-fr">
          <HtmlFragment html={landingBoxesHtml} className="contents" />
        </div>
      </div>
    </section>
  );
}
