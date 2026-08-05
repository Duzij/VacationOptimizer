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

### 1.1 Server

- Docker and Docker Compose plugin installed
- DNS for your domain pointing to the server IP
- Ports `22` (SSH) and `443` (HTTPS) open on the server
- A server user with SSH key access (the workflow uses `root` by default)

### 1.2 GitHub repository secrets

The deployment workflow (`.github/workflows/hetzner.yml`) expects the following repository secrets:

| Secret | Purpose |
|--------|---------|
| `SERVER_IP` | IP address of the target server |
| `SSH_PRIVATE_KEY` | Private key for SSH authentication to the server |
| `TOKEN` | GitHub Personal Access Token with `repo` scope (used to clone the repository on the server) |
| `RESULT_TOKEN_SIGNING_KEY` | Strong secret key for signing optimization result tokens. **Required in Production.** |
| `DATABASE_SECURITY_HEALTHCHECK_ACCESS_TOKEN` | UUID that protects the database security report endpoint |
| `CF_ORIGIN_CERT` | TLS certificate content (e.g., Cloudflare Origin CA certificate PEM) |
| `CF_ORIGIN_KEY` | TLS private key content corresponding to the certificate |

### 1.3 Local `.env` file

For local development, create a `.env` file in the project root. It is intentionally not committed.

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=vacation_optimizer
DATABASE_SECURITY_HEALTHCHECK_ACCESS_TOKEN=<uuid>
```

Generate the UUID with:

```bash
uuidgen | tr '[:upper:]' '[:lower:]'
```

Without a valid UUID, the report endpoint stays disabled and returns `404`.

In production, the deployment workflow recreates the `.env` file automatically from repository secrets.

### 1.4 Domain customization

The following files contain hard-coded domain references (currently `longvacation.eu`) that must be updated for your own domain before deploying:

- `.github/workflows/hetzner.yml` — health check URLs and `--resolve` targets
- `nginx/templates/default.ssl.conf` — `server_name` and certificate paths
- `nginx/templates/default.http.conf` — `server_name`
- `nginx/start-nginx.sh` — certificate file paths

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
