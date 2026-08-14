import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FeedbackForm from "./FeedbackForm";
import LandingContent from "./LandingContent";
import HtmlFragment from "./HtmlFragment";
import {
  clearAppLocalStorage,
  hasAppLocalStorageData,
  savedRequestStorageKey,
  savedResultStorageKey,
  themeStorageKey,
} from "../utils/optimizationPersistence";
import aboutPageHtml from "../content/about-page.html?raw";
import contactPageHtml from "../content/contact-page.html?raw";
import privacyPageHtml from "../content/privacy-page.html?raw";
import termsPageHtml from "../content/terms-page.html?raw";

function PageSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-4 lg:py-0 space-y-6">
      <div className="space-y-3">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-text-muted sm:text-lg">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export function HomePage() {
  return <LandingContent />;
}

export function AboutPage() {
  return (
    <PageSection
      title="About Vacation Optimizer"
      description="Vacation Optimizer is a vacation planning site built to help people use vacation days more deliberately by comparing breaks around public holidays, weekends, and local calendar rules."
    >
      <HtmlFragment
        html={aboutPageHtml}
        className="grid gap-4 md:grid-cols-3"
      />
    </PageSection>
  );
}

export function ContactPage() {
  return (
    <PageSection
      title="Contact Vacation Optimizer"
      description="Use this page to report product issues, holiday-data corrections, planner feedback, or questions about how the site works."
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <HtmlFragment html={contactPageHtml} />

        <article className="content-panel">
          <FeedbackForm
            draft={{
              title: "Contact",
              message: "",
              submitLabel: "Send feedback",
            }}
          />
        </article>
      </div>
    </PageSection>
  );
}

export function PrivacyPage() {
  const [clearStatus, setClearStatus] = useState<"idle" | "cleared">("idle");
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    setHasLocalData(hasAppLocalStorageData());
  }, []);

  const handleClearLocalData = () => {
    clearAppLocalStorage();
    setHasLocalData(false);
    setClearStatus("cleared");
  };

  return (
    <PageSection
      title="Privacy Policy"
      description="This page explains what browser data the planner stores, what infrastructure providers may process visitor traffic, and how users can remove locally stored planner data."
    >
      <div className="grid gap-4">
        <article className="content-panel space-y-3">
          <h2 className="text-xl font-semibold text-text">
            Form state stored in your browser
          </h2>
          <div className="space-y-3 text-sm leading-6 text-text-muted">
            <p>
              Vacation Optimizer stores planner form state in your
              browser&apos;s local storage so the app can restore your latest
              setup and result when you return.
            </p>
            <p>
              The current keys used by the app include{" "}
              <code>{savedRequestStorageKey}</code> for the latest saved form
              request, year-specific variants of that key for saved planner
              settings from different years,{" "}
              <code>{savedResultStorageKey}</code>{" "}
              and year-specific variants for saved optimization results, and{" "}
              <code>{themeStorageKey}</code> for the theme preference.
            </p>
            <p>
              The saved request can include the values you enter into the
              planner, such as country, year, vacation-day settings, region or state
              selection, ignored holidays, and custom free-day dates. The saved
              result can include the vacation ranges generated from that form
              state, and the saved request may include a signed planner seed so
              the same generated result can be restored.
            </p>
            <p>
              We use this local storage only to provide core planner
              functionality. The data stays in this browser until you clear it,
              overwrite it with newer planner data, or remove it using the
              control below.
            </p>
            <p>
              Use this control if you want to delete the planner information
              stored on this device through local storage and session state.
            </p>
            <p className="flex justify-end py-4">
              <button
                type="button"
                onClick={handleClearLocalData}
                disabled={!hasLocalData}
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background cursor-pointer"
              >
                Remove all local storage and session data used by this app
              </button>
             
            </p>
            {clearStatus === "cleared" && (
              <p className="text-right font-medium">
                Local storage data cleared. The planner will restore to default.
              </p>
            )}
          </div>
        </article>

        <HtmlFragment html={privacyPageHtml} className="grid gap-4" />
      </div>
    </PageSection>
  );
}

export function TermsPage() {
  return (
    <PageSection
      title="Terms of Use"
      description="Vacation Optimizer provides informational planning support. Users remain responsible for verifying holiday accuracy, employer policy, and final travel or leave decisions."
    >
      <HtmlFragment
        html={termsPageHtml}
        className="grid gap-4 md:grid-cols-3"
      />
    </PageSection>
  );
}

export function NotFoundPage() {
  return (
    <PageSection
      title="That page could not be found."
      description="The content may have moved, or the URL may be incorrect."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-medium text-background"
        >
          Back to home
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-medium text-text"
        >
          Open planner
        </Link>
      </div>
    </PageSection>
  );
}

export function RouteMeta({
  title,
  description,
  canonicalPath,
}: {
  title: string;
  description: string;
  canonicalPath: string;
}) {
  useEffect(() => {
    document.title = title;

    const descriptionTag = document.querySelector('meta[name="description"]');
    descriptionTag?.setAttribute("content", description);

    const canonicalTag = document.querySelector('link[rel="canonical"]');
    canonicalTag?.setAttribute(
      "href",
      `https://longvacation.eu${canonicalPath}`,
    );
  }, [canonicalPath, description, title]);

  return null;
}
