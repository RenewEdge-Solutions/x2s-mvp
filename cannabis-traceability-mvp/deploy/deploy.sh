#!/usr/bin/env bash
set -euo pipefail

# Usage: copy this repo to the server (e.g., /srv/s2s-mvp) and run ./deploy.sh
# This script does not modify your production site config. It only starts the Docker stack and shows test curl commands.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo "No .env file found — creating .env from .env.example with placeholder values."
    cp .env.example .env
    echo
    echo "IMPORTANT: You must edit .env and set real secrets before using this in production."
    echo "Continuing with values from .env.example (placeholders) — abort now to edit the file."
    echo
    sleep 2
  else
    echo "Create .env from .env.example and fill secrets. Aborting." >&2
    exit 1
  fi
fi

echo "Building and starting auth stack..."
docker compose -f docker-compose.auth.prod.yml --env-file .env up -d --build

echo "Stack started. Test oauth2-proxy locally (should redirect to Keycloak):"

echo "curl -v --header \"Host: s2s-mvp.renewedge-solutions.com\" http://127.0.0.1:4180/"

echo "When ready, add the nginx site files from deploy/nginx/ to /etc/nginx/sites-available/ then symlink and reload nginx."

echo "Remember to obtain TLS certs for auth.renewedge-solutions.com and s2s-mvp.renewedge-solutions.com before exposing to public internet."
