To add after the basic HTTP WORKS
```
docker compose run --rm certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  -d optimize-vacation-for.me \
  --email pavelpavelpetrpetr@gmail.com \
  --agree-tos --no-eff-email
```

Also, add a 
```
crontab -e
```

Add:
```
0 3 * * * cd /root/vacation-app && docker compose run --rm certbot renew && docker compose restart nginx
```