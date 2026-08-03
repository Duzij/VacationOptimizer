# Front-end and UX agent

## Scope

Own `VacationOptimizer.Server/wwwroot/`: the React 19/Vite client, styles, browser persistence, user-facing content, generated blog output, and Vitest tests.

The app uses React Router, TanStack Query, Tailwind utility classes alongside project CSS, and Lucide icons. Build output is served by ASP.NET Core in production; do not add a separate client deployment.

## Route and page contract

- Public routes are `/`, `/about`, `/contact`, `/privacy`, and `/terms`; the planner is `/app`; `/connect` handles a redirect flow. Preserve `RouteMeta`, public footer/header behavior, and the Not Found experience for page changes.
- In Vite development the planner canonical path is `/`; in the deployed build it is `/app`. `getCanonicalAppPath` and `normalizeCanonicalAppPath` deliberately account for this difference—do not hard-code one path in shared navigation, redirects, or metadata.
- Blog sources live in `content/blog/*.md`. `npm run build` runs `scripts/generate-blog-static.mjs`, producing the static blog index and pages consumed by both the UI and `GET /api/blog`. Update generation, sitemap/static output, and route metadata together when changing public content.

## Planner state and interactions

- `useOptimizationSession` owns optimization lifecycle, result navigation, shuffle exhaustion, URL updates, and persistence. The result history is capped at 50 and its token/seed behavior must remain compatible with the server.
- Planner request/result data is kept in URL parameters and `localStorage` under the `vacationOptimizer.v2.*` keys. Do not rename, clear, or change its serialization without a migration/compatibility decision. A saved result without a usable `plannerSeed` is intentionally discarded.
- The planner supports custom free days, ignored holidays, never-vacation days, and locked vacation days. `useCalendarInteractions` handles their confirmation flow. Keep interactions correct with keyboard, pointer, touch, and long-press use, and check both `DetailsLipDesktop` and `DetailsLipMobile` after calendar changes.
- Theme preference persists under `theme`; connected-calendar data and redirect state are separate from the optimization session. Preserve the privacy-first, browser-local behavior unless a feature explicitly changes it.

## API and country-specific behavior

- Generic countries use `POST /api/vacations/optimize`. India, Spain, and Switzerland dispatch through `features/countrySpecific/` to their individual schema and optimize endpoints; do not route those requests to the legacy endpoint.
- India requires a state selector, Switzerland requires a canton selector, and Spain supports national/state/city selection. Update the respective form, `models.ts`, client API, and server contract in the same change.
- Keep API failures as `ApiError` with status codes so a `409` remains recognizable as no further shuffle result. Preserve type-safe serialized dates (`YYYY-MM-DD`) and DayType values in `src/types/models.ts`.
- Country/holiday scope changes intentionally reset incompatible ignored, never-holiday, and locked-day state. Do not accidentally carry those selections to another country, region, or year.

## UX, accessibility, and visual checks

- The calendar, optimizer form, range summary, share flow, feedback flow, and mobile/desktop detail lips are the core product surface. Make changes progressively and keep layout usable at narrow and wide widths.
- Prefer existing components, `cva`/`clsx`/`tailwind-merge`, and focused CSS files (`styles/calendar.css`, `styles/forms.css`, `styles/theme.css`, and `styles/motion.css`) over one-off global overrides.
- Preserve clear labels, visible focus treatment, native buttons/inputs where appropriate, live feedback for requests/errors, and non-color-only day-type distinctions. Do not rely on hover for required planner actions.

## Validation

Run from `VacationOptimizer.Server/wwwroot/`:

```bash
npm run lint
npm test
npm run build
```

For planner changes, manually verify a generic country plus the relevant country-specific form, a shuffle/previous/next flow, a deep-link refresh, and desktop/mobile calendar interaction. Coordinate server and DevOps validation when a client change adds a route, API field, generated asset, or runtime dependency.
