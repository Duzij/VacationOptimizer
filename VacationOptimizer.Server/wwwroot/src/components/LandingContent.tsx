import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import HeroMap from "./HeroMap";
import HtmlFragment from "./HtmlFragment";
import landingBoxesHtml from "../content/landing-boxes.html?raw";

const faqs = [
  {
    question: "What does Vacation Optimizer do?",
    answer:
      "It finds the best vacation days to book around public holidays and weekends, so your limited PTO turns into the longest possible breaks. You pick a country and a vacation-day budget; the planner returns ranked suggestions together with a full calendar view.",
  },
  {
    question: "Is Vacation Optimizer free?",
    answer:
      "Yes. The planner is free to use, requires no account, and works directly in your browser without installing anything.",
  },
  {
    question: "Which countries are supported?",
    answer:
      "India (with state-level holidays), Spain (with regional holidays), and Indonesia — with more countries on the way.",
  },
  {
    question: "Can I add my own days off?",
    answer:
      "Yes. Add custom free days like office closures and ignore public holidays that do not apply to you. Every suggestion respects those settings.",
  },
  {
    question: "Do you store my data?",
    answer:
      "Your planner settings stay in your browser's local storage. There is no sign-up, and plans can be shared simply through a link.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};
import landingSeoHtml from "../content/landing-seo.html?raw";

export default function LandingContent() {
    return (
        <>
            {/* Sits outside the centered column so the map can be truly
                full-bleed without viewport-unit hacks. */}
            <HeroMap />

            <div className="landing-page">
      <section id="features" className="landing-section" aria-labelledby="features-title">
        <div className="section-head">
          <p className="section-head__eyebrow">Why Vacation Optimizer</p>
          <h2 id="features-title" className="section-head__title">
            Everything you need to stretch your PTO
          </h2>
          <p className="section-head__text">
            Vacation Optimizer is a free holiday optimizer and PTO optimizer
            that turns scattered public holidays and weekends into longer, more
            useful breaks. Six building blocks work together to find every
            bridge, cluster, and long weekend hiding in your calendar.
          </p>
        </div>
        <div className="features-grid">
          <HtmlFragment html={landingBoxesHtml} className="features-grid-inner" />
        </div>
      </section>

      <section id="how-it-works" className="landing-section" aria-labelledby="how-it-works-title">
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

      <section id="faq" className="landing-section" aria-labelledby="faq-title">
        <div className="section-head">
          <p className="section-head__eyebrow">FAQ</p>
          <h2 id="faq-title" className="section-head__title">
            Frequently asked questions
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary>
                <h3 className="faq-item__question">{faq.question}</h3>
              </summary>
              <p className="faq-item__body">{faq.answer}</p>
            </details>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
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
        <p className="closing-cta__trust">Free &middot; No sign-up &middot; Your data stays in your browser</p>
      </section>
        </div>
    
      <div className="mt-10">
        <HtmlFragment html={landingSeoHtml} className="contents" />
      </div>
    </>
    );
}
