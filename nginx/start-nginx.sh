#!/bin/sh

set -eu

CERT_PATH="/etc/letsencrypt/live/longvacation.eu/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/longvacation.eu/privkey.pem"
TARGET_CONF="/etc/nginx/conf.d/default.conf"

if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
    cp /etc/nginx/templates/default.ssl.conf "$TARGET_CONF"
else
    cp /etc/nginx/templates/default.http.conf "$TARGET_CONF"
fi

exec nginx -g "daemon off;"
