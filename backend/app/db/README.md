# Database Module

**PostgreSQL + PostGIS Schema and Migrations**

## Overview

The Database module manages all data persistence using PostgreSQL 16 with PostGIS 3.4 extension for spatial data. It uses SQLAlchemy 2.0 as the ORM with GeoAlchemy2 for GIS column types and Alembic for migrations.

## Files

### `base.py` - Declarative Base

- `Base`: SQLAlchemy DeclarativeBase with common column types
- `GeoMixin`: Mixin class adding id (UUID), created_at, updated_at to all models
- UUID primary keys for all tables

### `session.py` - Database Session

- `engine`: AsyncEngine configured from DATABASE_URL
- `AsyncSession`: SQLAlchemy async session factory
- `get_db()`: FastAPI dependency generator for request-scoped sessions
- Connection pool with configurable size

## Database Schema

### Tables

**users**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email |
| username | VARCHAR(100) | Unique username |
| hashed_password | VARCHAR(255) | bcrypt hash |
| full_name | VARCHAR(255) | Display name |
| phone | VARCHAR(20) | Contact number |
| is_active | BOOLEAN | Account active |
| is_superuser | BOOLEAN | Super admin |
| role | ENUM | admin/revenue_officer/surveyor/citizen |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

**parcels**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pniu | VARCHAR(100) | Permanent plot identifier |
| plot_number | VARCHAR(50) | Plot number |
| survey_number | VARCHAR(50) | Survey number |
| khata_number | VARCHAR(50) | Khata number |
| village | VARCHAR(100) | Village name |
| tehsil | VARCHAR(100) | Tehsil |
| district | VARCHAR(100) | District |
| state | VARCHAR(100) | State |
| circle | VARCHAR(100) | Circle |
| subdivision | VARCHAR(100) | Subdivision |
| total_area | FLOAT | Area in standard units |
| area_unit | VARCHAR(20) | Unit (acre/hectare/sq.m) |
| land_type | ENUM | agricultural/commercial/residential/mixed |
| soil_type | VARCHAR(100) | Soil classification |
| irrigation_available | BOOLEAN | Irrigation facility |
| well_present | BOOLEAN | Well on land |
| tubewell_present | BOOLEAN | Tubewell on land |
| trees_present | BOOLEAN | Trees on land |
| road_side | BOOLEAN | Road adjacent |
| abadi_adjacent | BOOLEAN | Abadi adjacent |
| commercial_value | BOOLEAN | Commercial value |
| geometry | GEOMETRY(Polygon, 4326) | PostGIS geometry |
| boundary_length | FLOAT | Perimeter in meters |
| vertices | JSON | Vertex coordinates |
| is_active | BOOLEAN | Soft delete |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

**owners**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| parcel_id | UUID | FK to parcels |
| owner_name | VARCHAR(255) | Owner name |
| share_percentage | FLOAT | Share (0-100) |
| existing_possession | BOOLEAN | Currently possesses |
| possession_geometry | GEOMETRY(Polygon, 4326) | Possession area |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

**partition_plans**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| parcel_id | UUID | FK to parcels |
| plan_name | VARCHAR(255) | Plan name |
| plan_type | ENUM | compactness/possession/commercial |
| description | TEXT | Description |
| parameters | JSON | Configuration |
| status | ENUM | draft/generated/approved/rejected |
| created_by | UUID | FK to users |
| is_active | BOOLEAN | Soft delete |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

**partition_parcels** (allotments)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| partition_plan_id | UUID | FK to partition_plans |
| owner_id | UUID | FK to owners |
| allocated_area | FLOAT | Area in sq meters |
| allocated_geometry | GEOMETRY(Polygon, 4326) | Allotted parcel |
| compactness_score | FLOAT | 0-100 |
| road_frontage_length | FLOAT | Road boundary |
| commercial_value_score | FLOAT | 0-100 |
| possession_score | FLOAT | 0-100 |
| allotment_order | INTEGER | Display order |
| notes | TEXT | Remarks |

**scores**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| partition_plan_id | UUID | FK |
| share_compliance | FLOAT | 0-100 |
| compactness | FLOAT | 0-100 |
| road_frontage | FLOAT | 0-100 |
| commercial_fairness | FLOAT | 0-100 |
| field_preservation | FLOAT | 0-100 |
| possession_preservation | FLOAT | 0-100 |
| family_settlement | FLOAT | 0-100 |
| overall_score | FLOAT | 0-100 |
| details | JSON | Per-owner breakdown |

**kurra_reports**, **decrees**, **audit_logs**, **roads**, **commercial_zones**, **settlements**

## Key Changes

- All geometry columns use PostGIS Geography type with SRID 4326
- Spatial indexes on geometry columns for fast queries
- Soft delete pattern (is_active) for data preservation
- Audit trail captures all mutations with old/new values
- JSON columns for flexible metadata and scoring details

## Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```
