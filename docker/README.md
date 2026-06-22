# DevOps & Deployment Module

**Docker, Nginx, CI/CD Configuration**

## Overview

The DevOps module provides containerized deployment of all GeoKurra services using Docker Compose. It includes PostgreSQL with PostGIS, Redis caching, FastAPI backend, Next.js frontend, Nginx reverse proxy, and Celery worker for async tasks.

## Files

### `docker-compose.yml` - Multi-Service Orchestration

**Services:**

| Service | Image/Port | Description |
|---------|------------|-------------|
| `postgis` | postgis/postgis:16-3.4 (5432) | Spatial database |
| `redis` | redis:7-alpine (6379) | Cache + task queue |
| `backend` | Custom (8000) | FastAPI application |
| `frontend` | Custom (3000) | Next.js application |
| `nginx` | nginx:alpine (80/443) | Reverse proxy |
| `celery-worker` | Custom | Async task processing |

**Networks:**
- `geokurra-network`: Bridge network connecting all services

**Volumes:**
- `postgis_data`: Persistent database storage
- `redis_data`: Cache persistence
- `backend_media`: Uploaded files
- `backend_reports`: Generated PDF reports

### `nginx.conf` - Reverse Proxy Configuration

**Features:**
- SSL/TLS termination (HTTP → HTTPS redirect)
- Frontend proxy at `/`
- Backend API proxy at `/api/`
- Static file serving at `/media/`
- API docs proxy at `/docs`
- Health check at `/health`
- Gzip compression
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- CORS headers for API endpoints

### Dockerfiles

#### Backend Dockerfile (multi-stage)
- **Stage 1 (builder)**: Python 3.12-slim, installs dependencies, runs tests
- **Stage 2 (runtime)**: Minimal Python 3.12-slim, copies site-packages and app code
- Health check, non-root user, proper signal handling

#### Frontend Dockerfile (multi-stage)
- **Stage 1 (deps)**: Node 20-alpine, npm install
- **Stage 2 (builder)**: Build Next.js application
- **Stage 3 (runner)**: Minimal Node 20-alpine, runs standalone server

## Key Changes

- Health checks on all services (PostGIS, Redis, backend)
- Proper service dependency ordering with `condition: service_healthy`
- Alembic migration runs automatically on backend startup
- Backend runs with 4 workers in production
- Nginx configured with security best practices
- CORS explicitly configured for frontend origins
- Non-root user for container security

## Deployment Commands

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend frontend

# Rebuild specific service
docker-compose up -d --build backend

# Run migrations
docker-compose exec backend alembic upgrade head

# Seed data
docker-compose exec backend python scripts/seed.py

# Create admin user
docker-compose exec backend python scripts/create_admin.py

# Run tests
docker-compose exec backend pytest

# Stop all
docker-compose down
```

### Production
```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with production values

# Generate SSL certificates
# Place in docker/ssl/

# Build and start
docker-compose -f docker-compose.yml up -d --build

# Initialize
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed.py

# Monitor
docker-compose logs -f --tail=100
```

### Backup/Restore
```bash
# Backup database
docker-compose exec postgis pg_dump -U geokurra geokurra > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgis psql -U geokurra geokurra
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | (required) | JWT signing key |
| `DATABASE_URL` | postgresql+asyncpg://... | PostgreSQL connection |
| `REDIS_URL` | redis://redis:6379/0 | Redis connection |
| `CORS_ORIGINS` | http://localhost:3000 | Allowed origins |
| `ENVIRONMENT` | production | Runtime environment |
| `DEBUG` | false | Debug mode |
| `BHUNakSHA_BASE_URL` | https://bhunaksha.bihar.gov.in | BhuNaksha portal |

## System Requirements

- Docker Engine 24+
- Docker Compose 2.20+
- 4GB RAM minimum (8GB recommended)
- 20GB disk space
- CPU with 4+ cores
- Network access for GIS tile services
