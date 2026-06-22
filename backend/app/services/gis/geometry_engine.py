import logging
import math
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from shapely import wkt
from shapely.geometry import (
    GeometryCollection, LineString, MultiPolygon, Point, Polygon, mapping, shape,
)
from shapely.ops import clip_by_rect, unary_union, voronoi_diagram
from shapely.geometry.polygon import orient

logger = logging.getLogger(__name__)


def extract_parcel_geometry(geometry: Any) -> Dict[str, Any]:
    geom = geojson_to_shapely(geometry) if isinstance(geometry, dict) else geometry
    area = calculate_area(geom)
    perimeter = calculate_perimeter(geom)
    centroid = geom.centroid
    bounds = geom.bounds
    vertices = list(geom.exterior.coords) if geom.exterior else []
    return {
        "area": area,
        "area_unit": "sq_meter",
        "perimeter": perimeter,
        "centroid": {"lat": centroid.y, "lng": centroid.x},
        "bounds": {
            "min_x": bounds[0], "min_y": bounds[1],
            "max_x": bounds[2], "max_y": bounds[3],
        },
        "num_vertices": len(vertices),
        "vertices": [{"lat": v[1], "lng": v[0]} for v in vertices],
        "wkt": shapely_to_wkt(geom),
        "geojson": shapely_to_geojson(geom),
    }


def calculate_area(geometry: Any) -> float:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    return float(geometry.area)


def calculate_perimeter(geometry: Any) -> float:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    return float(geometry.length)


def calculate_compactness(geometry: Any) -> float:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    area = geometry.area
    perimeter = geometry.length
    if perimeter <= 0 or area <= 0:
        return 0.0
    return float((4 * math.pi * area) / (perimeter * perimeter))


def calculate_road_frontage(geometry: Any, road_geometry: Any) -> float:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    if isinstance(road_geometry, dict):
        road_geometry = geojson_to_shapely(road_geometry)
    intersection = geometry.intersection(road_geometry)
    if intersection.is_empty:
        return 0.0
    return float(intersection.length)


def buffer_analysis(geometry: Any, distance: float) -> Any:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    return geometry.buffer(distance)


def intersection_analysis(geom1: Any, geom2: Any) -> Any:
    if isinstance(geom1, dict):
        geom1 = geojson_to_shapely(geom1)
    if isinstance(geom2, dict):
        geom2 = geojson_to_shapely(geom2)
    return geom1.intersection(geom2)


def union_analysis(geometries: List[Any]) -> Any:
    resolved = []
    for g in geometries:
        resolved.append(geojson_to_shapely(g) if isinstance(g, dict) else g)
    return unary_union(resolved)


def difference_analysis(geom1: Any, geom2: Any) -> Any:
    if isinstance(geom1, dict):
        geom1 = geojson_to_shapely(geom1)
    if isinstance(geom2, dict):
        geom2 = geojson_to_shapely(geom2)
    return geom1.difference(geom2)


def simplify_geometry(geometry: Any, tolerance: float) -> Any:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    return geometry.simplify(tolerance, preserve_topology=True)


def split_parcel(
    geometry: Any, split_ratio: float, direction: str = "vertical"
) -> Tuple[Any, Any]:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    if not isinstance(geometry, (Polygon, MultiPolygon)):
        raise ValueError("Geometry must be a Polygon or MultiPolygon")

    min_x, min_y, max_x, max_y = geometry.bounds
    centroid = geometry.centroid

    if direction == "vertical":
        total_width = max_x - min_x
        split_x = min_x + total_width * split_ratio
        split_line = LineString([(split_x, min_y - 1), (split_x, max_y + 1)])
    elif direction == "horizontal":
        total_height = max_y - min_y
        split_y = min_y + total_height * split_ratio
        split_line = LineString([(min_x - 1, split_y), (max_x + 1, split_y)])
    elif direction == "diagonal":
        angle = split_ratio * math.pi
        dx = math.cos(angle) * (max_x - min_x + max_y - min_y)
        dy = math.sin(angle) * (max_x - min_x + max_y - min_y)
        p1 = (centroid.x - dx / 2, centroid.y - dy / 2)
        p2 = (centroid.x + dx / 2, centroid.y + dy / 2)
        split_line = LineString([p1, p2])
    else:
        raise ValueError(f"Unknown direction: {direction}")

    left_parts = []
    right_parts = []
    for geom in [geometry] if geometry.geom_type == "Polygon" else geometry.geoms:
        bounds = geom.bounds
        if bounds[2] < split_line.bounds[0] or bounds[0] > split_line.bounds[2]:
            if bounds[0] < split_line.centroid.x:
                left_parts.append(geom)
            else:
                right_parts.append(geom)
            continue
        try:
            chopped = clip_by_rect(geom, split_line.bounds[0] - 1, split_line.bounds[1] - 1,
                                     split_line.bounds[2] + 1, split_line.bounds[3] + 1)
            left = geom.difference(chopped) if direction == "vertical" else geom.intersection(chopped)
            right = geom.difference(left)
            if not left.is_empty:
                left_parts.append(left)
            if not right.is_empty:
                right_parts.append(right)
        except Exception:
            left_parts.append(geom)
            right_parts.append(geom)

    part1 = unary_union(left_parts) if left_parts else geometry
    part2 = unary_union(right_parts) if right_parts else geometry
    return part1, part2


