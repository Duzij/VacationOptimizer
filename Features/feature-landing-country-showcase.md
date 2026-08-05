# Plan: Landing page country showcase

Status: completed
Owner guides: `.agents/frontend-ux.md` (primary), `.agents/server.md` (new endpoint)

## Goal

Rework the landing page (`/`) with an interactive showcase section **below the hero** that:

1. Auto-rotates through a curated set of featured countries with CSS-animated flag transitions, showing `25 PTO days -> X overall days off` per country.
2. Lets the visitor pick **any** supported country from a selector; the card updates to that country.
3. Shows a call to action — "In {Country} from 25 days to {X} overall days" — that deep-links to the planner with the country and PTO count preselected.

## Data source: real optimizer, cached

New server endpoint:

```
GET /api/vacations/showcase?country=DE&year=2026&vacationDays=25
```

- Returns **one number** (JSON int): `totalDaysOff` from the real `VacationOptimizerService.Optimize`.
- `year` and `vacationDays` are optional; defaults are hardcoded constants (`ShowcaseDefaults.Year = 2026`, `VacationDays = 25`). The client always passes the hardcoded current year explicitly.
- Uses planner-matching range defaults `MinimumDaysPerRange = 4`, `MaximumDaysPerRange = 14` so the number matches what the planner produces with its own defaults.
- Cached in `IMemoryCache` for 24h, key `showcase:{COUNTRY}:{STATE|ALL}:{year}:{vacationDays}` (mirrors `CachedPublicHolidayService` style).
- `IN` and `CH` require a region: the endpoint uses hardcoded default regions (`IN-KA`, `CH-ZH`). `ES` uses the national scope. Errors mirror the optimize endpoint (`400` bad request, `409` unavailable).

## Client

- `src/showcase.ts` (new): `SHOWCASE_YEAR = 2026`, `SHOWCASE_VACATION_DAYS = 25`, featured country list, and `buildShowcasePlannerPath(countryCode)` producing `/app?country=XX&year=2026&vacationDays=25` (plus `stateCode=IN-KA` / `cantonCode=CH-ZH` for IN/CH, matching the server defaults).
- `api/vacationApi.ts`: `fetchShowcaseDaysOff` + `useShowcaseDaysOff` (React Query, `staleTime: Infinity`).
- `components/CountryShowcase.tsx` (new), rendered by `LandingContent` between the hero and the landing-boxes grid:
  - Featured countries rotate on an interval; flag + numbers animate via a new `styles/showcase.css` (keyframes, `prefers-reduced-motion` disables animation and auto-rotation).
  - Rotation pauses on hover/focus and after a manual country selection.
  - Native `<select>` lists all countries from `useCountries()`.
  - CTA is a `Link` to the planner path; while the number loads it shows a neutral loading state, on error it falls back to "Start planning in {Country}".
- Flags: `flag-icons` npm package (local SVG/CSS, no external CDN), imported in `index.css`.

## Verification

- `dotnet test VacationOptimizer.Test` — new integration tests for `/api/vacations/showcase` (number returned, unknown country 400, IN/CH defaults work, caching).
- `npx vitest run` + `npm run build` in `VacationOptimizer.Server/wwwroot` — component tests (CTA href, selector, reduced-motion/rotation behavior).

## Finalize

- Blog post in `wwwroot/content/blog/` announcing the showcase.
- Terms review: expected no change (aggregate, non-personal numbers; nothing new stored about users) — confirm explicitly.
