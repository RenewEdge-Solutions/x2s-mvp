# Cannabis Traceability MVP

A full‑stack MVP for cannabis traceability with role‑based dashboards, calendar, inventory, integrity (hashing), and demo data. Runs locally with Docker or directly.

## Stack
- Backend: NestJS 10 + TypeORM (PostgreSQL), Swagger docs, seed script
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS, React Router
- DB: PostgreSQL 14
- Container: Docker Compose (optional)

## Features
- Auth (mock) with 2FA prompt, user profiles, roles
  - Roles: Operator, Grower, Shop, Lab, Regulator, Auditor
- Modules: Cannabis (UI complete); Alcohol/Mushrooms/Explosives (stubs)
- Dashboards
  - KPIs: Active plants, Vegetative, Flower, Drying (count), Harvested (plants), Storage (g), Sold (g, per‑period), Revenue (per‑period)
    - Period options: Last 24 hours, Last 7 days, Last month, Last 3 months, Last 6 months, Year‑to‑date, Last year, Year before last (data clamped to 2025+)
  - Shortcuts: grouped by urgency — Urgent (red) and Soon (yellow); per‑location actions like “Harvest Greenhouse 3”, “Flip plants in Indoor Room 2”
    - Exactly 3 items visible per column; scroll for more. No counts/parentheses in labels.
  - Recent activity: 3 feeds (Plant, Drying & Storage, Harvest & Revenue) with exactly 3 rows visible; scroll for more
  - Upcoming: vertical list (one day per row), ~3 days visible; scroll for more
    - “Open calendar” appears inline as the last row once you scroll to the end
- Calendar (month grid): plant/harvest/drying/check events with hover details
- Inventory: plants in production, harvest lots, supplies, packaging
- Integrity: blockchain‑style hashing view (visible to Regulator/Auditor)
- Event History: lifecycle explorer (renamed from Lifecycle)

## Repo layout
```
/ (this README)
├─ cannabis-traceability-mvp/
│  ├─ backend/        # NestJS API + TypeORM + Swagger + seed
│  └─ frontend/       # React + Vite + Tailwind UI
└─ docs/              # Architecture and proposal docs
```

## Backend
- Port: 3001 (configurable via PORT)
- Swagger: http://localhost:3001/docs
- Entities: Plant, Harvest, User
- Notable endpoints: /plants, /harvests, /lifecycle, /integrity, /auth

### Config
Backend reads env from `.env.local` (first) and `.env`:
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=trace_user
POSTGRES_PASSWORD=trace_password
POSTGRES_DB=traceability
PORT=3001
```

### Dev run (local)
```
cd cannabis-traceability-mvp/backend
npm install
npm run build
npm run start:dev
```

### Seed demo data
Creates ~250 plants across 20 greenhouses + 5 indoor rooms, drying/dried harvests, and leaves some plants harvest‑pending.
```
cd cannabis-traceability-mvp/backend
npm run seed
```

## Frontend
- Port: 5173 (default Vite); configured in docker compose to 5173

### Dev run (local)
```
cd cannabis-traceability-mvp/frontend
npm install
npm run dev
```
Open the URL Vite prints (commonly http://localhost:3000 or http://localhost:5173)

### Accounts
- Operator: Daniel.Veselski / pass123
- Grower: grower1 / pass123
- Shop: shop1 / pass123
- Lab: lab1 / pass123
- Regulator: regulator1 / pass123
- Auditor: auditor1 / pass123

## Docker (optional)
A compose stack runs db, backend, and frontend. Ensure DB port mapping (host 5433 -> container 5432). If compose isn’t present, run services individually as above.

## Notes
- Integrity view is hidden/blocked for Operator/Grower/Shop/Lab; visible for Regulator/Auditor.
- Calendar and KPIs use simple heuristics for veg/flower thresholds and revenue estimates; configurable later.
- Alcohol/Mushrooms/Explosives modules are placeholders.
 - Top nav shows: Dashboard, Plants, Inventory, Calendar, then notifications and user menu.

## Scripts
- Backend
  - build: compile TypeScript
  - start: run Nest
  - start:dev: watch mode
  - seed: populate demo data
- Frontend
  - dev: start Vite dev server
  - build: typecheck + build
  - preview: preview build

## Troubleshooting
- Seeding can fail if DB isn’t reachable. Use `.env.local` to set `POSTGRES_HOST=localhost` and `POSTGRES_PORT=5433` (host mapping).
- If ports are busy, adjust frontend (5173), backend (3001), and DB (5433) in your environment.

## Roadmap
- POS flows (Shop) and Lab result entry + COA hashing
- Backend role guards beyond Integrity
- Rich notifications; ICS export; week/day calendar views
- Transfers/manifests and regulator audit tools
