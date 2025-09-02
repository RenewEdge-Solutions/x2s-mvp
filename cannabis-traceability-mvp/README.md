# 🌿 Cannabis Traceability MVP

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg)](https://www.typescriptlang.org/)

A local, containerized MVP web app demonstrating cannabis seed-to-sale traceability concepts with a simple Apple-style UI.

# 🧩 Cannabis Traceability MVP – App Stack

This folder contains multiple frontends for local development via Docker or direct node.

## 🚀 Quick Start (Docker)

```bash
docker compose up --build
```

Services and ports:
- Regulator Frontend: http://localhost:2000 (container 5000; HMR 24679)
- Auditor Frontend: http://localhost:4000
- Shop Frontend: http://localhost:9000 (HMR 24680)

Notes:
- macOS can reserve :5000 for AirPlay. Regulator app maps to :2000 to avoid conflicts.
- If you run another Vite app, ensure HMR ports don’t clash (regulator uses 24679).

## 🧪 Running Locally (without Docker)

Backend has been removed from this setup.

Frontends (in separate terminals):
```bash
cd regulator-frontend && npm install && npm run dev
cd auditor-frontend && npm install && npm run dev
```

## 🗺️ Google Maps Integration (optional)

Both frontends support Maps-based location picking.

1) Create `.env` in each frontend:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2) Enable in Google Cloud Console:
- Maps JavaScript API
- Places API
- Geocoding API

3) Add referrer restrictions:
- http://localhost:*/*
- http://127.0.0.1:*/*

## 📝 Recent UI Changes

- Regulator dashboard simplified to only show “Welcome, Regula Tor”.
- Regulator calendar keeps UI but shows an empty calendar (no DB-backed events).
- Auditor calendar adds mock “Add Event” and “Sync” buttons (local-only behavior).

1. 🔐 Login as `Farmer` / `1234` (2FA: any 6 digits)
2. 🧙‍♂️ Open Wizard
3. 🌱 Plant seed (select strain + location) → View computed hash
4. 🌾 Harvest from created plant → View updated hash
5. 📊 Explore Lifecycle and Blockchain Integrity views

## ⚙️ Configuration

### Ports
None specific beyond the frontends above.

### Development Notes
- Mock authentication (no persistent sessions)

## 🚨 Limitations

- Mock authentication without real session persistence
- Minimal validation and error handling
- Demonstration purposes only - not production ready

---

**Part of the RenewEdge Solutions Cannabis Traceability Suite**
