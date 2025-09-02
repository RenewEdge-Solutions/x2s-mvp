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

## 🧪 What’s new (Laboratory Frontend)

- Navigation
	- Removed Licensing, Operators, Lifecycle, and Integrity from the lab navbar and routes (redirects to Dashboard if visited).
	- Added a dedicated Testing page for intake → testing → review → COA workflow.
- Authentication & Profile
	- Default role set to Lab in the lab app; login screen defaults to Username “Laboratory”.
	- 2FA seed changed to LAB-DEMO (code displayed on the phone mock).
	- Profile shows lab-relevant modules and address.
- Dashboard
	- Reworked to lab KPIs (Samples in queue, TAT, COA status) and panels (Potency, Pesticides, Microbials, Heavy metals).
	- Alerts section simplified to lab-relevant notices.
- Calendar
	- Shows only lab-created events; removed cultivation lifecycle overlays.
	- Quick-add menu uses lab items: Sample pickup, Testing, COA due, Instrument calibration, Client meeting.
- Reports
	- Replaced with lab-focused groups: COA & Results, Turnaround Time, Operational.
- Notifications
	- Adjusted categories and entries for Intake, Testing, COA, Schedule, and Reports.
- Typography
	- Standardized page titles to the same H1 style across Lab pages.

## � Screenshots (MVP highlights)

Screenshots are in `./screenshots`. A few key views:

- Welcome: `screenshots/welcome.png`
- Regulator: `screenshots/regulator-dashboard.png`
- Auditor: `screenshots/auditor-dashboard.png`
- Farmer: `screenshots/farmer-dashboard.png`
- Retail: `screenshots/retail-pos.png`
- Laboratory: `screenshots/laboratory-dashboard.png`


## 📦 One-file Docker Desktop Release

Goal: let someone import one artifact into Docker Desktop and run the MVP without building locally.

Approach options:

1) Save images after building locally (simple)
	 - Build once: `docker compose build`
	 - Export all relevant images into a single tar:
		 - macOS/Linux: `docker image save $(docker compose config --images) -o cannabis-mvp-images.tar`
	 - Share `cannabis-mvp-images.tar`.
	 - User imports in Docker Desktop: Images > Load (or `docker image load -i cannabis-mvp-images.tar`).
	 - Then run: `docker compose up` (no rebuild needed).

