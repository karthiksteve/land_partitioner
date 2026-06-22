-- GeoKurra Database Initialization Script
-- Creates PostgreSQL database with PostGIS extension

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create spatial metadata tables
SELECT postgis_full_version();

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'revenue_officer', 'surveyor', 'citizen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE land_type AS ENUM ('agricultural', 'commercial', 'residential', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_type AS ENUM ('compactness', 'possession', 'commercial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_status AS ENUM ('draft', 'generated', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE decree_type AS ENUM ('preliminary', 'final');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE decree_status AS ENUM ('draft', 'issued', 'approved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create spatial index function for efficient GIS queries
CREATE OR REPLACE FUNCTION update_parcel_centroid()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-calculate area and perimeter from geometry
    NEW.total_area := ST_Area(NEW.geometry::geography) * 0.000247105; -- Convert sqm to acres
    NEW.boundary_length := ST_Perimeter(NEW.geometry::geography);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO geokurra;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO geokurra;
