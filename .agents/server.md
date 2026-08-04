# Server agent

## Scope

Own `VacationOptimizer.Server/` outside `wwwroot/` and the xUnit suite in `VacationOptimizer.Test/`.

The backend is a .NET 10 minimal API. `Program.cs` wires the application, data store, cache, endpoints, static/SPA hosting, and the background database-security report. Keep new server behavior in focused services rather than growing endpoint lambdas.

## Product behavior and API contract

The generic API group is `/api/vacations`:

- `POST /optimize` returns an optimized calendar, selected vacation days, ranges, aggregate totals, a signed `resultToken`, and a `plannerSeed`.
- `POST /decode-seed` reconstructs day types from a planner seed.
- `GET /countries`, `GET /countries/{countryCode}/states`, and `GET /detected-country` support the planner form.
- `GET /api/blog` serves the generated `blog/index.json` from the built client or `public` fallback.

`OptimizeRequest` supports a country, year, vacation budget, range bounds, regional state, custom days, ignored holidays, never-vacation days, locked vacation days, result history, and a seed token. Preserve the meaning of each field: calendar edits are user intent and must survive a compatible shuffle or restored session.

`VacationOptimizerService` deterministically creates up to `OptimizationDefaults.MaxUsedResultTokens` (currently 50) alternatives from a request fingerprint. Never weaken result-token validation, reuse a token for another request, or return a result without a matching `plannerSeed`.

## Country and holiday rules

- Generic countries use the legacy optimize endpoint. `IN`, `ES`, and `CH` must use `POST /api/vacations/countries/{code}/optimize` and expose `GET .../{code}/schema`.
- India requires a valid `stateCode`; Switzerland requires a valid `cantonCode`.
- Spain supports national, state, and city scope. Barcelona (`ES-CT-BCN`) inherits Catalonia; Madrid (`ES-MD-MAD`) inherits Madrid. Keep this mapping synchronized between `SpainVacationEndpoints` and `PublicHolidayService`.
- Curated records are seeded from `Data/SeedData`. When the database has a calendar for a country/year it takes precedence; otherwise the `PublicHoliday` provider is used. A seeded country with no calendar for a future year intentionally returns no holidays until that calendar is added.
- `CalendarService` marks past days, today, user-protected days, custom free days, holidays, weekends, then workdays in that precedence order. Protect this ordering with tests whenever calendar logic changes.

## Data and security constraints

- The application currently runs `db.Database.EnsureCreated()` at startup; it does **not** call `Migrate()`. A migration file alone will not update an already-existing production database. Treat any schema change as a deployment decision and coordinate the safe upgrade path with DevOps before merging.
- The database-security report is read-only, runs in the hosted worker outside `Testing`, and is intentionally hidden behind `GET /api/internal/database-security?accessKey=...`. Invalid credentials return `404`, valid credentials may return `429` during cooldown, and report absence/unhealthy state returns `503`. Preserve its no-cache/no-referrer/noindex behavior.
- Production requires `Optimization:ResultTokenSigningKey`; Compose provides it as `Optimization__ResultTokenSigningKey`. Do not substitute a development key in production.
- `UseForwardedHeaders` trusts only Docker private ranges. Do not widen that trust without a reverse-proxy security review.

## Tests and handoff

- Put optimizer and calendar regression tests in the existing focused test classes. Update `ApiIntegrationTests` for endpoint status, request validation, and response contract behavior.
- Integration tests replace PostgreSQL with an isolated EF Core in-memory store and use the `Testing` environment; keep this setup viable when changing registrations or startup behavior.
- Tell the front-end agent about any request/response, endpoint, country-schema, day-type, token, or deep-link change. Update `src/types/models.ts`, API functions, and country-specific clients together.

Run from the repository root:

```bash
dotnet test
dotnet build
```
