# Land Partitioner

**AI-Powered Rule 109 Compliant Land Partition Decision Support System**

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000.svg)](https://nextjs.org)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-336791.svg)](https://postgis.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Automate the partition of jointly owned agricultural land under Uttar Pradesh Revenue Code Section 116 and Rule 109.**
> 
> Integrates GIS, cadastral maps, BhuNaksha data, and optimization algorithms to generate legally compliant partition proposals with explainable AI.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Legal Framework](#-legal-framework)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Docker)](#-quick-start-docker)
- [Manual Setup](#-manual-setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Scoring System](#-scoring-system)
- [Module Documentation](#-module-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Sample Data](#-sample-data)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

In India, particularly under the **Uttar Pradesh Revenue Code Section 116** and **Rule 109**, jointly owned agricultural land must be partitioned fairly among co-tenure holders.

### Current Challenges:

| Issue | Description |
|-------|-------------|
| 📋 Manual Kurra Preparation | Partition proposals are prepared manually, leading to delays |
| 🛤️ Subjective Road Frontage | Road frontage distribution lacks systematic methodology |
| 💰 Unbalanced Commercial Value | Commercial value balancing is subjective and inconsistent |
| 📍 Possession Ignored | Existing possession is not systematically analyzed |
| 🔄 Limited Alternatives | Multiple partition alternatives are not generated |
| 🤔 No Explainability | There is no explainable GIS-based decision support system |

### Our Solution

**Land Partitioner** automatically generates legally compliant partition proposals using:
- GIS and cadastral maps
- BhuNaksha data integration
- Voronoi-based spatial optimization
- Multi-objective partition algorithms
- Explainable AI for legal reasoning

---

## ✨ Features

### 🗺️ GIS Mapping
- **Multi-layer map**: Satellite, Hybrid, OpenStreetMap, Revenue Layer
- **Parcel visualization**: Boundary, area, vertices, centroid
- **Ownership overlay**: Display existing possession per owner
- **Plan comparison**: Side-by-side visualization of Plan A/B/C
- **Road frontage analysis**: Calculate road boundary length per allotment
- **Commercial zone mapping**: Identify high-value areas

### 🏗️ Partition Engine
| Plan | Objective | Algorithm |
|------|-----------|-----------|
| **Plan A** | Compactness Optimized | Equal-area Voronoi + Polsby-Popper |
| **Plan B** | Possession Optimized | Possession-weighted Voronoi |
| **Plan C** | Commercial Optimized | Commercial-weighted Voronoi |

### ⚖️ Legal Compliance
- **Rule 109(a)**: Share proportion compliance checker
- **Rule 109(b)**: Compactness verification (Polsby-Popper index)
- **Rule 109(c)**: Land quality balance across allottees
- **Rule 109(d)**: Field preservation scoring
- **Rule 109(e)**: Possession preservation analyzer
- **Rule 109(f)**: Commercial fairness (road frontage distribution)
- **Rule 109(g)**: Family settlement respect

### 🤖 AI Recommendations
- Plan ranking (Best → Second → Third)
- Explainable reasoning per parcel allotment
- Rule 109 condition analysis for each plan
- Trade-off identification between alternative plans
- **No external LLM required** — pure rule-based reasoning

### 📄 Reports & Documents
| Document | Contents |
|----------|----------|
| **Kurra Report** | Parcel details, owners, shares, GIS maps, frontage analysis, Rule compliance |
| **Preliminary Decree** | Ownership shares, valuation, legal references |
| **Final Decree** | Metes and bounds, final parcel allocation, updated revenue records |

### 📤 Multi-Format Export
PDF · GeoJSON · KML · Shapefile · CSV · JSON

### 🌐 BhuNaksha Integration
- Direct API integration with Bihar BhuNaksha
- Plot geometry extraction via PNIU
- Playwright browser automation fallback
- Extensible architecture for UP, MP, Rajasthan

---

## ⚖️ Legal Framework

### Section 116 — Suit for Division of Holding
- Co-tenure holders management
- Joint holdings with trees, wells, tubewells, improvements
- Valuation and proportional compensation for indivisible improvements

### Rule 109 Compliance Matrix

| Clause | Requirement | Implementation | Scoring |
|--------|-------------|----------------|---------|
| **109(a)** | Proportional share allocation | Share deviation calculation | Score = max(0, 100 - total_deviation) |
| **109(b)** | Compact parcel allocation | Polsby-Popper: `4πA/P²` | Normalized 0-100 |
| **109(c)** | Balanced land quality | Gini coefficient across allotments | Variance < 20% = pass |
| **109(d)** | Preserve existing fields | Field split count ratio | (unsplit/total) × 100 |
| **109(e)** | Preserve existing possession | Possession overlap percentage | Weighted by possession area |
| **109(f)** | Fair commercial value | Frontage % vs share % deviation | max(0, 100 - deviation×2) |
| **109(g)** | Respect family settlements | Settlement boundary overlap | Proportional overlap score |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   🌐 Frontend (Next.js 15)                        │
│   TypeScript · TailwindCSS · ShadCN · Leaflet · MapLibre         │
├──────────────────────────────────────────────────────────────────┤
│                         🔄 Nginx Proxy                            │
├──────────────────────────────────────────────────────────────────┤
│                   ⚙️ Backend (FastAPI/Python 3.12)                │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────┐  │
│  │GIS Engine │  │  Partition   │  │ Rule 109 │  │     AI      │  │
│  │GeoPandas  │  │   Engine     │  │  Engine  │  │ Explanation │  │
│  │ Shapely   │  │   Voronoi    │  │Scoring   │  │  Reasoning  │  │
│  └──────────┘  └──────────────┘  └──────────┘  └─────────────┘  │
│                                                                  │
│  ┌────────────┐  ┌────────────────┐  ┌────────────────────────┐ │
│  │  Reports   │  │   BhuNaksha    │  │     Auth & RBAC       │ │
│  │  Kurra/    │  │   Adapter +    │  │     JWT + Roles       │ │
│  │  Decrees   │  │   Playwright   │  │                        │ │
│  └────────────┘  └────────────────┘  └────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                    🗄️ PostgreSQL + PostGIS 3.4                   │
│              (Spatial Queries · Geometry Indexes)                 │
├──────────────────────────────────────────────────────────────────┤
│                   🌍 BhuNaksha Integration Layer                  │
│   Bihar · Uttar Pradesh · Madhya Pradesh · Rajasthan             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.12+ | Core language |
| FastAPI | 0.115 | REST API framework |
| SQLAlchemy | 2.0 | ORM |
| GeoAlchemy2 | 0.15 | PostGIS ORM integration |
| GeoPandas | 1.0 | Spatial DataFrame operations |
| Shapely | 2.0 | Geometry operations |
| PyProj | 3.6 | Coordinate transformations |
| GDAL | 3.8 | Raster/vector processing |
| Alembic | 1.13 | Database migrations |
| Celery | 5.4 | Async task queue |
| Redis | 5.1 | Caching + message broker |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework |
| TypeScript | 5.5 | Type safety |
| TailwindCSS | 3.4 | Utility-first CSS |
| ShadCN | Latest | Component library |
| Leaflet | 1.9 | Interactive maps |
| MapLibre GL | 4.5 | Vector tile maps |
| React Query | 5.56 | Server state management |
| Zustand | 4.5 | Client state management |
| Recharts | 2.12 | Data visualization |
| React Hook Form | 7.53 | Form handling |

### Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16 | Primary database |
| PostGIS | 3.4 | Spatial extension |
| Docker | 24+ | Containerization |
| Docker Compose | 2.20+ | Orchestration |
| Nginx | Latest | Reverse proxy |
| GitHub Actions | - | CI/CD |

---

## 📁 Project Structure

```
land_partitioner/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                          # FastAPI application entry point
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py                # Route aggregation
│   │   │       ├── auth.py                  # Login, register, profile
│   │   │       ├── parcels.py               # Parcel CRUD + GIS
│   │   │       ├── partition.py             # Partition generation
│   │   │       ├── reports.py               # Report endpoints
│   │   │       ├── admin.py                 # Admin operations
│   │   │       └── README.md
│   │   ├── core/
│   │   │   ├── config.py                    # Settings management
│   │   │   ├── security.py                  # JWT + password hashing
│   │   │   └── deps.py                      # FastAPI dependencies
│   │   ├── db/
│   │   │   ├── base.py                      # Declarative base + mixins
│   │   │   ├── session.py                   # Async session factory
│   │   │   └── README.md
│   │   ├── models/
│   │   │   ├── user.py                      # Users with RBAC
│   │   │   ├── parcel.py                    # Parcels with PostGIS
│   │   │   ├── owner.py                     # Co-tenure holders
│   │   │   ├── partition.py                 # Partition plans
│   │   │   ├── partition_parcel.py          # Allotments
│   │   │   ├── score.py                     # Scoring metrics
│   │   │   ├── kurra.py                     # Kurra reports
│   │   │   ├── decree.py                    # Legal decrees
│   │   │   └── audit.py                     # Audit trails
│   │   ├── schemas/
│   │   │   ├── auth.py                      # Login/Register/Token
│   │   │   ├── parcel.py                    # Parcel input/output
│   │   │   ├── owner.py                     # Owner management
│   │   │   ├── partition.py                 # Partition operations
│   │   │   ├── score.py                     # Score schemas
│   │   │   ├── kurra.py                     # Report schemas
│   │   │   └── decree.py                    # Decree schemas
│   │   └── services/
│   │       ├── gis/
│   │       │   ├── geometry_engine.py       # Core GIS operations
│   │       │   ├── spatial_analyzer.py      # Advanced spatial analysis
│   │       │   └── README.md
│   │       ├── partition/
│   │       │   ├── partition_engine.py      # Main engine
│   │       │   ├── compactness.py           # Polsby-Popper optimization
│   │       │   ├── voronoi.py               # Weighted Voronoi
│   │       │   ├── optimization.py          # Multi-objective
│   │       │   └── README.md
│   │       ├── legal/
│   │       │   ├── rule109_engine.py        # 7-clause checker
│   │       │   ├── compliance_checker.py    # Compliance reports
│   │       │   ├── scoring_engine.py        # Weighted scoring
│   │       │   └── README.md
│   │       ├── ai/
│   │       │   ├── recommendation_engine.py # Plan ranking
│   │       │   ├── explanation_engine.py    # Human-readable explanations
│   │       │   ├── knowledge_base.py        # Legal knowledge
│   │       │   └── README.md
│   │       ├── reports/
│   │       │   ├── kurra_report.py          # Kurra generation
│   │       │   ├── decree_report.py         # Decree generation
│   │       │   ├── report_generator.py      # Multi-format export
│   │       │   └── README.md
│   │       └── bhunaksha/
│   │           ├── adapter.py               # BhuNaksha API
│   │           ├── playwright_adapter.py    # Browser fallback
│   │           ├── models.py                # Data models
│   │           └── README.md
│   ├── alembic/                             # DB migrations
│   ├── scripts/
│   │   ├── seed.py                          # Sample data seeder
│   │   └── init-db.sql                      # DB initialization
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_parcels.py
│   │   ├── test_partition.py
│   │   ├── test_gis.py
│   │   ├── test_legal.py
│   │   └── conftest.py
│   ├── data/sample/
│   │   └── sample_parcel.geojson           # Sample dataset
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                   # Root layout
│   │   │   ├── page.tsx                     # Landing page
│   │   │   ├── providers.tsx                # React Query providers
│   │   │   ├── globals.css                  # Global styles
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (auth)/register/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── parcels/page.tsx
│   │   │       ├── parcels/[id]/page.tsx
│   │   │       ├── owners/page.tsx
│   │   │       ├── partition/page.tsx
│   │   │       ├── partition/[id]/page.tsx
│   │   │       ├── plans/page.tsx
│   │   │       ├── plans/[id]/page.tsx
│   │   │       ├── kurra/page.tsx
│   │   │       ├── decree/page.tsx
│   │   │       ├── reports/page.tsx
│   │   │       └── admin/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                          # ShadCN components
│   │   │   ├── map/                         # Leaflet map components
│   │   │   ├── forms/                       # Form components
│   │   │   ├── layout/                      # Layout components
│   │   │   ├── charts/                      # Recharts components
│   │   │   ├── plans/                       # Plan display
│   │   │   ├── ai/                          # AI explanations
│   │   │   └── scoring/                     # Score display
│   │   ├── lib/                             # API client, utilities
│   │   ├── hooks/                           # React Query hooks
│   │   ├── store/                           # Zustand stores
│   │   └── types/                           # TypeScript types
│   ├── tests/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.js
│   └── Dockerfile
├── docker/
│   ├── nginx.conf                           # Reverse proxy config
│   └── README.md
├── docker-compose.yml                       # Multi-service orchestration
├── .env.example                             # Environment template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Docker)

### Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) 24+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.20+
- 4GB RAM minimum (8GB recommended)

### Step 1: Clone and Configure

```bash
git clone https://github.com/karthiksteve/land_partitioner.git
cd land_partitioner

# Copy environment configuration
cp .env.example .env

# (Optional) Edit .env with your settings
```

### Step 2: Start All Services

```bash
docker-compose up -d
```

This starts 6 services:
| Service | Port | Description |
|---------|------|-------------|
| `postgis` | 5432 | PostgreSQL + PostGIS database |
| `redis` | 6379 | Cache and message broker |
| `backend` | 8000 | FastAPI application |
| `frontend` | 3000 | Next.js application |
| `nginx` | 80/443 | Reverse proxy |
| `celery-worker` | - | Async task processing |

### Step 3: Initialize Database

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed sample data
docker-compose exec backend python scripts/seed.py
```

### Step 4: Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) |
| **API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **API Docs (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) |

### Step 5: Login with Default Credentials

After seeding:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin (full access)

---

## 🔧 Manual Setup

### Backend Setup

#### Prerequisites
- Python 3.12+
- PostgreSQL 16 with PostGIS 3.4
- Redis 7+

#### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy ..\.env.example .env
# Edit .env with your PostgreSQL connection string

# Run migrations
alembic upgrade head

# Seed sample data
python scripts/seed.py

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Run Tests

```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Setup

#### Prerequisites
- Node.js 18+
- npm 9+

#### Installation

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
copy ..\.env.example .env.local
# Edit NEXT_PUBLIC_API_URL if needed (default: http://localhost:8000/api/v1)

# Start development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build
npm start
```

#### Run Tests

```bash
cd frontend
npm test
```

---

## 📖 API Documentation

Once running, explore the interactive API docs:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | User login | ❌ |
| POST | `/api/v1/auth/register` | Register new user | ❌ |
| GET | `/api/v1/auth/me` | Current user profile | ✅ |
| PUT | `/api/v1/auth/me` | Update profile | ✅ |
| POST | `/api/v1/auth/refresh` | Refresh JWT token | ✅ |

### Parcel Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/parcels` | List parcels (paginated) | ✅ |
| POST | `/api/v1/parcels` | Create parcel | ✅ |
| GET | `/api/v1/parcels/{id}` | Parcel details | ✅ |
| PUT | `/api/v1/parcels/{id}` | Update parcel | ✅ |
| DELETE | `/api/v1/parcels/{id}` | Delete parcel | Admin |
| GET | `/api/v1/parcels/{id}/geometry` | Parcel geometry (GeoJSON) | ✅ |
| POST | `/api/v1/parcels/{id}/owners` | Add owners | ✅ |
| GET | `/api/v1/parcels/{id}/owners` | List owners | ✅ |
| POST | `/api/v1/parcels/upload` | Upload GIS file | ✅ |
| POST | `/api/v1/parcels/bhunaksha/fetch` | Fetch from BhuNaksha | ✅ |

### Partition Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/partition/generate` | Generate all 3 plans | ✅ |
| GET | `/api/v1/partition/plans` | List plans | ✅ |
| GET | `/api/v1/partition/plans/{id}` | Plan detail + scores | ✅ |
| GET | `/api/v1/partition/plans/{id}/comparison` | Compare all plans | ✅ |
| GET | `/api/v1/partition/plans/{id}/allotments` | List allotments | ✅ |
| GET | `/api/v1/partition/plans/{id}/allotments/{aid}/explain` | AI explanation | ✅ |
| POST | `/api/v1/partition/plans/{id}/approve` | Approve plan | Revenue Officer |
| POST | `/api/v1/partition/plans/{id}/reject` | Reject plan | Revenue Officer |
| GET | `/api/v1/partition/recommendations` | AI recommendations | ✅ |

### Report Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/reports/kurra/{plan_id}` | Generate Kurra report | ✅ |
| POST | `/api/v1/reports/preliminary-decree/{plan_id}` | Preliminary decree | ✅ |
| POST | `/api/v1/reports/final-decree/{plan_id}` | Final decree | ✅ |
| GET | `/api/v1/reports/{id}/download` | Download PDF | ✅ |
| POST | `/api/v1/reports/export/{plan_id}` | Export in format | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/admin/users` | List all users | Admin |
| PUT | `/api/v1/admin/users/{id}/role` | Change role | Admin |
| GET | `/api/v1/admin/audit-logs` | View audit trail | Admin |
| GET | `/api/v1/admin/stats` | System stats | Admin |

---

## 🗄️ Database Schema

### Entity Relationship

```
┌─────────┐     ┌──────────┐     ┌───────────────┐
│  users  │────▶│  parcels │────▶│    owners     │
└─────────┘     └──────────┘     └───────────────┘
                      │                  │
                      ▼                  ▼
              ┌──────────────┐  ┌────────────────┐
              │partition_    │  │  partition_    │
              │   plans      │──│   parcels      │
              └──────────────┘  └────────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   scores     │
              └──────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
  ┌──────────────┐       ┌──────────────┐
  │kurra_reports │       │   decrees    │
  └──────────────┘       └──────────────┘

  ┌────────────────────────────────────┐
  │           audit_logs               │
  └────────────────────────────────────┘
```

### Core Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `users` | User accounts with RBAC | id, email, username, role (enum) |
| `parcels` | Land parcels with geometry | id, pniu, village, tehsil, district, **geometry (PostGIS)**, total_area |
| `owners` | Co-tenure holders | id, parcel_id, owner_name, share_percentage, possession_geometry |
| `partition_plans` | Generated partition plans | id, parcel_id, plan_type (enum: compactness/possession/commercial), status |
| `partition_parcels` | Allotted sub-parcels | id, plan_id, owner_id, allocated_area, **allocated_geometry**, scores |
| `scores` | Plan scoring metrics | id, plan_id, share_compliance, compactness, road_frontage, overall_score |
| `kurra_reports` | Generated Kurra reports | id, plan_id, report_data (JSON), pdf_path |
| `decrees` | Legal decrees | id, plan_id, decree_type (preliminary/final), decree_data (JSON) |
| `audit_logs` | Complete audit trail | id, user_id, action, entity_type, old_values, new_values |

### PostGIS Spatial Columns

| Table | Geometry Column | SRID | Type |
|-------|----------------|------|------|
| `parcels` | `geometry` | 4326 | Polygon |
| `owners` | `possession_geometry` | 4326 | Polygon |
| `partition_parcels` | `allocated_geometry` | 4326 | Polygon |
| `roads` | `geometry` | 4326 | LineString |
| `commercial_zones` | `geometry` | 4326 | Polygon |
| `settlements` | `geometry` | 4326 | Polygon |

---

## 📊 Scoring System

Each partition plan is scored across 7 metrics (0-100), then combined into an overall score using configurable weights.

### Default Weights

```python
overall_score = (
    0.30 × compactness +          # Rule 109(b) - highest priority
    0.20 × share_compliance +     # Rule 109(a) - fundamental requirement
    0.15 × road_frontage +        # Rule 109(f) - commercial value
    0.15 × commercial_fairness +  # Rule 109(f) - balanced distribution
    0.10 × possession_preservation +  # Rule 109(e) - practical reality
    0.05 × field_preservation +   # Rule 109(d) - minimize disruption
    0.05 × family_settlement      # Rule 109(g) - mutual agreements
)
```

### Metric Calculations

| Metric | Formula | Range |
|--------|---------|-------|
| **Compactness** | `Polsby-Popper = 4π × Area / Perimeter²` | 0-100 |
| **Share Compliance** | `max(0, 100 - Σ|actual_share - target_share|)` | 0-100 |
| **Road Frontage** | `max(0, 100 - Σ|frontage_% - share_%| × 2)` | 0-100 |
| **Commercial Fairness** | Gini coefficient inversion | 0-100 |
| **Possession** | Overlap ratio × 100 | 0-100 |
| **Field Preservation** | (Unsplit fields / Total fields) × 100 | 0-100 |
| **Settlement** | Settlement overlap × 100 | 0-100 |

---

## 📚 Module Documentation

Each module has its own README with detailed implementation notes and usage examples:

| Module | File | Key Contents |
|--------|------|--------------|
| **Backend Core** | [backend/README.md](backend/README.md) | Config, security, database setup |
| **GIS Engine** | [backend/app/services/gis/README.md](backend/app/services/gis/README.md) | Spatial analysis, geometries, Voronoi |
| **Partition Engine** | [backend/app/services/partition/README.md](backend/app/services/partition/README.md) | Algorithms, optimization, compactness |
| **Rule 109 Engine** | [backend/app/services/legal/README.md](backend/app/services/legal/README.md) | Compliance, scoring, legal checks |
| **AI Engine** | [backend/app/services/ai/README.md](backend/app/services/ai/README.md) | Rankings, explanations, knowledge base |
| **Report Engine** | [backend/app/services/reports/README.md](backend/app/services/reports/README.md) | Kurra, decrees, multi-format export |
| **BhuNaksha** | [backend/app/services/bhunaksha/README.md](backend/app/services/bhunaksha/README.md) | API adapters, state portals |
| **API Layer** | [backend/app/api/v1/README.md](backend/app/api/v1/README.md) | All endpoints with examples |
| **Database** | [backend/app/db/README.md](backend/app/db/README.md) | Schema, migrations, spatial indexes |
| **Frontend** | [frontend/README.md](frontend/README.md) | Components, pages, state management |
| **DevOps** | [docker/README.md](docker/README.md) | Deployment, Docker, Nginx config |

---

## 🧪 Testing

### Backend Tests (40+ tests)

```bash
cd backend

# Run all tests with coverage
pytest tests/ -v --cov=app

# Run specific test file
pytest tests/test_gis.py -v
pytest tests/test_legal.py -v
pytest tests/test_partition.py -v

# Run with verbose output
pytest tests/ -v --tb=long
```

### Test Coverage

| Test File | Tests | Focus |
|-----------|-------|-------|
| `test_auth.py` | 6 | JWT, login, register, roles |
| `test_parcels.py` | 4 | CRUD, geometry, search |
| `test_partition.py` | 3 | Plan generation, allocation |
| `test_gis.py` | 20 | Area, perimeter, compactness, Voronoi |
| `test_legal.py` | 14 | Rule 109 a-g, scoring engine |

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🚢 Deployment

### Production Docker Deployment

```bash
# Clone on server
git clone https://github.com/karthiksteve/land_partitioner.git
cd land_partitioner

# Configure for production
cp .env.example .env
# Edit: SECRET_KEY, DATABASE_URL, CORS_ORIGINS

# Generate SSL certificates (or use Let's Encrypt)
# Place in docker/ssl/

# Build and start
docker-compose -f docker-compose.yml up -d --build

# Initialize
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed.py

# Monitor
docker-compose logs -f --tail=100
```

### Backup and Restore

```bash
# Backup database
docker-compose exec -T postgis pg_dump -U geokurra geokurra > backup_$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker-compose exec -T postgis psql -U geokurra geokurra
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ | - | JWT signing secret |
| `DATABASE_URL` | ✅ | postgresql+asyncpg://... | PostgreSQL connection |
| `REDIS_URL` | ✅ | redis://redis:6379/0 | Redis connection |
| `CORS_ORIGINS` | ✅ | http://localhost:3000 | Allowed origins |
| `ENVIRONMENT` | ❌ | production | Runtime mode |
| `DEBUG` | ❌ | false | Debug mode |
| `BHUNakSHA_BASE_URL` | ❌ | https://bhunaksha.bihar.gov.in | BhuNaksha portal |

---

## 📦 Sample Data

The platform includes a sample dataset in `backend/data/sample/sample_parcel.geojson`:

```
Sample Parcel: 10.5 acres agricultural land
├── 3 Co-tenure holders: A (50%), B (30%), C (20%)
├── Road: Village Main Road (8m wide)
├── Possessions: Owner A (west half), Owner B (east half)
└── Commercial Zone: High value area near road
```

Run the seed script to load this data:
```bash
docker-compose exec backend python scripts/seed.py
```

---

## 🔒 Security

### Authentication
- **JWT-based** with configurable expiry (default: 60 minutes)
- Passwords hashed with **bcrypt**
- Token refresh mechanism

### Authorization (RBAC)
| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, audit logs |
| **Revenue Officer** | Create/review/approve partitions, generate decrees |
| **Surveyor** | Create/edit parcels, upload GIS data |
| **Citizen** | View own parcels, view partition plans |

### Additional Security
- Audit trails for all CRUD operations
- Input validation via Pydantic schemas
- CORS whitelist configuration
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection (Next.js by default)
- HTTPS support via Nginx

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation (README) for significant changes
- Run tests before submitting PR

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Uttar Pradesh Revenue Code** for the legal framework
- **BhuNaksha Portal** for cadastral GIS data
- Open-source GIS community (GeoPandas, Shapely, PostGIS)
- Indian land records modernization initiative

---

<div align="center">
  <strong>Built with ❤️ for transparent, fair, and automated land partition</strong>
</div>
