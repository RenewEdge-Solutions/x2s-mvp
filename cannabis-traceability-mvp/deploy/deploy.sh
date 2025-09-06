#!/usr/bin/env bash
set -euo pipefail

 # deploy.sh
 # Lightweight helper to start the auth stack on the server. It will NOT modify
 # nginx host config or TLS. Run this from the repository's root (or it will
 # change directory to the repo root automatically).

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
  cat <<-WARN
  No .env file found — creating .env from .env.example with placeholder values.

  IMPORTANT: Edit .env and set real secrets before using in production.
  The script will continue after a short pause; abort now (Ctrl+C) to edit.
  WARN
  cp .env.example .env
  sleep 2
  else
    echo "Create .env from .env.example and fill secrets. Aborting." >&2
    exit 1
  fi
fi

echo "Starting: docker compose (auth stack). This may take a few minutes..."
docker compose -f docker-compose.auth.prod.yml --env-file .env up -d --build

echo "Stack started. Test oauth2-proxy locally (should redirect to Keycloak):"

echo
echo "Stack started (or is starting). Helpful checks:" 
echo " - docker compose -f docker-compose.auth.prod.yml --env-file .env ps"
echo " - docker compose -f docker-compose.auth.prod.yml --env-file .env logs -f oauth2-proxy"
echo
echo "Quick test examples (replace hostnames as needed):"
echo "curl -I -L 'https://s2s-mvp.renewedge-solutions.com/'" 
echo "curl -i 'http://127.0.0.1:4180/oauth2/auth'" || true

echo
echo "If this is the first Keycloak run you must set the admin user in .env"
echo "and/or create a Keycloak admin via the container (see README-AUTH.md)."

exit 0
echo "When ready, add the nginx site files from deploy/nginx/ to /etc/nginx/sites-available/ then symlink and reload nginx."

echo "Remember to obtain TLS certs for auth.renewedge-solutions.com and s2s-mvp.renewedge-solutions.com before exposing to public internet."
