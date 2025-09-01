# 🌿 Cannabis Traceability MVP

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A full-stack MVP for cannabis traceability with role-based dashboards, calendars, inventory, integrity (hashing), and demo data. Runs locally with Docker or directly.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [✨ Features](#-features)
- [📁 Project Structure](#-project-structure)
- [🔧 Backend Setup](#-backend-setup)
- [🎨 Frontend Setup](#-frontend-setup)
- [🐳 Docker Setup](#-docker-setup)
- [📊 Demo Accounts](#-demo-accounts)
- [📝 Notes](#-notes)
- [🔍 Troubleshooting](#-troubleshooting)
- [🗺️ Roadmap](#️-roadmap)
- [📚 Documentation](#-documentation)

## 🚀 Quick Start

1. Clone and start
   ```bash
   git clone https://github.com/RenewEdge-Solutions/x2s-mvp.git
   cd x2s-mvp/cannabis-traceability-mvp
   docker compose up --build
   ```

2. Access services
   - Regulator Frontend: http://localhost:2000 (Vite dev on 5000 inside container, HMR: 24679)
   - Auditor Frontend: http://localhost:4000
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5433 (container 5432)

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | NestJS 10 + TypeORM + PostgreSQL |
| Frontends | React 18 + Vite + TypeScript + Tailwind CSS |
| Database | PostgreSQL 14 |
| Container | Docker Compose |
| Docs | Swagger |

## ✨ Features

- Authentication & roles (mock 2FA). Roles: Operator, Grower, Shop, Lab, Regulator, Auditor
- Dashboards, lifecycle explorer, integrity hashing, calendars, inventory

Recent MVP updates (mocked, bill-aligned):
- Regulator dashboard: comprehensive hardcoded oversight (KPIs, licensing, applications, compliance alerts, enforcement, recalls, lab oversight, manifests, blockchain integrity, tasks, reporting links)
- Regulator calendar: realistic mock events aligned with dashboard (inspections, hearings, recalls, lab follow-ups, manifests, renewals)
- Regulator notifications: database calls removed; hardcoded alerts/tasks matching dashboard
- Calendars: consistent icon-only toolbar buttons (Today, Sync, Add) and scrollable day cells (max ~3 visible events) across regulator, farmer, and auditor
- Auditor calendar: button order set to “Sync” then “Add”
- Farmer calendar: event create/update aligned to API schema; resilient mapping for custom events
- Regulator reports: page aligned to the bill with grouped, static report categories; mock download and snapshot actions

## 📁 Project Structure

```
x2s-mvp/
├── cannabis-traceability-mvp/
│   ├── backend/              # NestJS API server (3001)
│   ├── regulator-frontend/   # Regulator app (host 2000 → container 5000, HMR 24679)
│   ├── auditor-frontend/     # Auditor app (host 4000)
│   ├── frontend/             # Farmer/Operator app (local dev 3000)
│   └── docker-compose.yml
├── docs/
└── README.md
```

## 🔧 Backend Setup

Create `backend/.env` with:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=trace_user
POSTGRES_PASSWORD=trace_password
POSTGRES_DB=traceability
PORT=3001
```

Run locally:

```bash
cd cannabis-traceability-mvp/backend
npm install
npm run build
npm run start:dev
```

Swagger: http://localhost:3001/docs

Seed demo data:

```bash
cd cannabis-traceability-mvp/backend
npm run seed
```

## 🎨 Frontend Setup (local, optional)

```bash
cd cannabis-traceability-mvp/regulator-frontend && npm install && npm run dev
cd cannabis-traceability-mvp/auditor-frontend && npm install && npm run dev
cd cannabis-traceability-mvp/frontend && npm install && npm run dev
```

Google Maps (optional): set `VITE_GOOGLE_MAPS_API_KEY` in each frontend `.env`.

## 🐳 Docker Setup

```bash
cd cannabis-traceability-mvp
docker compose up --build
```

Mapped ports:
- Regulator Frontend: 2000 → 5000 (HMR 24679)
- Auditor Frontend: 4000 → 4000
- Backend API: 3001 → 3001
- PostgreSQL: 5433 → 5432
 - Farmer/Operator Frontend: run locally at http://localhost:3000 (not in docker-compose)

## 📊 Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Operator | Daniel.Veselski | pass123 |
| Grower | grower1 | pass123 |
| Shop | shop1 | pass123 |
| Lab | lab1 | pass123 |
| Regulator | regulator1 | pass123 |
| Auditor | auditor1 | pass123 |

## 📝 Notes

- macOS may reserve port 5000 for AirPlay. We map the regulator app to host port 2000 to avoid conflicts
- If another Vite app is running, ensure HMR ports don’t clash (regulator uses 24679)

## 🔍 Troubleshooting

- Database: ensure host 5433 is free; container exposes 5432
- Backend: http://localhost:3001 should be reachable; check `docker compose logs backend`
- Regulator Frontend: if hot reload loops, verify HMR port 24679 is free and exposed
- Google Maps: set `VITE_GOOGLE_MAPS_API_KEY` and allow localhost referrers

## 🗺️ Roadmap

- [ ] POS flows for Shop role
- [ ] Lab result entry and COA hashing
- [ ] Enhanced role guards
- [ ] ICS calendar export; Week/Day calendar views
- [ ] Transfer/manifest management
- [ ] Regulator audit tools

## 📚 Documentation

- [High Level Architecture](docs/High%20Level%20Architecture%20Text.docx)
- [Domain Architecture](docs/Domain%20Architecture%20Cannabis%20Text.docx)
- [Security & Audit Architecture](docs/Security%20and%20Audit%20Architecture.docx)
- [Offline Sync Architecture](docs/Offline%20Sync%20Architecture.docx)
- [Tech Stack](docs/Tech%20Stack.docx)

---

Built with ❤️ by RenewEdge Solutions
