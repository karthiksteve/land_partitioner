import logging
import math
from typing import Any, Dict, List, Optional

from shapely.geometry import Polygon, MultiPolygon, Point, LineString, shape
from shapely.ops import nearest_points

from app.services.gis.geometry_engine import (
    calculate_area, calculate_perimeter, calculate_compactness,
    geojson_to_shapely, shapely_to_geojson, intersection_analysis,
)

logger = logging.getLogger(__name__)


def analyze_parcel(parcel_data: Dict[str, Any]) -> Dict[str, Any]:
    geometry = parcel_data.get("geometry")
    if not geometry:
        return {"error": "No geometry provided"}

    geom = geojson_to_shapely(geometry) if isinstance(geometry, dict) else geometry
    area = calculate_area(geom)
    perimeter = calculate_perimeter(geom)
    compactness = calculate_compactness(geom)
    centroid = geom.centroid
    bounds = geom.bounds

    return {
        "area_sq_meters": area,
        "area_in_hectares": area / 10000,
        "area_in_acres": area / 4046.86,
        "perimeter_meters": perimeter,
        "compactness": compactness,
        "centroid": {"lat": centroid.y, "lng": centroid.x},
        "bounds": {
            "min_x": bounds[0], "min_y": bounds[1],
            "max_x": bounds[2], "max_y": bounds[3],
        },
        "num_vertices": len(list(geom.exterior.coords)) if hasattr(geom, "exterior") and geom.exterior else 0,
        "is_valid": geom.is_valid,
        "geom_type": geom.geom_type,
    }


def calculate_frontage_analysis(
    geometry: Any, roads: List[Dict[str, Any]]
) -> Dict[str, Any]:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)

    total_frontage = 0.0
    road_frontages = []
    for road in roads:
        road_geom = geojson_to_shapely(road["geometry"]) if isinstance(road.get("geometry"), dict) else road.get("geometry")
        if road_geom:
            intersection = geometry.intersection(road_geom)
            if not intersection.is_empty:
                frontage = intersection.length
                total_frontage += frontage
                road_frontages.append({
                    "road_name": road.get("name", "unknown"),
                    "frontage_meters": frontage,
                    "road_type": road.get("type", "unknown"),
                })

    return {
        "total_frontage": total_frontage,
        "num_roads": len(road_frontages),
        "road_details": road_frontages,
        "frontage_score": min(total_frontage / 100.0, 1.0) * 100,
    }


def commercial_value_analysis(
    geometry: Any, commercial_zones: List[Dict[str, Any]], roads: List[Dict[str, Any]]
) -> Dict[str, Any]:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)

    total_area = geometry.area
    commercial_overlap_area = 0.0
    nearest_commercial_distance = float("inf")
    frontage_score = 0.0

    for zone in commercial_zones:
        zone_geom = geojson_to_shapely(zone["geometry"]) if isinstance(zone.get("geometry"), dict) else zone.get("geometry")
        if zone_geom:
            overlap = geometry.intersection(zone_geom)
            commercial_overlap_area += overlap.area
            dist = geometry.distance(zone_geom)
            nearest_commercial_distance = min(nearest_commercial_distance, dist)

    for road in roads:
        road_geom = geojson_to_shapely(road["geometry"]) if isinstance(road.get("geometry"), dict) else road.get("geometry")
        if road_geom:
            intersection = geometry.intersection(road_geom)
            if not intersection.is_empty:
                frontage_score += intersection.length

    commercial_potential = (commercial_overlap_area / total_area * 100) if total_area > 0 else 0
    accessibility_score = min(frontage_score / 50.0, 1.0) * 100

    return {
        "commercial_overlap_percentage": commercial_potential,
        "nearest_commercial_distance_meters": nearest_commercial_distance if nearest_commercial_distance != float("inf") else None,
        "accessibility_score": accessibility_score,
        "commercial_potential_score": (commercial_potential + accessibility_score) / 2,
    }


def possession_overlay(
    parcel_geometry: Any, possession_geometries: List[Dict[str, Any]]
) -> Dict[str, Any]:
    if isinstance(parcel_geometry, dict):
        parcel_geometry = geojson_to_shapely(parcel_geometry)

    total_area = parcel_geometry.area
    possession_details = []
    total_possession_area = 0.0

    for pg in possession_geometries:
        geom = geojson_to_shapely(pg["geometry"]) if isinstance(pg.get("geometry"), dict) else pg.get("geometry")
        if geom:
            overlap = parcel_geometry.intersection(geom)
            overlap_area = overlap.area
            total_possession_area += overlap_area
            possession_details.append({
                "owner": pg.get("owner_name", "unknown"),
                "possession_area": overlap_area,
                "possession_percentage": (overlap_area / total_area * 100) if total_area > 0 else 0,
            })

    return {
        "total_possession_area": total_possession_area,
        "possession_percentage": (total_possession_area / total_area * 100) if total_area > 0 else 0,
        "possession_details": possession_details,
    }


