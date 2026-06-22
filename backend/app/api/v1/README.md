# API Layer Module

**GeoKurra REST API v1 - FastAPI Endpoints**

## Overview

The API Layer exposes all GeoKurra functionality through RESTful endpoints. It handles authentication, parcel management, partition generation, plan comparison, report generation, and administrative operations. All endpoints return JSON responses with proper HTTP status codes and error handling.

## Files

### `router.py` - Route Aggregation

Aggregates all sub-routers:
- `/api/v1/auth/*` → Authentication endpoints
- `/api/v1/parcels/*` → Parcel management
- `/api/v1/partition/*` → Partition operations
- `/api/v1/reports/*` → Report generation
- `/api/v1/admin/*` → Administrative operations

### `auth.py` - Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with username/password, returns JWT | No |
| POST | `/auth/register` | Register new user account | No |
| GET | `/auth/me` | Get current user profile | Yes |
| PUT | `/auth/me` | Update user profile | Yes |
| POST | `/auth/refresh` | Refresh expired token | Yes |

**Implementation Details:**
- Login validates credentials against bcrypt hash
- JWT tokens include user_id, role, exp claims
- Registration validates email uniqueness
- Profile updates allow partial updates

### `parcels.py` - Parcel Management Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/parcels` | List parcels with search/filter/pagination | Yes |
| POST | `/parcels` | Create new parcel | Yes |
| GET | `/parcels/{id}` | Get parcel details with geometry | Yes |
| PUT | `/parcels/{id}` | Update parcel attributes | Yes |
| DELETE | `/parcels/{id}` | Delete parcel (soft) | Admin |
| GET | `/parcels/{id}/geometry` | Get parcel GeoJSON geometry | Yes |
| POST | `/parcels/{id}/owners` | Add owners to parcel | Yes |
| GET | `/parcels/{id}/owners` | List owners | Yes |
| POST | `/parcels/upload` | Upload GeoJSON/KML/shapefile | Yes |
| POST | `/parcels/bhunaksha/fetch` | Fetch parcel from BhuNaksha | Yes |

**Implementation Details:**
- Search supports: district, tehsil, village, khata_number, plot_number
- Pagination with cursor-based or offset-based
- Upload extracts geometry from multiple formats
- BhuNaksha fetch creates parcel from portal data
- Geometry stored as PostGIS geometry column

### `partition.py` - Partition Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/partition/generate` | Generate all 3 partition plans | Yes |
| GET | `/partition/plans` | List plans for a parcel | Yes |
| GET | `/partition/plans/{id}` | Plan details with scores | Yes |
| GET | `/partition/plans/{id}/comparison` | Compare all plans | Yes |
| GET | `/partition/plans/{id}/allotments` | List allotments | Yes |
| GET | `/partition/plans/{id}/allotments/{aid}/explain` | AI explanation | Yes |
| POST | `/partition/plans/{id}/approve` | Approve plan | Revenue Officer |
| POST | `/partition/plans/{id}/reject` | Reject plan | Revenue Officer |
| GET | `/partition/recommendations` | AI recommendations | Yes |

**Implementation Details:**
- Generate creates Plan A (compactness), Plan B (possession), Plan C (commercial)
- Each plan includes allotments with geometries and scores
- Comparison returns side-by-side metrics
- AI explanation returns human-readable legal reasoning
- Approve/Reject changes plan status with audit trail

### `reports.py` - Report Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reports/kurra/{plan_id}` | Generate Kurra report | Yes |
| POST | `/reports/preliminary-decree/{plan_id}` | Preliminary decree | Yes |
| POST | `/reports/final-decree/{plan_id}` | Final decree | Revenue Officer |
| GET | `/reports/{id}/download` | Download PDF | Yes |
| GET | `/reports/comparison` | Comparison report | Yes |
| POST | `/reports/export/{plan_id}` | Export in format | Yes |

**Implementation Details:**
- Reports generated as PDF using ReportLab
- Reports stored in database with file path
- Download returns file response
- Export supports: pdf, geojson, kml, csv, json, shapefile

### `admin.py` - Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/users` | List all users | Admin |
| PUT | `/admin/users/{id}/role` | Change user role | Admin |
| GET | `/admin/audit-logs` | View audit trail | Admin |
| GET | `/admin/stats` | System statistics | Admin |

## Key Changes

- All endpoints use FastAPI dependency injection for auth/db
- Proper error handling with custom exception classes
- Audit trail for all mutation operations
- Pagination for list endpoints
- Swagger/OpenAPI documentation auto-generated
- Role-based access control via dependency

## API Documentation

When running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
