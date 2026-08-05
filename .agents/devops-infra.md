# DevOps and infrastructure agent

## Scope

Own the production and development delivery paths:

- `Dockerfile`
- `docker-compose.yaml` and `docker-compose.dev.yaml`
- `nginx/`
- `.github/workflows/hetzner.yml`
- operational guidance in `README.MD`

## Deployment architecture

Production has four Compose services:

- `vacation-app`: the .NET 10 application, exposed only to the Compose network on port 80.
- `postgres`: PostgreSQL 15 on the internal network with the `pgdata` named volume; it must not have a public host port.
- `nginx`: the only public entry point, publishing ports 80 and 443, terminating TLS, and proxying to `vacation-app`.
- `certbot`: an opt-in profile for issuance/renewal, sharing `certbot/www` and `certbot/conf` with Nginx.

The Dockerfile first builds the client with Node 22, then publishes the server with the .NET 10 SDK. Do not make production depend on a host `node_modules`, a runtime frontend dev server, or unbuilt `wwwroot` files.

`docker-compose.dev.yaml` deliberately differs: Vite hot reload runs on port 3001, `dotnet watch` on port 8080, and PostgreSQL binds only to `127.0.0.1:5432`. Preserve this split and keep the Vite proxy target as `vacation-app-dev:8080`.

## Nginx and domain contract

- `start-nginx.sh` selects the HTTP template until the `longvacation.eu` certificate and private key exist; then it selects the HTTPS template.
- `nginx/conf.d/default.conf` is included by both templates. It handles ACME challenges, proxies `/api` and `/app`, caches Vite-hashed assets for one year, and deliberately disables access logs for `/api/internal/database-security` because its access key is a query parameter.
- Preserve `Host`, `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto` proxy headers. The server relies on them for safe forwarded-header and country-detection behavior.
- The HTTPS template also redirects `optimize-vacation-for.me` and `www.optimize-vacation-for.me` to `longvacation.eu`; it references certificates for those names. Any domain or certificate change must update the template, Certbot issuance, DNS, and operational docs as one change.

## Secrets, database lifecycle, and workflow

- `.env` supplies `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `DATABASE_SECURITY_HEALTHCHECK_ACCESS_TOKEN`. The GitHub workflow writes `Optimization__ResultTokenSigningKey` from repository secrets on the server. Never commit actual values or print them in CI logs.
- Production startup uses `EnsureCreated`, not EF `Migrate`. A schema change needs an explicit, non-destructive plan for databases that already exist; do not assume `docker compose up --build` will apply a migration.
- Pushes to `main` run `.github/workflows/hetzner.yml`, which SSHes to the Hetzner host, refreshes `/root/vacation-app`, recreates `.env`, runs Compose, bootstraps the main TLS certificate if missing, and probes `https://longvacation.eu/app` locally. Workflow edits must retain this fresh-host and repeat-deploy behavior.
- Keep application health checks separate from the protected database-security report: the latter is not a general public health endpoint and must retain its proxy log exclusion.
- `GET /health` is the public liveness endpoint. The `vacation-app` Compose healthcheck probes it from inside the container with bash `/dev/tcp` (the aspnet runtime image has no curl/wget), nginx waits for `service_healthy`, and the deployment workflow probes `/health` through nginx. Do not rename or protect this route; the SPA fallback must never be mistaken for a health signal again.

## Validation and safe operation

Run from the repository root when the affected tools are available:

```bash
docker compose -f docker-compose.dev.yaml config
docker compose config
docker build -t vacation-optimizer:local .
```

For proxy edits, also validate the selected config in a container with `nginx -t`. For an end-to-end local check, use the development stack and visit Vite on `http://localhost:3001` plus the API at `http://localhost:8080`.

Do not run `docker compose down -v`, remove named volumes, alter production certificates, or execute the deployment workflow against a live host without explicit approval. State any required DNS, firewall, secret, certificate, or data-migration action in the handoff.
