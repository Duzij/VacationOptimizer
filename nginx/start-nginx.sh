#!/bin/sh

set -eu

CERT_PATH="/etc/nginx/ssl/longvacation.eu.pem"
KEY_PATH="/etc/nginx/ssl/longvacation.eu.key"
TARGET_CONF="/etc/nginx/conf.d/default.conf"

if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
    cp /etc/nginx/templates/default.ssl.conf "$TARGET_CONF"
else
    cp /etc/nginx/templates/default.http.conf "$TARGET_CONF"
fi

exec nginx -g "daemon off;"
