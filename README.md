# GeoKurra – Digital Land Information Portal

**Phase 1: Parcel Retrieval & Satellite Visualization Portal**

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000.svg)](https://nextjs.org)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-336791.svg)](https://postgis.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **A government-style web portal for retrieving cadastral parcel information from Bihar BhuNaksha, displaying parcels on satellite imagery, and downloading land records.**
>
> Built under the **Uttar Pradesh Revenue Code Section 116** framework for digital land information management.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [User Workflow](#-user-workflow)
- [Quick Start (Docker)](#-quick-start-docker)
- [Manual Setup](#-manual-setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [BhuNaksha Integration](#-bhunaksha-integration)
- [GIS Map Viewer](#-gis-map-viewer)
- [Document Management](#-document-management)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🎯 Overview

GeoKurra Phase 1 provides a **government-style digital land information portal** that allows citizens and officers to:

1. **Search for a parcel** using District, Circle, Mouza, and Plot Number
2. **Retrieve parcel information** from Bihar BhuNaksha (or simulated data)
3. **View parcel geometry** overlaid on satellite imagery
4. **Download available documents** (Parcel PDF, Land Record, ROR)
5. **Store parcel information** locally in PostGIS for future reference

This phase focuses **exclusively** on parcel retrieval and visualization. No land partitioning, Rule 109 compliance, AI recommendations, or optimization algorithms are implemented.

---

## ✨ Features

### 🔍 Parcel Search
- Search by District, Circle, Mouza, and Plot Number
- Integration with Bihar BhuNaksha cadastral database
- Automatic PNIU generation and storage
- Real-time validation of inputs

### 🗺️ GIS Map Viewer
- Satellite imagery base layer (Google Maps / OpenStreetMap)
- Parcel boundary overlay with highlighting
- Zoom, pan, and fullscreen controls
- Coordinate display on hover
- Multi-layer support (Satellite, Boundary, Labels)

### 📄 Document Management
- Automatic document discovery from BhuNaksha
- Download Parcel PDF, Land Record PDF, ROR PDF
- GeoJSON export of parcel geometry
- Document metadata tracking

### 🏛️ Government-Style Dashboard
- Clean, official government portal design
- Role-based access (Admin, Officer, Citizen)
- Search history and recent parcels
- Quick access to GIS Viewer and Documents

### 💾 Local Data Storage
- PostgreSQL + PostGIS for spatial data
- Parcel geometry stored as GeoJSON/PostGIS
- Document metadata with file paths
- Complete audit trail for all actions

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    🌐 Frontend (Next.js 15 + TypeScript)              │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  GovHeader   │  │  SearchForm  │  │   MapViewer │  │Documents  │  │
│  │  (Official)  │  │ (District/   │  │ (Leaflet +  │  │  List &   │  │
│  │              │  │  Circle/     │  │  Satellite) │  │ Download  │  │
│  │              │  │  Mouza/Plot) │  │             │  │           │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│                         🔄 Nginx Proxy                               │
├──────────────────────────────────────────────────────────────────────┤
│                    ⚙️ Backend (FastAPI + Python 3.12)                 │
│                                                                      │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │
│  │  Auth API   │  │  Parcel Search   │  │   Document Service     │  │
│  │  JWT + RBAC │  │  & Retrieval     │  │   Download & Store     │  │
│  └─────────────┘  └──────────────────┘  └────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │              BhuNaksha Integration Layer                      │     │
│  │  ┌─────────────────┐  ┌──────────────────┐                    │     │
│  │  │   API Adapter    │  │ Playwright       │                    │     │
│  │  │ (Direct GIS API) │  │ (Browser Scraper)│                    │     │
│  │  └─────────────────┘  └──────────────────┘                    │     │
│  └─────────────────────────────────────────────────────────────┘     │
├──────────────────────────────────────────────────────────────────────┤
│                    🗄️ PostgreSQL + PostGIS 3.4                       │
│            (Spatial Queries · Geometry Indexes · GeoJSON)             │
└──────────────────────────────────────────────────────────────────────┘
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
| Playwright | 1.47 | Browser automation for BhuNaksha |
| httpx | 0.27 | Async HTTP client |
| Alembic | 1.13 | Database migrations |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework |
| TypeScript | 5.5 | Type safety |
| TailwindCSS | 3.4 | Utility-first CSS |
| Leaflet | 1.9 | Interactive maps |
| React Leaflet | 4.2 | React map components |
| React Query | 5.56 | Server state management |
| Zustand | 4.5 | Client state management |

### Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16 | Primary database |
| PostGIS | 3.4 | Spatial extension |
| Docker | 24+ | Containerization |
| Docker Compose | 2.20+ | Orchestration |
| Nginx | Latest | Reverse proxy |

---

## 📁 Project Structure

```
land_partitioner/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application entry point
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py           # Route aggregation
│   │   │       ├── auth.py             # Login, register, profile
│   │   │       ├── parcels.py          # Parcel search & retrieval
│   │   │       └── documents.py        # Document download & fetch
│   │   ├── core/
│   │   │   ├── config.py               # Application settings
│   │   │   ├── security.py             # JWT + password hashing
│   │   │   └── deps.py                 # FastAPI dependencies
│   │   ├── db/
│   │   │   ├── base.py                 # Declarative base + mixins
│   │   │   └── session.py              # Async session factory
│   │   ├── models/
│   │   │   ├── user.py                 # Users with RBAC
│   │   │   ├── parcel.py               # Parcels with PostGIS
│   │   │   ├── document.py             # Parcel documents
│   │   │   └── audit.py                # Audit trails
│   │   ├── schemas/
│   │   │   ├── auth.py                 # Auth schemas
│   │   │   ├── parcel.py               # Parcel schemas
│   │   │   └── document.py             # Document schemas
│   │   └── services/
│   │       └── bhunaksha/
│   │           ├── adapter.py          # BhuNaksha API adapter
│   │           ├── playwright_adapter.py # Browser automation
│   │           └── models.py           # BhuNaksha data models
│   ├── scripts/
│   │   ├── seed.py                     # Sample data seeder
│   │   └── init-db.sql                 # DB initialization
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_parcels.py
│   │   ├── test_bhunaksha.py
│   │   └── conftest.py
│   ├── uploads/documents/              # Downloaded documents
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── providers.tsx           # React Query provider
│   │   │   ├── globals.css             # Government styles
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (auth)/register/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── search/page.tsx
│   │   │       ├── parcels/[id]/page.tsx
│   │   │       ├── gis-viewer/page.tsx
│   │   │       ├── documents/page.tsx
│   │   │       ├── help/page.tsx
│   │   │       └── contact/page.tsx
│   │   ├── components/
│   │   │   ├── layout/                 # GovHeader, GovFooter
│   │   │   ├── map/                    # MapContainer, ParcelMap
│   │   │   ├── forms/                  # ParcelSearchForm
│   │   │   └── ui/                     # Button, Card, Input, etc.
│   │   ├── lib/                        # API client, constants
│   │   ├── hooks/                      # React Query hooks
│   │   ├── store/                      # Zustand stores
│   │   ├── types/                      # TypeScript types
│   │   └── utils/                      # Helper functions
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.js
│   └── Dockerfile
├── docker/
│   └── nginx.conf                      # Reverse proxy config
├── docker-compose.yml                  # Multi-service orchestration
├── .env.example                        # Environment template
├── .gitignore
└── README.md
```

---

## 👤 User Workflow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌───────────┐
│  Open    │────▶│  Enter   │────▶│   System      │────▶│  View     │
│ GeoKurra │     │ District │     │  Retrieves    │     │  Parcel   │
│          │     │ Circle   │     │  ✓ Plot Info  │     │  on Map   │
│          │     │ Mouza    │     │  ✓ Geometry   │     │           │
│          │     │ Plot No  │     │  ✓ PNIU       │     │           │
│          │     │          │     │  ✓ Area       │     │           │
└──────────┘     └──────────┘     └──────────────┘     └───────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────────┐
                                                    │  Download       │
                                                    │  Documents      │
                                                    │  ✓ Parcel PDF   │
                                                    │  ✓ Land Record  │
                                                    │  ✓ GeoJSON      │
                                                    └─────────────────┘
```

### Step-by-Step Process

1. **User opens** GeoKurla portal
2. **User logs in** with credentials (or registers as Citizen)
3. **User navigates** to Parcel Search
4. **User enters**: District → Circle → Mouza → Plot Number
5. **System searches** BhuNaksha and retrieves:
   - Plot information (Khata, Area, Land Type)
   - Parcel geometry (Polygon coordinates)
   - PNIU (Permanent parcel identifier)
   - Available documents (PDFs, records)
6. **System displays** parcel on satellite map with boundary overlay
7. **User can**:
   - View detailed parcel information
   - View parcel on interactive satellite map
   - Download Parcel PDF, Land Record, GeoJSON

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker Engine 24+
- Docker Compose 2.20+

### Step 1: Clone and Configure

```bash
git clone https://github.com/karthiksteve/land_partitioner.git
cd land_partitioner

# Copy environment configuration
cp .env.example .env

# Edit .env if needed (default values work for local development)
```

### Step 2: Start All Services

```bash
docker-compose up -d
```

| Service | Port | Description |
|---------|------|-------------|
| `postgis` | 5432 | PostgreSQL + PostGIS |
| `backend` | 8000 | FastAPI application |
| `frontend` | 3000 | Next.js application |
| `nginx` | 80/443 | Reverse proxy |

### Step 3: Initialize Database & Seed Data

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Seed sample data
docker-compose exec backend python scripts/seed.py
```

### Step 4: Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) |
| **Swagger Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Health Check** | [http://localhost:8000/health](http://localhost:8000/health) |

### Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `officer` | `officer123` | Officer |
| `citizen` | `citizen123` | Citizen |

---

## 🔧 Manual Setup

### Backend Setup

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

# Install Playwright browsers (for BhuNaksha scraping)
playwright install chromium

# Configure environment
copy ..\.env.example .env
# Edit .env with your PostgreSQL connection

# Run migrations
alembic upgrade head

# Seed data
python scripts/seed.py

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build
npm start
```

---

## 📖 API Documentation

Once running, visit: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | User login | ❌ |
| POST | `/api/v1/auth/register` | Register new user | ❌ |
| GET | `/api/v1/auth/me` | Current user profile | ✅ |
| PUT | `/api/v1/auth/me` | Update profile | ✅ |

### Parcel Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/parcels/search` | Search parcel from BhuNaksha | ✅ |
| GET | `/api/v1/parcels` | List stored parcels | ✅ |
| GET | `/api/v1/parcels/{id}` | Get parcel detail | ✅ |
| GET | `/api/v1/parcels/{id}/geometry` | Get parcel GeoJSON geometry | ✅ |
| GET | `/api/v1/parcels/{id}/map` | Get map data (center + zoom) | ✅ |
| DELETE | `/api/v1/parcels/{id}` | Delete parcel | Admin |

### Document Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/parcels/{id}/documents` | List available documents | ✅ |
| POST | `/api/v1/parcels/{id}/documents/fetch` | Fetch documents from BhuNaksha | ✅ |
| POST | `/api/v1/parcels/{id}/documents/download/{doc_id}` | Trigger document download | ✅ |
| GET | `/api/v1/documents/{id}/download` | Download document file | ✅ |

---

## 🗄️ Database Schema

### Entity Relationship

```
┌─────────┐       ┌──────────┐       ┌──────────────┐
│  users  │       │  parcels │──────▶│  documents   │
└─────────┘       └──────────┘       └──────────────┘
                        │
                        │ (PostGIS Geometry)
                        ▼
                ┌──────────────┐
                │  parcel_     │
                │  geometry    │
                │ (implicit in  │
                │  parcels     │
                │  table)      │
                └──────────────┘

┌────────────────────────────────────┐
│           audit_logs               │
└────────────────────────────────────┘
```

### Core Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email |
| username | VARCHAR(100) | Unique username |
| hashed_password | VARCHAR(255) | bcrypt hash |
| full_name | VARCHAR(255) | Display name |
| phone | VARCHAR(20) | Contact |
| role | ENUM(admin/officer/citizen) | User role |
| is_active | BOOLEAN | Account active |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

#### `parcels`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pniu | VARCHAR(100) | **Permanent parcel identifier** |
| plot_number | VARCHAR(50) | Plot number |
| khata_number | VARCHAR(50) | Khata number |
| survey_number | VARCHAR(50) | Survey number |
| village | VARCHAR(150) | Village name |
| mouza | VARCHAR(150) | Mouza/pargana |
| circle | VARCHAR(100) | Circle |
| district | VARCHAR(100) | District |
| state | VARCHAR(100) | State (default: Bihar) |
| total_area | FLOAT | Area |
| area_unit | VARCHAR(20) | Unit (acre/hectare/sq.m) |
| land_type | VARCHAR(50) | Land classification |
| geometry | GEOMETRY(Polygon, 4326) | **PostGIS geometry** |
| boundary_length | FLOAT | Perimeter |
| vertices | JSON | Vertex coordinates |
| source | ENUM(bhunaksha/manual) | Data source |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

#### `documents`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| parcel_id | UUID | FK to parcels |
| document_type | ENUM | parcel_pdf/land_record/ror/geojson/other |
| file_name | VARCHAR(255) | Original filename |
| file_path | VARCHAR(500) | Server path |
| file_size | BIGINT | Size in bytes |
| mime_type | VARCHAR(100) | MIME type |
| source_url | VARCHAR(500) | Original BhuNaksha URL |
| is_downloaded | BOOLEAN | Download status |
| created_at | TIMESTAMP | Auto |

#### `audit_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users (nullable) |
| action | VARCHAR(100) | Action performed |
| entity_type | VARCHAR(50) | Entity type |
| entity_id | UUID | Entity identifier |
| details | JSON | Action details |
| ip_address | VARCHAR(45) | Client IP |
| timestamp | TIMESTAMP | Auto |

---

## 🌐 BhuNaksha Integration

### Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Input  │────▶│  BhuNakshaAdapter │────▶│  Response with  │
│  District    │     │                   │     │  ✓ PNIU         │
│  Circle      │     │  Method 1:        │     │  ✓ Geometry     │
│  Mouza       │     │  Direct GIS API   │     │  ✓ Area         │
│  Plot No     │     │                   │     │  ✓ Documents    │
│              │     │  Method 2:        │     │                 │
│              │     │  Playwright       │     │                 │
│              │     │  Scraper          │     │                 │
│              │     │                   │     │                 │
│              │     │  Method 3:        │     │                 │
│              │     │  Fallback:        │     │                 │
│              │     │  Simulated Data   │     │                 │
└──────────────┘     └──────────────────┘     └─────────────────┘
```

### Integration Methods

#### Method 1: Direct GIS API
Attempts to call BhuNaksha GIS endpoints:
- `getPlotAtXY` - Retrieve plot by coordinates
- `getPointsFromPNIU` - Get vertices from PNIU
- `ScalarDataHandler` - Get plot attributes
- `WMS Services` - Web Map Service tiles

#### Method 2: Playwright Browser Automation
If direct APIs fail, uses Playwright to:
1. Open BhuNaksha portal
2. Select District → Circle → Mouza
3. Search Plot Number
4. Extract geometry and details from page
5. Download available documents

#### Method 3: Simulated Data (Development)
During development/demo, the adapter returns realistic Bihar cadastral data with:
- Proper PNIU format: `DDDDCCCCMMMMMMPPPPP`
- Realistic Bihar coordinates (lat: 24.5-27.5, lng: 83.5-88.0)
- Randomized but realistic plot shapes and areas

### PNIU Format

The **Permanent Parcel Identifier (PNIU)** is formatted as:

```
DDDD CCCC MMMMMM PPPPP
│    │    │      │
│    │    │      └── Plot Number (5 digits)
│    │    └───────── Mouza Code (6 digits)
│    └────────────── Circle Code (4 digits)
└─────────────────── District Code (4 digits)
```

Example: `0224 0012 003456 00123`

---

## 🗺️ GIS Map Viewer

### Features

- **Base Layers**: Satellite imagery, OpenStreetMap, Hybrid
- **Parcel Overlay**: Highlighted polygon boundary
- **Controls**: Zoom, pan, fullscreen, coordinates
- **Info Display**: Parcel details on click
- **Layer Toggle**: Switch between map styles

### Implementation

The map viewer uses **Leaflet** with:
- `L.tileLayer` for base imagery
- `L.geoJSON` for parcel boundary overlay
- Custom styled polygons with dashed borders
- Popup info on parcel click
- Fullscreen control plugin

### Map Layers

| Layer | Type | Source |
|-------|------|--------|
| Satellite | Tile | Google Satellite / Esri |
| Street | Tile | OpenStreetMap |
| Hybrid | Tile | Google Hybrid |
| Parcel Boundary | Vector | PostGIS → GeoJSON |

---

## 📄 Document Management

### Document Types

| Type | Description | Format |
|------|-------------|--------|
| Parcel PDF | Plot map with boundaries | PDF |
| Land Record | Khata/ROR details | PDF |
| GeoJSON | Parcel geometry data | JSON |
| Other | Additional records | PDF |

### Download Flow

1. System discovers available documents for a parcel
2. User clicks "Download" for desired document
3. System downloads from BhuNaksha (or serves cached)
4. File is stored in `uploads/documents/`
5. Document metadata saved to database
6. User receives download via browser

---

## 🔒 Security

### Authentication
- JWT-based token authentication
- Token expiry: 60 minutes (configurable)
- Passwords hashed with bcrypt

### Authorization (RBAC)
| Role | Permissions |
|------|-------------|
| **Admin** | Full access, manage users, view audit logs |
| **Officer** | Search parcels, view maps, download documents |
| **Citizen** | Search parcels, view own searches, download documents |

### Additional Security
- CORS whitelist configuration
- Input validation via Pydantic
- SQL injection prevention (SQLAlchemy ORM)
- Audit trails for all operations
- HTTPS support via Nginx

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v --cov=app
```

| Test File | Tests | Focus |
|-----------|-------|-------|
| `test_auth.py` | 6 | Login, register, token verification |
| `test_parcels.py` | 4 | Search, retrieve, geometry, map data |
| `test_bhunaksha.py` | 5 | Adapter simulation, PNIU, geometry generation |

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🚢 Deployment

### Production Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d --build

# Initialize database
docker-compose exec backend alembic upgrade head

# Load seed data
docker-compose exec backend python scripts/seed.py

# Monitor services
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

See [.env.example](.env.example) for all configuration options.

---

## 📸 Screenshots

### Home Page
Government of India portal with tricolor header, search section, and feature cards.

### Parcel Search
Form with District/Circle/Mouza/Plot inputs, results with parcel details.

### GIS Map Viewer
Interactive Leaflet map with satellite imagery and parcel boundary overlay.

### Parcel Detail
Full parcel information with map, documents, and administrative details.

### Documents Page
List of downloaded documents with download buttons and metadata.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

- **Bihar BhuNaksha** for cadastral GIS data
- **Department of Land Resources**, Government of India
- Open-source community (FastAPI, Next.js, Leaflet, PostGIS)
- **Uttar Pradesh Revenue Code** for the legal framework

---

<div align="center">
  <strong>GeoKurra – Digital Land Information Portal</strong>
  <br>
  Phase 1: Parcel Retrieval & Satellite Visualization
  <br>
  <em>Built with ❤️ for transparent and accessible land records</em>
</div>