def voronoi_partition(
    parcel_geometry: Any, num_parts: int, weights: Optional[List[float]] = None
) -> List[Any]:
    if isinstance(parcel_geometry, dict):
        parcel_geometry = geojson_to_shapely(parcel_geometry)
    if weights is None:
        weights = [1.0 / num_parts] * num_parts

    min_x, min_y, max_x, max_y = parcel_geometry.bounds
    points = []
    for i in range(num_parts):
        px = min_x + (max_x - min_x) * ((i + 0.5) / num_parts)
        py = min_y + (max_y - min_y) * ((i + 0.5) / num_parts)
        points.append(Point(px, py))

    envelope = Polygon([
        (min_x - 0.1, min_y - 0.1),
        (max_x + 0.1, min_y - 0.1),
        (max_x + 0.1, max_y + 0.1),
        (min_x - 0.1, max_y + 0.1),
    ])

    try:
        regions = voronoi_diagram(unary_union(points), envelope=envelope)
        clipped = []
        if regions.geom_type == "GeometryCollection":
            for geom in regions.geoms:
                clipped_geom = geom.intersection(parcel_geometry)
                if not clipped_geom.is_empty:
                    clipped.append(clipped_geom)
        elif regions.geom_type == "Polygon":
            clipped_geom = regions.intersection(parcel_geometry)
            if not clipped_geom.is_empty:
                clipped.append(clipped_geom)
        else:
            clipped = [parcel_geometry]

        result = adjust_boundaries(clipped, weights, calculate_area(parcel_geometry))
        return result
    except Exception as e:
        logger.error(f"Voronoi partition failed: {e}")
        return equal_area_split(parcel_geometry, num_parts)


def equal_area_split(geometry: Any, num_parts: int) -> List[Any]:
    if isinstance(geometry, dict):
        geometry = geojson_to_shapely(geometry)
    min_x, min_y, max_x, max_y = geometry.bounds
    total_area = geometry.area
    target_area = total_area / num_parts

    slices = []
    current_x = min_x
    slice_width = (max_x - min_x) / num_parts

    for i in range(num_parts):
        next_x = min_x + (i + 1) * slice_width
        clip_box = Polygon([
            (current_x, min_y - 0.1),
            (next_x, min_y - 0.1),
            (next_x, max_y + 0.1),
            (current_x, max_y + 0.1),
        ])
        sliced = geometry.intersection(clip_box)
        if not sliced.is_empty:
            slices.append(sliced)
        current_x = next_x
    return slices


def angulation_partition(
    parcel_geometry: Any, num_parts: int, weights: Optional[List[float]] = None
) -> List[Any]:
    if isinstance(parcel_geometry, dict):
        parcel_geometry = geojson_to_shapely(parcel_geometry)
    if weights is None:
        weights = [1.0 / num_parts] * num_parts
    centroid = parcel_geometry.centroid
    total_area = parcel_geometry.area
    target_areas = [total_area * w for w in weights]

    angles = sorted([2 * math.pi * i / num_parts for i in range(num_parts)])
    parts = []
    for i in range(num_parts):
        start_angle = angles[i]
        end_angle = angles[(i + 1) % num_parts]
        if end_angle <= start_angle:
            end_angle += 2 * math.pi

        coords = [(centroid.x, centroid.y)]
        num_steps = 36
        for j in range(num_steps + 1):
            theta = start_angle + (end_angle - start_angle) * j / num_steps
            r = 1000000.0
            cx = centroid.x + r * math.cos(theta)
            cy = centroid.y + r * math.sin(theta)
            coords.append((cx, cy))
        coords.append((centroid.x, centroid.y))
        wedge = Polygon(coords)
        part = wedge.intersection(parcel_geometry)
        if not part.is_empty:
            parts.append(part)
    return parts


def adjust_boundaries(
    partitions: List[Any], target_weights: List[float], total_area: float
) -> List[Any]:
    if len(partitions) != len(target_weights):
        return partitions
    target_areas = [total_area * w for w in target_weights]
    current_areas = [calculate_area(p) for p in partitions]
    total_current = sum(current_areas)
    if total_current <= 0:
        return partitions

    scale = total_area / total_current
    if abs(scale - 1.0) < 0.001:
        return partitions

    adjusted = []
    for p in partitions:
        if not p.is_empty:
            centroid = p.centroid
            scaled = _scale_geometry(p, centroid, scale)
            if scaled.is_empty:
                adjusted.append(p)
            else:
                adjusted.append(scaled)
        else:
            adjusted.append(p)

    final_areas = [calculate_area(a) for a in adjusted]
    total_final = sum(final_areas)
    if total_final > 0:
        final_scale = total_area / total_final
        adjusted = [_scale_geometry(a, a.centroid, final_scale) if not a.is_empty else a for a in adjusted]
    return adjusted


def _scale_geometry(geom: Any, center: Point, factor: float) -> Any:
    if geom.is_empty:
        return geom
    try:
        from shapely.affinity import scale
        return scale(geom, xfact=factor, yfact=factor, origin=(center.x, center.y))
    except Exception:
        return geom


def geojson_to_shapely(geojson: Dict[str, Any]) -> Any:
    return shape(geojson)


def shapely_to_geojson(geometry: Any) -> Dict[str, Any]:
    return mapping(geometry)


def wkt_to_shapely(wkt_str: str) -> Any:
    return wkt.loads(wkt_str)


def shapely_to_wkt(geometry: Any) -> str:
    return wkt.dumps(geometry)
