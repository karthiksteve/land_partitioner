# GeoKurra Backend

**FastAPI + Python 3.12 Backend for AI-Powered Land Partition Decision Support System**

## Overview

The backend provides REST APIs, GIS processing, partition optimization, legal compliance checking, AI recommendations, and report generation for the GeoKurra platform.

## Architecture

```
backend/
├── app/
│   ├── api/v1/          # REST API endpoints
│   │   ├── auth.py      # Authentication (JWT)
│   │   ├── parcels.py   # Parcel CRUD + GIS
│   │   ├── partition.py # Partition generation + plans
│   │   ├── reports.py   # Kurra, decrees, exports
│   │   ├── admin.py     # Admin operations
│   │   └── router.py    # Route aggregation
│   ├── core/
│   │   ├── config.py    # Settings via pydantic-settings
│   │   ├── security.py  # JWT + password hashing
│   │   └── deps.py      # FastAPI dependencies
│   ├── models/          # SQLAlchemy + PostGIS models
│   │   ├── user.py      # Users with RBAC roles
│   │   ├── parcel.py    # Parcels with PostGIS geometry
│   │   ├── owner.py     # Co-tenure holders
│   │   ├── partition.py # Partition plans
│   │   ├── partition_parcel.py # Allotted sub-parcels
│   │   ├── score.py     # Scoring metrics
│   │   ├── kurra.py     # Kurra reports
│   │   ├── decree.py    # Legal decrees
│   │   └── audit.py     # Audit trails
│   ├── schemas/         # Pydantic validation
│   │   ├── auth.py      # Login/Register/Token
│   │   ├── parcel.py    # Parcel input/output
│   │   ├── owner.py     # Owner management
│   │   ├── partition.py # Partition operations
│   │   ├── score.py     # Score schemas
│   │   ├── kurra.py     # Report schemas
│   │   └── decree.py    # Decree schemas
│   ├── services/
│   │   ├── gis/         # GIS Engine
│   │   ├── partition/   # Partition Optimization
│   │   ├── legal/       # Rule 109 Compliance
│   │   ├── ai/          # AI Recommendations
│   │   ├── reports/     # Report Generation
│   │   └── bhunaksha/   # BhuNaksha Integration
│   ├── db/              # Database session + base
│   └── main.py          # FastAPI application
├── alembic/             # Database migrations
├── scripts/             # Seed data, utilities
├── tests/               # Unit + integration tests
├── requirements.txt
└── Dockerfile
```

## Key Changes & Features

### Core Configuration (`app/core/config.py`)
- Environment-based settings via `.env` file
- Database URL with async PostgreSQL + PostGIS support
- JWT secret key and token expiry configuration
- CORS origin whitelist
- BhuNaksha API base URL configuration

### Security (`app/core/security.py`)
- JWT token creation with expiration
- Token verification and decoding
- bcrypt password hashing
- Role-based access control decorators

### Database Models (`app/models/`)
- **User Model**: UUID primary keys, email uniqueness, RBAC roles (admin, revenue_officer, surveyor, citizen)
- **Parcel Model**: PostGIS Geometry column for spatial data, comprehensive land attributes (soil, irrigation, improvements), PNIU-based identification
- **Owner Model**: Co-tenure holders with share percentages, optional possession geometry
- **Partition Model**: Three plan types (compactness, possession, commercial), status workflow (draft→generated→approved/rejected)
- **Score Model**: All 7 Rule 109 metrics stored per plan
- **Kurra/Decree Models**: Report storage with PDF paths and legal references

### GIS Engine (`app/services/gis/`)
- **Geometry Operations**: Area, perimeter, compactness (Polsby-Popper), road frontage calculation
- **Spatial Analysis**: Intersection, union, difference, buffer, simplification
- **Voronoi Partitioning**: Weighted Voronoi for proportional land division
- **Coordinate Conversion**: GeoJSON ↔ Shapely ↔ WKT
- **Spatial Analysis**: Frontage analysis, commercial value, possession overlay, accessibility

