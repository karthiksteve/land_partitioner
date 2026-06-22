# GIS Engine Module

**Spatial Analysis and Geometry Processing for Land Partition**

## Overview

The GIS Engine provides core spatial operations using GeoPandas, Shapely, PyProj, and GDAL. It handles all geometry manipulation, spatial analysis, and coordinate transformations required for land partition.

## Files

### `geometry_engine.py` - Core Geometry Operations

**Spatial Calculations:**
- `calculate_area(geometry)` → Area in square meters using Shapely
- `calculate_perimeter(geometry)` → Boundary length
- `calculate_compactness(geometry)` → Polsby-Popper index: `4πA/P²` (1 = perfect circle)
- `calculate_road_frontage(geometry, road_geometry)` → Shared boundary length with road

**Set Operations:**
- `intersection_analysis(geom1, geom2)` → Overlapping region
- `union_analysis(geometries)` → Merged geometry
- `difference_analysis(geom1, geom2)` → Non-overlapping portion
- `buffer_analysis(geometry, distance)` → Buffered zone

**Partition Operations:**
- `split_parcel(geometry, split_ratio, direction)` → Split polygon along line
- `voronoi_partition(parcel_geometry, num_parts, weights)` → Weighted Voronoi
- `angulation_partition(parcel_geometry, num_parts, weights)` → Angular bisector method

**Format Conversion:**
- `geojson_to_shapely(geojson)` → GeoJSON dict to Shapely geometry
- `shapely_to_geojson(geometry)` → Shapely to GeoJSON dict
- `wkt_to_shapely(wkt)` → WKT string to Shapely
- `shapely_to_wkt(geometry)` → Shapely to WKT string
- `simplify_geometry(geometry, tolerance)` → Douglas-Peucker simplification

### `spatial_analyzer.py` - Advanced Spatial Analysis

**Parcel Analysis:**
- `analyze_parcel(parcel_data)` → Comprehensive analysis: area, perimeter, compactness, centroid, bounding box, vertices count
- `calculate_frontage_analysis(geometry, roads)` → Frontage length by road segment
- `commercial_value_analysis(geometry, commercial_zones, roads)` → Value score based on proximity and access

**Overlay Analysis:**
- `possession_overlay(parcel_geometry, possession_geometries)` → Overlap percentage per owner
- `adjacency_analysis(geometry, other_parcels)` → Neighbor list with shared boundary lengths
- `overlay_analysis(layers)` → Multi-layer spatial join

**Environmental Analysis:**
- `soil_quality_analysis(parcel_id, soil_data)` → Soil classification mapping
- `accessibility_analysis(geometry, road_network)` → Distance to nearest road, travel time estimate
- `slope_analysis(geometry, dem_data)` → Average slope calculation

**Visualization:**
- `generate_heatmap_data(parcels)` → Heatmap weights for visualization

## Key Changes

- Added Polsby-Popper compactness as the primary compactness metric
- Implemented weighted Voronoi tessellation for proportional partition
- Road frontage calculated as shared boundary length with road geometry
- Commercial value scoring combines road proximity, highway access, abadi adjacency, and market proximity
- All functions handle both Polygon and MultiPolygon geometries
- Error handling for invalid geometries with graceful fallbacks

## Dependencies

- Shapely 2.0+ (geometry operations)
- GeoPandas 1.0+ (spatial DataFrame operations)
- PyProj 3.6+ (coordinate transformations)
- NumPy (numerical operations)
- SciPy (Voronoi tessellation)

## Usage

```python
from app.services.gis.geometry_engine import (
    calculate_compactness,
    voronoi_partition,
    calculate_road_frontage
)
from app.services.gis.spatial_analyzer import (
    analyze_parcel,
    possession_overlay
)

# Calculate compactness of a parcel
compactness = calculate_compactness(parcel_geometry)

# Generate weighted Voronoi for 3 owners with 50/30/20 shares
partitions = voronoi_partition(parcel_geometry, 3, [0.5, 0.3, 0.2])

# Analyze possession overlap
overlap = possession_overlay(parcel_geometry, possession_geometries)
```