2) Pre-bake dev servers into static images and provide a Compose + images pack (recommended for releases)
	 - After building, create a `release` folder with:
		 - `docker-compose.yml`
		 - `images.tar` (from step 1)
	 - User downloads the folder as a single archive and:
		<div align="center">

		# 🌿 Cannabis Traceability MVP

		[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
		[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
		[![Vite](https://img.shields.io/badge/Vite-Dev-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

		Modern, local-first seed‑to‑sale traceability demo with role‑based UIs for Regulator, Auditor, Farmer, Retail, and Laboratory.

		</div>

		## ✨ Overview

		This MVP demonstrates a practical, user-friendly approach to cannabis traceability across the full lifecycle. It runs entirely on your machine with mocked data, no backend required, and ships as multiple focused frontends you can run via Docker or Node.

		Highlights:
		- Clean, consistent Apple‑style UI with TailwindCSS
		- Role‑specific workspaces: Regulator, Auditor, Farmer, Retail (POS), Laboratory
		- Calendar, Reports, Notifications, and realistic data entry flows
		- Lab Testing board (Intake → Testing → Review → COA Ready) with results capture
		- Simple distribution: Docker Compose or one‑file Docker Desktop import

		## 🖼️ Screenshots

		<p>
			<img alt="Welcome" src="02_screenshots/Welcome%20Page.png" width="47%" />
			<img alt="Regulator" src="02_screenshots/Regulator%20Dashboard.png" width="47%" />
		</p>
		<p>
			<img alt="Laboratory" src="02_screenshots/Laboratory%20Dashboard.png" width="47%" />
			<img alt="Retail POS" src="02_screenshots/Retail%20POS.png" width="47%" />
		</p>
		<p>
			<img alt="Auditor" src="02_screenshots/Auditor%20Dashboard.png" width="47%" />
			<img alt="Farmer" src="02_screenshots/Farmer%20Dashbaord.png" width="47%" />
		</p>

		## 🧭 Modules & key flows

		- Regulator: dashboards, calendar scheduling, operators, oversight reports, notifications
		- Auditor: lifecycle snapshots, integrity views, reports, calendar
		- Farmer: production workflow, inventory, KPIs, transfers, submissions to lab
		- Retail: POS with age‑gating, SKU images, receipt printing, cart controls, inventory
		- Laboratory: testing pipeline, calendar (lab‑only events), lab reports, KPIs, COA readiness

		## 🧱 Architecture (from 01_docs)

		The following documents describe the system’s design and rationale. See the files under `01_docs/` for details:

		- High-level architecture: overall components and interactions — `01_docs/High Level Architecture Text.docx`
		- Domain architecture: entities and lifecycle across seed‑to‑sale — `01_docs/Domain Architecture Cannabis Text.docx`
		- Blockchain commit lifecycle (audit trail concept) — `01_docs/Blockchain Commit Lifecycle.docx`
		- Security and audit architecture — `01_docs/Security and Audit Architecture.docx`
		- Offline sync approach for low‑connectivity environments — `01_docs/Offline Sync Architecture.docx`
		- Tech stack overview — `01_docs/Tech Stack.docx`

		This MVP implements a front‑end–only slice of that design to make evaluation easy while preserving realistic UX flows.

		## 🧰 Tech stack

		- React + TypeScript + Vite
		- Tailwind CSS
		- Docker Compose (multi‑service dev)
		- Mocked, in‑memory data (no database)

		## � Quick start (Docker)

		```bash
		docker compose up --build
		```

		Services and ports:
		- Welcome: http://localhost:9000 (HMR 24678)
		- Regulator: http://localhost:9001 (HMR 24679)
		- Auditor: http://localhost:9002 (HMR 24680)
		- Farmer: http://localhost:9003 (container :9000, HMR 24682)
		- Retail: http://localhost:9004 (HMR 24683)
		- Laboratory: http://localhost:9005 (HMR 24681)

		Notes:
		- Ensure host ports 9000–9005 are open.
		- HMR ports: 24678 (welcome), 24679 (regulator), 24680 (auditor), 24681 (lab), 24682 (farmer), 24683 (retail).

		## � One‑file Docker Desktop release

		Download a single bundle from GitHub Releases and run the MVP without building.

		Option A — Use the prebuilt bundle (recommended)

		1) Download cannabis-mvp-bundle.zip from the latest Release:
		   https://github.com/RenewEdge-Solutions/x2s-mvp/releases/latest
		2) In Docker Desktop:
			- Images > Load > pick cannabis-mvp-images.tar from the zip
			- Containers > Create from compose > pick compose.yml
			- Run

		Option B — Build locally and create the bundle yourself

		```bash
		docker compose build
		docker image save $(docker compose config --images) -o cannabis-mvp-images.tar
		```

		- Import via Docker Desktop (Images → Load) or CLI: `docker image load -i cannabis-mvp-images.tar`.
		- Then run: `docker compose up`.

		Helper script (local): `cannabis-traceability-mvp/tools/release/export-images.sh` builds, exports, and zips a ready‑to‑share bundle.

		Optional helper script (if present): `tools/release/export-images.sh` performs the build + export.

		## 🧪 Run locally (without Docker)

		All frontends run standalone with mocked data:

		```bash
		cd welcome-frontend && npm install && npm run dev    # :9000
		cd regulator-frontend && npm install && npm run dev  # :9001
		cd auditor-frontend && npm install && npm run dev    # :9002
		cd farmer-frontend && npm install && npm run dev     # :9003
		cd retail-frontend && npm install && npm run dev     # :9004
		cd laboratory-frontend && npm install && npm run dev # :9005
		```

		## 🔑 Demo credentials

		- Username: Regulator | Auditor | Farmer | Retail | Laboratory
		- Password: 1234
		- 2FA: A rotating 6‑digit code appears on the login device mock (where applicable)

		## 🧭 Notable UX details

		- Retail POS: thermal‑style in‑page receipt printing, 3‑row product grid, age gating (18+), SKU images mapped across Inventory and POS, improved stepper controls
		- Laboratory: Testing page with KPIs, contextual “Advance” actions (Push to Testing/Review/COA Ready), results entry table, green iconography, lab‑only calendar, lab‑focused reports
		- Consistent H1 titles and iconography across apps

		## 📚 More reading (01_docs)

		For deeper context, refer to the documents in `01_docs/`:

		- Blockchain Commit Lifecycle — `01_docs/Blockchain Commit Lifecycle.docx`
		- High Level Architecture — `01_docs/High Level Architecture Text.docx`
		- Domain Architecture — `01_docs/Domain Architecture Cannabis Text.docx`
		- Offline Sync Architecture — `01_docs/Offline Sync Architecture.docx`
		- Security & Audit Architecture — `01_docs/Security and Audit Architecture.docx`
		- Tech Stack — `01_docs/Tech Stack.docx`
		- Legislation reference — `01_docs/St Lucia_cannabis-and-industrial-hemp-bill-2025.pdf`

		---

		Part of the RenewEdge Solutions Cannabis Traceability Suite
