# 🌿 Cannabis Traceability MVP

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg)](https://www.typescriptlang.org/)

A local, containerized MVP web app demonstrating cannabis seed-to-sale traceability concepts with a simple Apple-style UI.

## 🛠️ Tech Stack

- **Backend**: NestJS (TypeScript) + TypeORM + PostgreSQL
- **Frontend**: React (TypeScript) + Vite + Tailwind CSS
- **Auth**: Mock login + mock 2FA
- **Roles**: Regulator, Operator, Auditor

## 🚀 Quick Start

### 1. Setup Environment
```bash
cp backend/.env.example backend/.env
```

### 2. Build and Run
```bash
docker compose up --build
```

### 3. Access the Application
- **App**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)

## 📊 Demo Credentials

| Role | Username | Password | 2FA Code |
|------|----------|----------|----------|
| Regulator | regulator1 | pass123 | Any 6 digits |
| Operator | operator1 | pass123 | Any 6 digits |
| Auditor | auditor1 | pass123 | Any 6 digits |

## ✨ Features

- **Role Dashboards**: Mock KPIs and alerts based on user role
- **Operator Wizard**: Plant seed → Harvest crop workflow
- **Lifecycle Explorer**: Merged timeline of plant + harvest events
- **Blockchain Integrity**: Server SHA-256 hashes with local verification
- **Facilities Management**: Browse and manage locations, structures, and equipment

## 📋 Example Flow

1. 🔐 Login as `operator1` / `pass123` (2FA: any 6 digits)
2. 🧙‍♂️ Open Wizard
3. 🌱 Plant seed (select strain + location) → View computed hash
4. 🌾 Harvest from created plant → View updated hash
5. 📊 Explore Lifecycle and Blockchain Integrity views

## ⚙️ Configuration

### Ports
- **Frontend**: 3000
- **Backend**: 3001
- **PostgreSQL**: 5432

### Development Notes
- TypeORM `synchronize=true` for development only
- Minimal data fixtures for DB connectivity demonstration
- Mock authentication (no persistent sessions)

## 🚨 Limitations

- Mock authentication without real session persistence
- Minimal validation and error handling
- Demonstration purposes only - not production ready

---

**Part of the RenewEdge Solutions Cannabis Traceability Suite**
