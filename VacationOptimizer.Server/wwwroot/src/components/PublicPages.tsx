import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import FeedbackForm from "./FeedbackForm";
import LandingContent from "./LandingContent";
import {
  clearAppLocalStorage,
  savedRequestStorageKey,
  savedResultStorageKey,
  themeStorageKey,
} from "../utils/optimizationPersistence";

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
    <section className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-3">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-text-muted sm:text-lg">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ContentCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-border bg-surface/55 p-6 space-y-3">
      <h2 className="text-xl font-semibold text-text">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-text-muted">{children}</div>
    </article>
  );
}

export function HomePage() {
  return (
    <LandingContent />
  );
}

export function AboutPage() {
  return (
    <PageSection
      title="Vacation Optimizer helps people make better time-off decisions."
      description="The product combines calendar logic, planning guidance, and an interactive planner so users can compare PTO strategies with more context and fewer surprises."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ContentCard title="Who it is for">
          <p>Employees, contractors, families, and managers who want a clearer view of how weekends, public holidays, and PTO interact.</p>
        </ContentCard>
        <ContentCard title="What it does not replace">
          <p>Employer approval, local holiday verification, travel budgeting, staffing plans, and personal schedule constraints still need human review.</p>
        </ContentCard>
      </div>
    </PageSection>
  );
}

export function ContactPage() {
  return (
    <PageSection
      title="Use the same feedback channel as the planner."
      description="Questions, corrections, and product feedback all go through the same form flow so issues reach one consistent inbox."
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <ContentCard title="When to contact us">
          <p>Report incorrect holiday data, confusing planner behavior, accessibility issues, or suggestions for better PTO planning guidance.</p>
          <p>Include the country or region involved, the dates affected, and whether the issue appears in the planner or a public content page.</p>
        </ContentCard>

        <article className="rounded-3xl border border-border bg-surface/55 p-6">
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

  const handleClearLocalData = () => {
    clearAppLocalStorage();
    setClearStatus("cleared");
  };

  return (
    <PageSection
      title="Privacy expectations should be clear before someone uses the planner."
      description="This page explains what browser data the planner stores, what infrastructure providers may process visitor traffic, and how users can remove locally stored planner data."
    >
      <div className="grid gap-4">
        <ContentCard title="Form state stored in your browser">
          <p>
            Vacation Optimizer stores planner form state in your browser&apos;s local storage so the app can restore your latest setup and result when you return.
          </p>
          <p>
            The current keys used by the app are <code>{savedRequestStorageKey}</code> for the saved form request, <code>{savedResultStorageKey}</code> for the saved optimization result, and <code>{themeStorageKey}</code> for the theme preference.
          </p>
          <p>
            The saved request can include the values you enter into the planner, such as country, year, PTO settings, region or state selection, ignored holidays, and custom free-day dates. The saved result can include the vacation ranges generated from that form state.
          </p>
          <p>
            We use this local storage only to provide core planner functionality. The data stays in this browser until you clear it, overwrite it with newer planner data, or remove it using the control below.
          </p>
          <p>
            Use this control if you want to delete the planner information stored on this device through local storage.
          </p>
          <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={handleClearLocalData}
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-hover cursor-pointer"
            >
              Remove all local storage data used by this app
            </button>
            {clearStatus === "cleared" && (
              <span className="text-sm text-text-muted">
                Local planner data has been removed from this browser.
              </span>
            )}
          </div>
        </ContentCard>

        <ContentCard title="Cloudflare">
          <p>
            We use Cloudflare, Inc. to protect and optimize the website. In that role, Cloudflare may process visitor traffic data such as IP address, browser details, device information, and security-related request metadata on our behalf.
          </p>
          <p>
            We also use Cloudflare Web Analytics. Cloudflare describes this service as privacy-friendly, cookie-free, and not using local storage, and states that it does not collect or use visitors&apos; personal data.
          </p>
          <p>
            Because Cloudflare Web Analytics does not rely on storing or accessing information on your device, typical EU and UK cookie-consent rules generally do not require a consent pop-up for that analytics product. For transparency, we disclose its use here instead of presenting an opt-in banner for it.
          </p>
          <p>
            Cloudflare does not provide a built-in end-user opt-out for this analytics product. If you want to opt out, you can ask us to remove or disable the Cloudflare analytics snippet for your use, and you may also contact Cloudflare about data-rights requests, although Cloudflare states that this product does not collect personal information.
          </p>
          <p>
            Any transfer of personal data to Cloudflare should be covered by appropriate safeguards, including the EU-US Data Privacy Framework and standard contractual clauses where applicable. You can review Cloudflare&apos;s privacy information here: <a className="underline underline-offset-2" href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare Privacy Policy</a>.
          </p>
        </ContentCard>
      </div>
    </PageSection>
  );
}

export function TermsPage() {
  return (
    <PageSection
      title="The planner is for guidance and comparison, not guaranteed outcomes."
      description="Vacation Optimizer helps compare efficient date combinations, but users still need to verify holiday observance, employer rules, and booking conditions before acting on a recommendation."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ContentCard title="What users can expect">
          <p>Informational planning support, interactive calendar suggestions, and a tool for testing PTO scenarios across supported countries and regions.</p>
        </ContentCard>
        <ContentCard title="What remains the user's responsibility">
          <p>Leave approvals, staffing coverage, compliance, travel purchases, and confirmation of final holiday accuracy remain outside the scope of the app.</p>
        </ContentCard>
      </div>
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
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-medium text-background">
          Back to home
        </Link>
        <Link to="/app" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-medium text-text">
          Open planner
        </Link>
      </div>
    </PageSection>
  );
}

export function PublicFooter() {
  const footerLinkClass = "inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-border hover:bg-surface-hover hover:text-text";

  return (
    <footer className="border-t border-border py-4 px-4">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-muted/60">
        <span>Vacation Optimizer · {new Date().getFullYear()}</span>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Link to="/contact" className={footerLinkClass}>Contact</Link>
          <Link to="/privacy" className={footerLinkClass}>Privacy</Link>
          <Link to="/terms" className={footerLinkClass}>Terms</Link>
          <Link to="/about" className={footerLinkClass}>About</Link>
        </div>
      </div>
    </footer>
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
    canonicalTag?.setAttribute("href", `https://optimize-vacation-for.me${canonicalPath}`);
  }, [canonicalPath, description, title]);

  return null;
}
