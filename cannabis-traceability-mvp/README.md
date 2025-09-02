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
- Welcome Frontend: http://localhost:9000 (HMR 24678)
- Regulator Frontend: http://localhost:9001 (HMR 24679)
- Auditor Frontend: http://localhost:9002 (HMR 24680)
- Farmer Frontend: http://localhost:9003 (container port 9000; HMR 24682)
 - Retail Frontend: http://localhost:9004 (HMR 24683)
 - Laboratory Frontend: http://localhost:9005 (HMR 24681)

Notes:
- Ensure host ports 9000–9005 are free.
- HMR ports: 24678 (welcome), 24679 (regulator), 24680 (auditor/retail), 24681 (lab), 24682 (farmer).

## 🧪 Running Locally (without Docker)

No backend or database is required. All data is mocked in-memory within each frontend for demo purposes.

Frontends (in separate terminals):
```bash
cd welcome-frontend && npm install && npm run dev    # :9000
cd regulator-frontend && npm install && npm run dev  # :9001
cd auditor-frontend && npm install && npm run dev    # :9002
cd farmer-frontend && npm install && npm run dev     # :9003
cd retail-frontend && npm install && npm run dev     # :9004
cd laboratory-frontend && npm install && npm run dev # :9005
```

## 🛍️ What’s new (Retail Frontend)

- POS
	- Simplified thermal-style receipt that prints via an in-page overlay (no extra windows/tabs). Uses window.print with afterprint cleanup.
	- Product grid constrained to exactly 3 visible rows; additional items scroll within the grid.
	- Customer DOB input enforces a maximum date of “today minus 18 years.”
	- Local image assets by SKU under `retail-frontend/public/images/products` with graceful fallback.
	- Inventory page now uses the same local SKU-based images for consistency.
	- Minor UI polish and consistent page header/title icon.

## ✨ What’s new (Regulator Frontend)

- Calendar
	- Farmer-only events removed (harvest, transplant, drying checks).
	- “Sync” and “New” buttons restyled to match the compact “Today” button.
	- New events must be assigned to an operator; add/edit modals include a required Operator selector.
- Operators
	- “Schedule inspection” and “Notice of deficiency” now open realistic modals with structured inputs and mock persistence.
	- Email hints removed from CTA labels for a cleaner, professional look.
- Reports
	- Buttons restyled to compact bordered style; snapshot creation shows a short processing delay then downloads an empty file.
	- Automated reports consolidated, with per-item downloads (csv/pdf) using mock blobs.
- Notifications
	- Redesigned dropdown: grouped by category with titles, timestamps, operator chips, unread indicators, and quick actions.
	- Realistic mock notifications synthesized (compliance, inspections, licensing, integrity, reports, capacity).
- Profile
	- Removed temporary API token section.
	- Cleaned “(mock)” from subtitles.
 - Page headers & icons
	- Standardized all page titles to a consistent H1 style (text-2xl font-semibold).
	- Ensured page-level titles include the same icon used in the navbar.
	- Integrity icon updated to a blockchain-like symbol (Boxes) everywhere.
	- Calendar icon color standardized to emerald in page titles.

## 🌾 What’s new (Farmer Frontend)

- Production
	- Quick actions use a right-side drawer for a focused workflow.
	- Added realistic actions: Germination, Transplant, Flip to flower, Harvest, Start drying, End drying, Lab submission, Packaging, Transfer/Manifest.
	- Forms use data-driven selects populated from current plants/harvests where possible (strain, batch, rooms), plus sensible mocked lists (labs, facilities, drivers, label templates).
	- Stage badges and KPIs for plants, harvests, and active batches.
- Inventory (new)
	- New page and navbar item next to Production with a realistic, filterable inventory view.
	- Covers Flower, Trim, Pre-rolls, Oil, Packaging, Nutrients, Supplies with large‑farm scale mock data.
	- KPIs for distinct items, total weight, and unit count.
	- Drawer-based “Add item” action with a structured form (SKU, Name, Category, UoM, Quantity, Status, Strain/Batch, Facility/Location).
 - Misc
	- Debug data route removed from the farmer app in the MVP build path to avoid dev-only errors.
 - Page headers & icons
	- Standardized all page titles to the same H1 style (text-2xl font-semibold).
	- Every page title now uses the exact same icon as its navbar entry (Production → Workflow, Inventory → Package, Lifecycle → ShieldCheck, Reports → FileText, Calendar → Calendar).
	- Calendar title icon uses emerald tone for visual consistency.

## 🛡️ What’s new (Auditor Frontend)

- Page headers & icons
	- Added/standardized page-level titles with icons to match the navbar (Lifecycle, Integrity, Reports, Calendar).
	- Integrity icon updated to blockchain-like (Boxes) in navbar and page headers.
	- All page titles use the consistent H1 style (text-2xl font-semibold).
- Reports
	- Snapshot and automated report lists styled consistently with Regulator.

## 👋 What’s new (Welcome Frontend)

- Header icon updated: replaced the solid green rectangle with the shared Leaf brand icon inside an emerald ring to match the frontends’ navbar branding.

## 🔐 Demo Login

- Username: Regulator
- Password: 1234
- 2FA: A rotating 6‑digit code shown in the mock device on login

## 🗺️ Google Maps Integration (optional)

Frontends support Maps-based location picking (where applicable).

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

## 🔑 Demo Credentials (all role apps)

- Username: Regulator | Auditor | Farmer | Retail | Laboratory
- Password: 1234
- 2FA: A rotating 6‑digit code shown on the device mock in each app.

## ⚙️ Configuration

### Ports
None specific beyond the frontends above.

### Development Notes
- Mock authentication (no persistent sessions)
- Mock data via local API layer
- No backend required; all features are front-end only for demonstration

## 🚨 Limitations

- Mock authentication without real session persistence
- Minimal validation and error handling
- Demonstration purposes only - not production ready

---

**Part of the RenewEdge Solutions Cannabis Traceability Suite**
