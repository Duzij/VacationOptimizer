import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import HtmlFragment from "./HtmlFragment";
import landingBoxesHtml from "../content/landing-boxes.html?raw";

export default function LandingContent() {
  return (
    <section className="max-w-6xl mx-auto">
      <div className="landing-grid auto-rows-fr">
        <HtmlFragment html={landingBoxesHtml} className="contents" />

        <article className="landing-box col-span-12 md:col-span-6 xl:col-span-4 place-items-center text-center">
          <Link
            to="/app"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background"
          >
            Start planning <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </div>
    </section>
  );
}
