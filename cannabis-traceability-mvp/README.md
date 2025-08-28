# Cannabis Traceability MVP

A local, containerized MVP web app demonstrating cannabis seed-to-sale traceability concepts with a simple Apple-style UI.

- Backend: NestJS (TypeScript) + TypeORM + PostgreSQL (dev sync enabled)
- Frontend: React (TypeScript) + Vite + Tailwind CSS
- Auth: Mock login + mock 2FA; roles: Regulator, Operator, Auditor

## Quick Start

1) Copy environment file

```
cp backend/.env.example backend/.env
```

2) Build and run

```
docker compose up --build
```

- App: http://localhost:3000
- API: http://localhost:3001

### Credentials

- regulator1 / pass123
- operator1 / pass123
- auditor1 / pass123
- 2FA: any 6 digits (mock)

## Features

- Role dashboards (mock KPIs/alerts)
- Operator wizard: Plant seed, then Harvest crop
- Lifecycle Explorer: merged timeline of plant + harvest events
- Blockchain Integrity: server SHA-256 hashes for events; verify locally in browser

## Notes

- TypeORM synchronize=true for dev only.
- Data is minimal; fixture users and simple entities exist to prove DB connectivity.
- No real JWT; mock token is used purely for demo.

## Tech

- Ports: frontend 3000, backend 3001, postgres 5432
- TypeScript everywhere
- Tailwind for styling; minimal, accessible, responsive UI

## Example Flow

1. Login as operator1 / pass123 (2FA: any 6 digits)
2. Open Wizard
3. Plant seed (strain + location) → see server-computed hash
4. Harvest from the created plant → see server-computed hash
5. Explore Lifecycle and Blockchain Integrity views

## Limitations

- Mock authentication without persistent sessions.
- Minimal validation and error handling.
- Not production hardened; for demonstration only.
