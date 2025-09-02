# 🌿 Cannabis Traceability MVP

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

Role-based, frontend-only MVP for cannabis traceability. Multiple Vite/React apps with a central Welcome page. Backend and database have been removed for this demo.

## 🚀 Quick Start

1) Clone and start the stack

```bash
git clone https://github.com/RenewEdge-Solutions/x2s-mvp.git
cd x2s-mvp/cannabis-traceability-mvp
docker compose up --build
```

2) Open apps
- Welcome: http://localhost:9000
- Regulator: http://localhost:9001 (HMR 24679)
- Auditor: http://localhost:9002
- Farmer: http://localhost:9003 (run locally; not containerized)
- Shop: http://localhost:9004 (HMR 24680)
- Laboratory: http://localhost:9005 (HMR 24681)

## 🛠️ Tech Stack

- Frontends: React 18 + Vite + TypeScript + Tailwind CSS
- Dev Orchestration: Docker Compose

## 📁 Project Structure

```
x2s-mvp/
├── cannabis-traceability-mvp/
│   ├── regulator-frontend/   # :9001
│   ├── auditor-frontend/     # :9002
│   ├── farmer-frontend/      # :9003 (local only)
│   ├── shop-frontend/        # :9004
│   ├── laboratory-frontend/  # :9005
│   ├── welcome-frontend/     # :9000 (landing)
│   └── docker-compose.yml
├── docs/
└── README.md
```

## 🎨 Run Frontends Locally (without Docker)

In separate terminals from `cannabis-traceability-mvp/`:

```bash
cd welcome-frontend && npm install && npm run dev    # http://localhost:9000
cd regulator-frontend && npm install && npm run dev  # http://localhost:9001
cd auditor-frontend && npm install && npm run dev    # http://localhost:9002
cd shop-frontend && npm install && npm run dev       # http://localhost:9004
cd laboratory-frontend && npm install && npm run dev # http://localhost:9005
```

Notes:
- Farmer frontend is not yet wired in Docker; run it locally at http://localhost:9003 if needed.
- Set `VITE_GOOGLE_MAPS_API_KEY` in each frontend `.env` to enable Maps features.

## 🔍 Troubleshooting

- If hot reload loops, ensure HMR ports (24678–24681) aren’t in use by other processes.
- If Docker bind fails, ensure host ports 9000–9005 are free.

## 📚 Documentation

- High Level Architecture: `docs/High Level Architecture Text.docx`
- Domain Architecture: `docs/Domain Architecture Cannabis Text.docx`
- Security & Audit Architecture: `docs/Security and Audit Architecture.docx`
- Offline Sync Architecture: `docs/Offline Sync Architecture.docx`
- Tech Stack: `docs/Tech Stack.docx`

—

Built by RenewEdge Solutions
