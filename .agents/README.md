# Vacation Optimizer agent guides

Vacation Optimizer is a single deployable application: an ASP.NET Core 10 API and a React 19/Vite client. The client is built into `VacationOptimizer.Server/wwwroot/dist` and served by the backend in production. PostgreSQL stores curated country, state, and holiday data; the `PublicHoliday` package supplies a fallback for countries without database data.

Use the guide that owns the primary change. A change that crosses a boundary must be coordinated and validated as one unit.

| Guide | Owns | Escalate to another guide when |
| --- | --- | --- |
| [feature-builder.md](feature-builder.md) | Describes that in case of a large-scale change need to start by creating a feature spec and a blog post later |
| [server.md](server.md) | API, optimizer, holiday data, EF Core, and .NET tests | An API contract, generated content endpoint, schema, or runtime configuration changes |
| [devops-infra.md](devops-infra.md) | Docker, Nginx, GitHub deployment, secrets, and production operation | The application build, ports, proxy behavior, database lifecycle, or required environment changes |
| [frontend-ux.md](frontend-ux.md) | React/Vite UI, client state, accessibility, routes, and frontend tests | A page depends on a changed API contract, country schema, or deployment path |

## Repository map

```text
VacationOptimizer.Server/
  Program.cs                     API composition, endpoints, SPA/static hosting
  Services/                      optimizer, calendar, holiday, tokens, security report
  CountrySpecific/               India, Spain, and Switzerland API extensions
  Data/ and Data/SeedData/       EF Core model and curated holiday data
  wwwroot/                       React/Vite source, static assets, and content
VacationOptimizer.Test/          xUnit unit and API integration tests
nginx/                           reverse-proxy includes and HTTP/HTTPS templates
Dockerfile                       production React build + .NET publish image
docker-compose*.yaml             production and hot-reload development stacks
.github/workflows/hetzner.yml   deployment on pushes to main
```

## Cross-cutting rules

- The deployed planner lives at `/app`; the Vite development entry point is `/`. Public content lives at `/`, `/about`, `/contact`, `/privacy`, and `/terms`.
- Treat an optimization response, its `resultToken`, and its `plannerSeed` as a compatible set. Result tokens are signed server-side and are used for shuffle history and deep-link restoration.
- Country-specific clients must call their own optimize/schema endpoints: `IN`, `ES`, and `CH` are rejected by the legacy `POST /api/vacations/optimize` route.
- Do not commit `.env`, generated `wwwroot/dist` output, certificates, or credentials. Share required environment keys and deployment steps in the handoff instead.
