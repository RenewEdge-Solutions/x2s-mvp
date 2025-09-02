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
- Welcome Frontend: http://localhost:9000 (Landing)
- Regulator Frontend: http://localhost:9001 (HMR 24679)
- Auditor Frontend: http://localhost:9002
- Farmer Frontend: http://localhost:9003 (run locally; no docker service yet)
- Shop Frontend: http://localhost:9004 (HMR 24680)
- Laboratory Frontend: http://localhost:9005 (HMR 24681)

Notes:
- Ensure host ports 9000–9005 are free.
- HMR ports used: 24678 (welcome), 24679 (regulator), 24680 (shop), 24681 (lab).

## 🧪 Running Locally (without Docker)

Backend and database have been removed from this setup.

Frontends (in separate terminals):
```bash
cd welcome-frontend && npm install && npm run dev    # :9000
cd regulator-frontend && npm install && npm run dev  # :9001
cd auditor-frontend && npm install && npm run dev    # :9002
cd shop-frontend && npm install && npm run dev       # :9004
cd laboratory-frontend && npm install && npm run dev # :9005
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
