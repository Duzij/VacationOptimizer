# Feature: Site-wide SEO optimization

Status: completed
Owner guide: `.agents/frontend-ux.md` (primary)

## Goal

Improve organic search visibility across the whole site (landing page, public SPA pages, and static blog) by serving search intent better than competing pages: more substantive content on thin pages, accurate structured data, per-page metadata, and stronger internal linking — without keyword stuffing or padding.

## Why this matters

Pages under ~300 words of on-page substance are disproportionately represented among low-rankers, especially for informational or blog-style content. The site currently has several thin surfaces:

- Landing page `/`: ~90 words of crawlable text in the no-JS fallback plus scattered UI copy; no article-depth content or FAQ.
- `/about`: ~189 words.
- Three blog posts are at or near the 300-word threshold (`see-your-countrys-vacation-potential` ~299, `maximize-your-pto-in-the-netherlands-in-2027` ~401, `maximize-your-vacation-in-the-us-in-2027` ~410).

The fix is substantive depth, not filler: answer the follow-up questions a reader would naturally have, add a short FAQ per page targeting related long-tail queries, include specifics (numbers, steps, examples, comparisons), and break expanded content into H2/H3 sections so it stays scannable.

 Avoid stuffing keywords or repeating the same point purely to hit a number.

## Non-Goals

- No keyword-density games, no automated content generation, no paid links.
- No changes to legal pages (`/privacy`, `/terms`) beyond what already exists — legal pages should not be keyword-driven.
- No new admin UI or CMS: blog content stays as repo-managed Markdown files.

## Requirements

### 1. Landing page substance (high impact)

- New content fragment `src/content/landing-seo.html` rendered by `LandingContent` below the landing-boxes grid via `HtmlFragment`.
- Content sections (each H2, scannable paragraphs):
  1. **How bridge-day planning works** — concrete 3-step example with dates/numbers from a real calendar (e.g., a Thursday public holiday + Friday PTO = 4-day weekend).
  2. **What the optimizer does** — greedy bridge-filling, country/region/state/city scope, custom free days, office closures, range controls, ranked output (mirrors the existing landing-boxes but written as prose for search engines).
  3. **Example with real numbers** — "25 vacation days → 40+ days off" reusing the country-showcase output as original data (E-E-A-T signal), plus a note that any supported country can be picked.

- **FAQ section** (H2 "Frequently asked questions") with 5–6 substantive Q&A (2–3 sentences each), each answer linking to the planner or a relevant blog post. Candidate questions:
  - "Is Vacation Optimizer free?"
  - "What is a bridge day?"
  - "How accurate is the holiday data?"
  - "Can I add my own office closures and ignore holidays that don't apply?"
  - "Does it work for part-time or shift workers?" (answer honestly: it plans calendar days, verify employer policy)
  - "How do I get started?"

### 2. Blog post depth (high impact)

Thin posts get substantive additions + FAQ sections. Each FAQ question must be answered specifically with dates/numbers from that post, and link to the planner or a related post:

- `see-your-countrys-vacation-potential` (~299 w): add "Why bridging works" paragraph with a worked example (e.g., Germany:25 days →44 days off), plus FAQ ("Is the number real?", "Which countries are featured?", "Why 25 days?", "How do I open this in the planner?").
- `maximize-your-vacation-in-the-us-in-2027` (~410 w): add "Best long-weekend windows in 2027" combing the existing Monday/Friday holiday data into 4-day weekend recommendations, plus FAQ ("What if a federal holiday falls on a weekend?", "How many PTO days do Americans average?", "Can I combine state holidays?").
- `maximize-your-pto-in-the-netherlands-in-2027` (~401 w): add explicit worked example "3 PTO days → 9 days off" (already in the summary, make it concrete in body), plus FAQ ("Does everyone get Liberation Day off?", "What about regional holidays?", "Can I extend the Christmas weekend?").
- `maximize-your-pto-in-spain-in-2027` (~433 w): add FAQ ("Is 12 October a national holiday everywhere?", "How do Barcelona/Madrid city holidays add options?", "What if a holiday falls on the weekend?") plus a practical "How to ask for approval early" tip.

- Pattern for all posts: end with `## Frequently asked questions` H2 (2–4 Q&A), answered specifically, linking to `/app?country=X&year=2027` or a related post。



### 3. Blog structured data fixes (medium impact)

In `scripts/generate-blog-static.mjs` (`buildHeadFromAppIndex`):

- **Post pages**: use `post.tags` for `keywords` + add `articleSection`; add `author` (Person/Organization from the post's author field), `datePublished`, `dateModified` (= date), `mainEntityOfPage`, and `wordCount`.
- **Blog index**: switch the `@type` from `BlogPosting` to `Blog` (collection schema) instead of reusing the post schema.
- Remove the hardcoded global `seoKeywords` array in favor of per-post tags for posts; keep it only where appropriate (index).

### 4. Internal linking (medium impact)

- Home content (§1) links to the 4 country guides (US, Spain, Netherlands, Australia) from the highest-authority page。

- Cross-link related posts in-body (1–2 per post):
  - US ↔ "Don't Leave Your Vacation on the Table" ↔ "Why Taking Vacation Could Save You Money"
  - Spain ↔ Netherlands ↔ Australia (cluster: "planning 2027 PTO in Europe")
  - Indonesia ↔ "Monthly Vacation Caps" (feature: reserve days)
- FAQ answers link to the planner or a related post。


### 5. SPA route metadata (medium impact)

In `src/components/PublicPages.tsx` `RouteMeta`: besides `title`, `description`, canonical, also update:
- `og:title`, `og:description`, `og:url`
- `twitter:title`, `twitter:description`

So social-share CTR is consistent per route (about/contact/privacy/terms/app/home)。

### 6. Sitemap & robots freshness (low impact)

- `generateSitemap()` in `scripts/generate-blog-static.mjs`: replace hardcoded static `lastmod` dates with content-update dates (keep priorities/changefreq; use the latest blog date for `/blog/`。
- `public/robots.txt`: add explicit `Allow: /blog/`。



## Implementation plan & milestones

1. Feature spec (this file)。
2. Landing content fragment + render in `LandingContent.tsx`。
3. Blog post depth edits (MD files)。
4. Blog JSON-LD fixes (generator script)。
5. Internal cross-linking (in blog MDs + home fragment)。
6. `RouteMeta` OG/Twitter updates。

7. Sitemap lastmod + robots updates。
8. Build + tests + visual check。
9. Optional follow-ups: `WebSite`/`Organization` JSON-LD on home, compress `twitter_small.png`, "How to use the planner well" FAQ on `/app`。

## Verification

- `npm run build` in `VacationOptimizer.Server/wwwroot` — generator runs, sitemap regenerates, static blog pages rebuild。
- `npx vitest run` — existing component tests keep passing。
- Manual: home page shows the new sections + FAQ; blog posts render with FAQ headings; generated HTML includes per-post schema fields (grep `articleSection`/`datePublished` in `public/blog/<slug>/index.html`); sitemap `lastmod` no longer hardcoded。

## Finalize

- Blog post announcing the content depth improvements (optional, after shipping)。
- Measure in Google Search Console: impressions/CTR/position for head terms ("holiday optimizer", "pto optimizer", "vacation planner", "how to maximize vacation days 2027") and per-country long-tail terms; compare pre/post content-depth changes per post。