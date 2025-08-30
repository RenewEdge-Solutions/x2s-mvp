# 🌿 Cannabis Traceability MVP

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A full-stack MVP for cannabis traceability with role-based dashboards, calendar, inventory, integrity (hashing), and demo data. Runs locally with Docker or directly.

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

1. **Clone the repository**
   ```bash
   git clone https://github.com/RenewEdge-Solutions/x2s-mvp.git
   cd x2s-mvp
   ```

2. **Run with Docker (Recommended)**
   ```bash
   cd cannabis-traceability-mvp
   docker compose up --build
   ```
   - App: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:3001](http://localhost:3001)

3. **Or run locally**
   - Follow [Backend Setup](#-backend-setup) and [Frontend Setup](#-frontend-setup)

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | NestJS 10 + TypeORM + PostgreSQL |
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Database** | PostgreSQL 14 |
| **Container** | Docker Compose |
| **Documentation** | Swagger |

## ✨ Features

### 🔐 Authentication & Roles
- Mock authentication with 2FA prompt
- User profiles and role-based access
- **Roles**: Operator, Grower, Shop, Lab, Regulator, Auditor

### 📊 Dashboards
- **KPIs**: Active plants, Vegetative, Flower, Drying, Harvested, Storage, Sold, Revenue
- **Shortcuts**: Urgent (🔴) and Soon (🟡) actions per location
- **Recent Activity**: Plant, Drying & Storage, Harvest & Revenue feeds
- **Upcoming Events**: Vertical calendar view

### 📅 Calendar
- Month grid view with plant/harvest/drying/check events
- Hover details for event information

### 📦 Inventory Management
- Plants in production tracking
- Harvest lots management
- Supplies and packaging inventory

### 🔒 Integrity Verification
- Blockchain-style hashing view
- Visible only to Regulator/Auditor roles

### 📈 Event History
- Lifecycle explorer for plant and harvest events

## 📁 Project Structure

```
x2s-mvp/
├── cannabis-traceability-mvp/
│   ├── backend/          # NestJS API server
│   ├── frontend/         # React application
│   └── docker-compose.yml
├── docs/                 # Architecture & proposal docs
└── README.md
```

## 🔧 Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14

### Configuration
Create `.env` file in `backend/` directory:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=trace_user
POSTGRES_PASSWORD=trace_password
POSTGRES_DB=traceability
PORT=3001
```

### Running Locally

```bash
cd cannabis-traceability-mvp/backend
npm install
npm run build
npm run start:dev
```

### API Documentation
- Swagger UI: [http://localhost:3001/docs](http://localhost:3001/docs)
- Key endpoints: `/plants`, `/harvests`, `/lifecycle`, `/integrity`, `/auth`

### Seeding Demo Data

```bash
cd cannabis-traceability-mvp/backend
npm run seed
```

Creates ~250 plants across 20 greenhouses + 5 indoor rooms with demo data.

## 🎨 Frontend Setup

### Prerequisites
- Node.js 18+

### Running Locally

```bash
cd cannabis-traceability-mvp/frontend
npm install
npm run dev
```

Open the URL displayed (usually [http://localhost:5173](http://localhost:5173))

### Google Maps Integration
For location features, set up Google Maps API:

1. Create `.env` in `frontend/`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

2. Enable APIs: Maps JavaScript API, Places API, Geocoding API

3. Add referrer restrictions for localhost

## 🐳 Docker Setup

```bash
cd cannabis-traceability-mvp
docker compose up --build
```

Services:
- **Frontend**: Port 3000
- **Backend**: Port 3001
- **Database**: Port 5432 (mapped to host 5433)

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

- Integrity view is restricted to Regulator/Auditor roles
- Calendar and KPIs use configurable heuristics
- Alcohol/Mushrooms/Explosives modules are placeholders
- Navigation: Dashboard, Plants, Inventory, Calendar

## 🔍 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on port 5433
- Check `.env` configuration
- For Docker: verify port mapping

### Port Conflicts
- Frontend: 5173 (Vite default)
- Backend: 3001
- Database: 5433 (host) / 5432 (container)

### Google Maps Errors
- Verify API key is valid and unrestricted for localhost
- Check browser console for specific errors

## 🗺️ Roadmap

- [ ] POS flows for Shop role
- [ ] Lab result entry and COA hashing
- [ ] Enhanced role guards
- [ ] Rich notifications system
- [ ] ICS calendar export
- [ ] Week/Day calendar views
- [ ] Transfer/manifest management
- [ ] Regulator audit tools

## 📚 Documentation

- [High Level Architecture](docs/High%20Level%20Architecture%20Text.docx)
- [Domain Architecture](docs/Domain%20Architecture%20Cannabis%20Text.docx)
- [Security & Audit Architecture](docs/Security%20and%20Audit%20Architecture.docx)
- [Offline Sync Architecture](docs/Offline%20Sync%20Architecture.docx)
- [Tech Stack](docs/Tech%20Stack.docx)

---

**Built with ❤️ by RenewEdge Solutions**
