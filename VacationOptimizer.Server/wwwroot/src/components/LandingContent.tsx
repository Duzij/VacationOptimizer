import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const textBoxes = [
  {
    title: "Find the best days to use PTO.",
    body: "Vacation Optimizer helps people turn scattered public holidays and weekends into longer, more useful breaks.",
    className: "col-span-12 xl:col-span-4 md:col-span-6",
  },
  {
    title: "Built for a real calendar.",
    body: "National holidays, regional holidays, and custom free days can all shape the planning outcome.",
    className: "col-span-12 md:col-span-6 xl:col-span-3",
  },
  {
    title: "Useful before booking.",
    body: "It gives people a faster way to evaluate time-off strategies before checking approvals, prices, and logistics.",
    className: "col-span-12 md:col-span-6 xl:col-span-4",
  },
  {
    title: "More than 30 countries supported",
    body: "Updated information about national and regional holidays. Check the planner for more details.",
    className: "col-span-12 md:col-span-6 xl:col-span-4",
  }
];

export default function LandingContent() {
  return (
    <section className="max-w-6xl mx-auto">
      <div className="landing-grid auto-rows-fr">
        {textBoxes.map((box) => (
          <TextBox key={box.title} title={box.title} body={box.body} className={box.className} />
        ))}

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

function TextBox({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className: string;
}) {
  return (
    <article className={`landing-box ${className}`}>
      <h2 className="text-2xl font-semibold tracking-tight text-text">{title}</h2>
      <p className="text-sm leading-6 text-text-muted">{body}</p>
    </article>
  );
}