def adjacency_analysis(
    geometry: Any, other_parcels: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)

    results = []
    for op in other_parcels:
        op_geom = geojson_to_shapely(op["geometry"]) if isinstance(op.get("geometry"), dict) else op.get("geometry")
        if op_geom:
            shared_boundary = geometry.intersection(op_geom)
            shared_length = shared_boundary.length if not shared_boundary.is_empty else 0
            dist = geometry.distance(op_geom)
            results.append({
                "parcel_id": op.get("id", "unknown"),
                "parcel_pniu": op.get("pniu", ""),
                "shared_boundary_length": shared_length,
                "distance_meters": dist,
                "is_adjacent": shared_length > 0,
            })
    return sorted(results, key=lambda x: -x["shared_boundary_length"])


def soil_quality_analysis(parcel_id: str, soil_data: Dict[str, Any]) -> Dict[str, Any]:
    quality = soil_data.get("quality", "medium")
    quality_map = {"poor": 0.3, "medium": 0.6, "good": 0.8, "excellent": 1.0}
    score = quality_map.get(quality, 0.5)
    return {
        "parcel_id": parcel_id,
        "soil_type": soil_data.get("type", "unknown"),
        "quality": quality,
        "quality_score": score,
        "irrigation_available": soil_data.get("irrigation", False),
        "water_availability": soil_data.get("water_availability", "medium"),
    }


def accessibility_analysis(
    geometry: Any, road_network: List[Dict[str, Any]]
) -> Dict[str, Any]:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)

    distances = []
    for road in road_network:
        road_geom = geojson_to_shapely(road["geometry"]) if isinstance(road.get("geometry"), dict) else road.get("geometry")
        if road_geom:
            dist = geometry.distance(road_geom)
            distances.append({
                "road_name": road.get("name", "unknown"),
                "distance_meters": dist,
                "road_type": road.get("type", "unknown"),
            })

    min_dist = min((d["distance_meters"] for d in distances), default=float("inf"))
    access_score = max(0, 100 - min_dist) if min_dist != float("inf") else 0

    return {
        "nearest_road_distance": min_dist if min_dist != float("inf") else None,
        "road_access_score": min(access_score, 100),
        "num_accessible_roads": len(distances),
        "road_distances": distances,
    }


def slope_analysis(geometry: Any, dem_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    if dem_data and "average_slope" in dem_data:
        avg_slope = dem_data["average_slope"]
    else:
        avg_slope = 5.0

    slope_category = "flat" if avg_slope < 3 else "gentle" if avg_slope < 8 else "moderate" if avg_slope < 15 else "steep"
    suitability = "high" if avg_slope < 5 else "medium" if avg_slope < 10 else "low"

    return {
        "average_slope_degrees": avg_slope,
        "slope_category": slope_category,
        "suitability_for_construction": suitability,
        "erosion_risk": "low" if avg_slope < 5 else "medium" if avg_slope < 12 else "high",
    }


def overlay_analysis(layers: List[Dict[str, Any]]) -> Dict[str, Any]:
    result_layers = []
    combined = None

    for layer in layers:
        geom = geojson_to_shapely(layer["geometry"]) if isinstance(layer.get("geometry"), dict) else layer.get("geometry")
        if geom is not None:
            if combined is None:
                combined = geom
            else:
                operation = layer.get("operation", "union")
                if operation == "intersection":
                    combined = combined.intersection(geom)
                elif operation == "difference":
                    combined = combined.difference(geom)
                else:
                    combined = combined.union(geom)
            result_layers.append({
                "name": layer.get("name", "unknown"),
                "applied_operation": layer.get("operation", "union"),
            })

    return {
        "num_layers": len(layers),
        "result_geometry": shapely_to_geojson(combined) if combined else None,
        "result_area": calculate_area(combined) if combined else 0,
        "layers_applied": result_layers,
    }


def generate_heatmap_data(parcels: List[Dict[str, Any]]) -> Dict[str, Any]:
    heat_points = []
    for parcel in parcels:
        geom = parcel.get("geometry")
        if geom:
            g = geojson_to_shapely(geom) if isinstance(geom, dict) else geom
            centroid = g.centroid
            value = parcel.get("value", 1.0)
            heat_points.append({
                "lat": centroid.y,
                "lng": centroid.x,
                "value": value,
            })
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [p["lng"], p["lat"]]},
                "properties": {"value": p["value"]},
            }
            for p in heat_points
        ],
    }
