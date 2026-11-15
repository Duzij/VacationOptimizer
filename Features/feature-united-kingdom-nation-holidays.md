# Feature: United Kingdom nation holidays

Status: completed
Owner guides: `.agents/server.md`, `.agents/frontend-ux.md`

## Goal

Add a required nation selector to the United Kingdom planner so bank holidays follow the user's nation instead of a single UK-wide calendar. The available choices are England & Wales (`GB-ENG`), Scotland (`GB-SCT`), and Northern Ireland (`GB-NIR`).

England and Wales share one bank holiday calendar and are presented as a single option. The supplied 2027 comparison is the expected behavior, including Scotland's 2nd January substitute day, St Andrew's Day, Northern Ireland's St Patrick's Day and Battle of the Boyne, and the different Summer bank holiday dates.

## Server

- Add `GET /api/vacations/countries/GB/schema` and `POST /api/vacations/countries/GB/optimize`.
- Require a valid `nationCode`; return a `nation` scope containing its code and name.
- Expose the three nations from `IPublicHolidayService.GetStates("GB")` without adding database seed records.
- Configure the `UKBankHoliday` fallback provider per nation in `PublicHolidayService`.
- Route the United Kingdom away from the legacy optimize endpoint and use `GB-ENG` for landing-page showcase calculations.

## Client

- Add a United Kingdom-specific **Nation** form, schema query, and optimize client.
- Include the United Kingdom in request/result unions, API dispatch, scope comparisons, URL serialization (`nationCode`), bookmarks, and persistence.
- Use `nationCode=GB-ENG` for the United Kingdom showcase planner link.
- Default old links and saved requests without a nation to `GB-ENG` so pre-existing United Kingdom bookmarks keep working.
- Update the UK planning guide deep links and agent discovery content to include `nationCode`.

## Verification

- Run `dotnet test VacationOptimizer.Test` for schema/optimize contracts, nation-scoped 2027 holidays, unknown-nation rejection, and showcase behavior.
- Run `npx vitest run` and `npm run build` in `VacationOptimizer.Server/wwwroot` for the form, API dispatch, deep links, persistence, and production build.

## Finalize

- Update the existing UK planning post (`content/blog/2026-12-15-maximize-your-annual-leave-in-the-uk-in-2027.md`) so its instructions and deep links use the nation selector.
- Terms review: no change required; this adds holiday reference data and a region selector without changing stored user data, sharing, or privacy behavior.
