# Vacation Optimizer Docker Deploy

This project is deployed with `docker compose`.

For local development with hot reload, use `docker-compose.dev.yaml` instead of the production stack.

The stack includes:
- `vacation-app` (application)
- `postgres` (database)
- `nginx` (reverse proxy)
- `certbot` (manual certificate issuance/renewal; not started by default)

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
- DNS for `optimize-vacation-for.me` pointing to the server IP
- Ports `80` and `443` open on the server
- A valid `.env` file in the project root

## 2. First-time startup (works without TLS certs)

From the project root:

```bash
docker compose up -d --build
```

Important behavior:
- If certificates are missing in `./certbot/conf`, nginx serves HTTP only.
- Once certificates exist, nginx automatically switches to HTTPS config on restart.

## 3. Issue the first Let's Encrypt certificate

Run certbot manually (the `certbot` service uses a profile and does not auto-start):

```bash
docker compose run --rm --profile certbot certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  -d optimize-vacation-for.me \
  --email pavelpavelpetrpetr@gmail.com \
  --agree-tos \
  --no-eff-email
```

Then restart nginx:

```bash
docker compose restart nginx
```

## 4. Renewal automation (production)

Open crontab:

```bash
crontab -e
```

Add:

```cron
0 3 * * * cd /root/vacation-app && docker compose run --rm --profile certbot certbot renew && docker compose restart nginx
```

## 5. Useful operations

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

Stop:

```bash
docker compose down
```

Stop and remove volumes (danger: deletes local DB data):

```bash
docker compose down -v
```
