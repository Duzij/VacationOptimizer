# Feature: Germany regional holidays

Status: completed
Owner guides: `.agents/server.md`, `.agents/frontend-ux.md`

## Goal

Add Germany as a country-specific planner with a required federal-state selector and curated 2027 national and regional public holidays. Preserve the supplied nationwide dates and state-specific observances, including Epiphany, International Women's Day, Corpus Christi, Assumption Day, Reformation Day, and Saxony's Day of Prayer and Repentance.

TARGET settlement calendars and Deutsche Bundesbank non-business days are not public holidays and are excluded. The supplied general-list Brandenburg Easter Sunday and nationwide Whit Sunday are included. Where the summary and detailed regional lists differ, the detailed federal-state list is authoritative.

## Server

- Seed all 16 federal states using ISO-style codes `DE-BW` through `DE-TH` while retaining Germany's existing country record.
- Store nationwide holidays with no state and regional holidays with their local state mappings; include Germany in `CountrySeedCatalog` and runtime reference-data seeding.
- Add `GET /api/vacations/countries/DE/schema` and `POST /api/vacations/countries/DE/optimize`.
- Require a valid `stateCode`; return a `state` scope containing its code and name.
- Route Germany away from the legacy optimize endpoint and use `DE-BE` for landing-page showcase calculations.

## Client

- Add a Germany-specific **State / Region** form, schema query, and optimize client.
- Include Germany in request/result unions, API dispatch, scope comparisons, URL serialization, bookmarks, and persistence.
- Use `stateCode=DE-BE` for Germany showcase planner links.

## Verification

- Run `dotnet test VacationOptimizer.Test` for seed normalization, all 16 state calendars, schema/optimize contracts, and showcase behavior.
- Run `npx vitest run` and `npm run build` in `VacationOptimizer.Server/wwwroot` for the form, API dispatch, deep links, persistence, and production build.

## Finalize

- Add user-facing English and German blog posts announcing German federal-state planning, linked with `language: de` and `translationOf: germany-holiday-planner`.
- Terms review: no change required; this adds holiday reference data and a region selector without changing stored user data, sharing, or privacy behavior.