### Partition Engine (`app/services/partition/`)
- **Plan A (Compactness)**: Equal-area Voronoi partitioning with compactness optimization
- **Plan B (Possession)**: Weighted by existing possession patterns
- **Plan C (Commercial)**: Weighted by road frontage and commercial value
- **Multi-Objective Optimization**: Balances all three objectives
- **Boundary Adjustment**: Fine-tunes partition boundaries to meet area targets

### Rule 109 Engine (`app/services/legal/`)
- **109(a) Share Compliance**: Checks proportional allocation vs ownership
- **109(b) Compactness**: Polsby-Popper compactness index for each allotment
- **109(c) Land Quality**: Ensures no owner gets only superior/inferior land
- **109(d) Field Preservation**: Minimizes unnecessary field splitting
- **109(e) Possession Preservation**: Scores overlap with existing possession
- **109(f) Commercial Fairness**: Road frontage and commercial value distribution
- **109(g) Family Settlement**: Respects mutual arrangements

### AI Engine (`app/services/ai/`)
- **Recommendation Engine**: Ranks plans by overall score with trade-off analysis
- **Explanation Engine**: Human-readable reasoning for each allotment decision
- **Legal Knowledge Base**: UP Revenue Code Section 116, Rule 109 clauses, legal precedents
- **No external LLM dependency**: Pure rule-based reasoning layer

### Report Engine (`app/services/reports/`)
- **Kurra Report**: Parcel details, owners, shares, GIS maps, frontage analysis, Rule compliance
- **Preliminary Decree**: Ownership shares, valuation, legal references
- **Final Decree**: Metes and bounds, final parcel allocation, GIS maps
- **Multi-Format Export**: PDF, GeoJSON, KML, Shapefile, CSV, JSON

### BhuNaksha Integration (`app/services/bhunaksha/`)
- **API Adapter**: Direct integration with Bihar BhuNaksha endpoints (getPlotAtXY, getPointsFromPNIU, ScalarDataHandler, WMS)
- **Playwright Fallback**: Browser automation when APIs fail
- **Extensible Architecture**: Support for UP, MP, Rajasthan state portals

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | User registration |
| GET | `/api/v1/auth/me` | Current user profile |
| GET | `/api/v1/parcels` | List parcels (paginated) |
| POST | `/api/v1/parcels` | Create parcel |
| GET | `/api/v1/parcels/{id}` | Get parcel detail |
| PUT | `/api/v1/parcels/{id}` | Update parcel |
| DELETE | `/api/v1/parcels/{id}` | Delete parcel |
| GET | `/api/v1/parcels/{id}/geometry` | Get parcel geometry (GeoJSON) |
| POST | `/api/v1/parcels/{id}/owners` | Add owners to parcel |
| GET | `/api/v1/parcels/{id}/owners` | List parcel owners |
| POST | `/api/v1/parcels/upload` | Upload GIS file |
| POST | `/api/v1/parcels/bhunaksha/fetch` | Fetch from BhuNaksha |
| POST | `/api/v1/partition/generate` | Generate 3 partition plans |
| GET | `/api/v1/partition/plans` | List plans for parcel |
| GET | `/api/v1/partition/plans/{id}` | Plan detail with scores |
| GET | `/api/v1/partition/plans/{id}/comparison` | Compare all plans |
| GET | `/api/v1/partition/plans/{id}/allotments/{aid}/explain` | AI explanation |
| POST | `/api/v1/partition/plans/{id}/approve` | Approve plan |
| POST | `/api/v1/partition/plans/{id}/reject` | Reject plan |
| GET | `/api/v1/partition/recommendations` | AI recommendations |
| POST | `/api/v1/reports/kurra/{plan_id}` | Generate Kurra report |
| POST | `/api/v1/reports/preliminary-decree/{plan_id}` | Preliminary decree |
| POST | `/api/v1/reports/final-decree/{plan_id}` | Final decree |
| GET | `/api/v1/reports/{id}/download` | Download report PDF |
| POST | `/api/v1/reports/export/{plan_id}` | Export in format |

## Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with database credentials
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

## Testing

```bash
pytest tests/ -v --cov=app
```
