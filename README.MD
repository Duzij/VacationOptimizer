# Vacation Optimizer Docker Deploy

This project is deployed with `docker compose`.

For local development with hot reload, use `docker-compose.dev.yaml` instead of the production stack.

The stack includes:
- `vacation-app` (application)
- `postgres` (database)
- `nginx` (reverse proxy)

Nginx config note:
- Edit [`nginx/conf.d/default.conf`](/Users/admin/DEV/W001/VacationOptimizer/nginx/conf.d/default.conf) for application routes and proxy rules.
- The container generates the live server block from the templates and includes that file, so deploys now pick up changes there reliably.

## 0. Local development (hot reload in containers)

Why old FE appears with `docker compose up -d`:
- `docker-compose.yaml` is production-style and serves built frontend files from the app image.

Use the dev stack:

```bash
docker compose -f docker-compose.dev.yaml up -d
```

Open:
- Frontend (Vite HMR): `http://localhost:3001`
- Backend API: `http://localhost:8080`
- PostgreSQL (host-only): `127.0.0.1:5432`

Dev logs:

```bash
docker compose -f docker-compose.dev.yaml logs -f vacation-app-dev frontend-dev postgres
```

Stop dev stack:

```bash
docker compose -f docker-compose.dev.yaml down
```

## 1. Prerequisites

- Docker and Docker Compose plugin installed
- DNS for `longvacation.eu` pointing to the server IP
- Ports `22` and `443` open on the server, the rest are closed by custom firewall
- A valid `.env` file in the project root

Update `.env` from `.env.example`, set a strong database password, and generate a unique UUID for the security-report endpoint before starting production:

```bash
cp .env.example .env
uuidgen | tr '[:upper:]' '[:lower:]'
```

Set the generated value as `DATABASE_SECURITY_HEALTHCHECK_ACCESS_TOKEN` in `.env`. It is intentionally not committed. Without a valid UUID, the report endpoint stays disabled and returns `404`.

## 2. First-time startup (works without TLS certs)

From the project root:

```bash
docker compose up -d --build
```

Important behavior:
- If certificates are missing in `./certbot/conf`, nginx serves HTTP only.
- Once certificates exist, nginx automatically switches to HTTPS config on restart.
- PostgreSQL is not published publicly in the production stack.
- The application container is only reachable through `nginx` inside the Compose network.

## 3. Provision the first TLS certificate

Cloudflare Origin Certificate is used. After creating one with a 10-year validity, copy the `.pem` and `.key` files to the server:

```bash
scp longvacation.eu.pem root@hetzner:/root/vacation-app/nginx/ssl
scp longvacation.eu.key root@hetzner:/root/vacation-app/nginx/ssl
```

Then restart nginx:

```bash
docker compose restart nginx
```

## 4. Certificate renewal

Cloudflare Origin Certificates are valid for 10 years and do not require automated renewal.

## 5. Useful operations

### Database security report

The application runs a read-only PostgreSQL role and connection audit at startup and then every 15 minutes. It checks login roles, elevated privileges, memberships in sensitive built-in PostgreSQL roles, and remote client connections. The endpoint only serves the last completed report; it never triggers database inspection itself.

Request it with the UUID stored in `.env`:

```bash
curl --fail --silent --show-error \
  "https://longvacation.eu/api/internal/database-security?accessKey=${DATABASE_SECURITY_HEALTHCHECK_ACCESS_TOKEN}"
```

Three invalid UUID attempts from one client IP start a 15-minute cooldown. Invalid requests always receive `404`; a valid UUID during its own cooldown receives `429` with `Retry-After`. Nginx disables access logging for this endpoint so the query-string token is not placed in its access log. Avoid opening the URL in a browser or sharing it, since query strings can still end up in browser history.

Start:

```bash
docker compose up -d
```

Rebuild and start:

```bash
docker compose up -d --build
```

Logs:

```bash
docker compose logs -f vacation-app nginx postgres
```

Remove postgres data volume (danger: deletes local DB data):

```bash
docker compose stop postgres; docker compose rm -f postgres; docker volume rm vacation-app_pgdata
```

Stop:

```bash
docker compose down
```

Stop and remove volumes (danger: deletes local DB data):

```bash
docker compose down -v
```

## 6. Reset PostgreSQL completely

Use this when you want a fully clean database after rewriting migrations or seed data.

Production-style stack:

```bash
docker compose down -v
docker volume rm vacationoptimizer_pgdata 2>/dev/null || true
docker compose up -d --build
```

Local dev hot-reload stack:

```bash
docker compose -f docker-compose.dev.yaml down -v
docker volume rm vacationoptimizer_pgdata-dev 2>/dev/null || true
docker compose -f docker-compose.dev.yaml up -d
```

If you want to remove only the PostgreSQL container and volume:

```bash
docker compose stop postgres
docker compose rm -f postgres
docker volume rm vacationoptimizer_pgdata
docker compose up -d postgres
```
