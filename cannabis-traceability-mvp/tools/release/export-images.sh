#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../" # repo/cannabis-traceability-mvp

echo "Building images..."
docker compose build

echo "Saving images to cannabis-mvp-images.tar..."
IMAGES=$(docker compose config --images)
docker image save $IMAGES -o cannabis-mvp-images.tar
ls -lh cannabis-mvp-images.tar

echo "Creating bundle zip..."
BUNDLE_DIR=../mvp-bundle
rm -rf "$BUNDLE_DIR" && mkdir -p "$BUNDLE_DIR"
cp docker-compose.yml "$BUNDLE_DIR/compose.yml"
cp cannabis-mvp-images.tar "$BUNDLE_DIR/"
cat > "$BUNDLE_DIR/QUICKSTART.txt" <<'TXT'
MVP Bundle (Docker Desktop)
---------------------------------
Files:
- cannabis-mvp-images.tar  (prebuilt images)
- compose.yml              (Docker Compose to run all apps)

Steps:
1) In Docker Desktop: Images > Load > select cannabis-mvp-images.tar
2) In Docker Desktop: Containers > Create from compose > select compose.yml
3) Click Run. Apps:
   - Welcome:    http://localhost:9000
   - Regulator:  http://localhost:9001
   - Auditor:    http://localhost:9002
   - Farmer:     http://localhost:9003
   - Retail:     http://localhost:9004
   - Laboratory: http://localhost:9005
Credentials: Username (Regulator|Auditor|Farmer|Retail|Laboratory), Password 1234
TXT

(cd "$BUNDLE_DIR" && zip -r ../cannabis-mvp-bundle.zip .)
ls -lh ../cannabis-mvp-bundle.zip
echo "Done: cannabis-mvp-bundle.zip created at repo root."
