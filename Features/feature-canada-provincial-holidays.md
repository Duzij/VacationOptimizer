# Feature: Canada provincial holidays

Status: completed
Owner guides: `.agents/server.md`, `.agents/frontend-ux.md`

## Goal

Add Canada as a country-specific planner with a required province/territory selector and curated 2026 and 2027 national and provincial/territorial holidays. Preserve the supplied names and dates, including province-specific observances such as Louis Riel Day, Saint-Jean-Baptiste Day, Orange Shirt Day, and Discovery Day.

## Server

- Seed Canada and all 13 provinces/territories using ISO-style codes `CA-AB` through `CA-YT`.
- Store national holidays with no state and provincial/territorial holidays with their local state mapping; include them in `CountrySeedCatalog` and runtime reference-data seeding. Include the 2027 Christmas and Boxing Day substitute holidays on December 27 and 28.
- Add `GET /api/vacations/countries/CA/schema` and `POST /api/vacations/countries/CA/optimize`.
- Require a valid `provinceCode`; return a `province` scope containing its code and name.
- Route Canada away from the legacy optimize endpoint and use `CA-ON` for landing-page showcase calculations.

## Client

- Add a Canada-specific form labeled **Province / Territory**, schema query, and optimize client.
- Include Canada in request/result unions, API dispatch, scope comparisons, URL serialization, bookmarks, and persistence.
- Use `provinceCode=CA-ON` for Canada showcase planner links.

## Verification

- Run `dotnet test VacationOptimizer.Test` for seed normalization, holiday lookup, schema/optimize contracts, and showcase behavior.
- Run `npx vitest run` and `npm run build` in `VacationOptimizer.Server/wwwroot` for the form, API dispatch, deep links, persistence, and production build.

## Finalize

- Add a user-facing blog post announcing Canadian provincial/territorial planning.
- Terms review: no change required; this adds holiday reference data and a region selector without changing stored user data, sharing, or privacy behavior.
