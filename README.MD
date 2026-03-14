# Vacation Optimizer Docker Deploy

This project is deployed with `docker compose`.

The stack includes:
- `vacation-app` (application)
- `postgres` (database)
- `nginx` (reverse proxy)
- `certbot` (manual certificate issuance/renewal; not started by default)

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
