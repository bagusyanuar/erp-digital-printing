#!/bin/sh
set -e

# File tujuan tempat env-config.js akan disimpan
ENV_JS_FILE="/usr/share/nginx/html/env-config.js"

# Mulai membuat objek window.__ENV__
echo "window.__ENV__ = {" > "$ENV_JS_FILE"

# Baca semua environment variables, filter yang berawalan VITE_ (atau sesuaikan jika perlu)
# Format menjadi JSON/Object property
env | grep "^VITE_" | while read -r line; do
  # Pisahkan key dan value
  key=$(echo "$line" | cut -d '=' -f 1)
  value=$(echo "$line" | cut -d '=' -f 2-)
  
  # Escape double quotes di dalam value untuk mencegah JS syntax error
  escaped_value=$(echo "$value" | sed 's/"/\\"/g')
  
  # Tulis ke file
  echo "  \"$key\": \"$escaped_value\"," >> "$ENV_JS_FILE"
done

# Tutup objek JS
echo "};" >> "$ENV_JS_FILE"

# Jalankan perintah CMD bawaan Dockerfile (misal: nginx -g "daemon off;")
exec "$@"
