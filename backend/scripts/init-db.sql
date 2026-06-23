-- GeoKurra Database Initialization Script
-- Run this against the PostgreSQL database before starting the application

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verify extensions
SELECT PostGIS_Version();
SELECT uuid_generate_v4();
