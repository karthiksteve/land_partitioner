import logging
import math
from typing import Any, List, Optional, Tuple

import numpy as np
from shapely.geometry import Point, Polygon, MultiPolygon, box, shape
from shapely.ops import voronoi_diagram, unary_union
from scipy.spatial import Voronoi

from app.services.gis.geometry_engine import calculate_area

logger = logging.getLogger(__name__)


def generate_weighted_voronoi(
    parcel_geometry: Any, num_parts: int, weights: Optional[List[float]] = None
) -> List[Any]:
    if isinstance(parcel_geometry, dict):
        parcel_geometry = shape(parcel_geometry)
    if weights is None:
        weights = [1.0 / num_parts] * num_parts

    min_x, min_y, max_x, max_y = parcel_geometry.bounds

    points = []
    for i in range(num_parts):
        weighted_idx = sorted(range(len(weights)), key=lambda k: weights[k], reverse=True)[i]
        weight = weights[weighted_idx]
        px = min_x + (max_x - min_x) * ((i + 0.5) / num_parts) * math.sqrt(weight)
        py = min_y + (max_y - min_y) * ((i + 0.5) / num_parts) * math.sqrt(weight)
        points.append(Point(px, py))

    envelope = Polygon([
        (min_x - 100, min_y - 100),
        (max_x + 100, min_y - 100),
        (max_x + 100, max_y + 100),
        (min_x - 100, max_y + 100),
    ])

    try:
        regions = voronoi_diagram(unary_union(points), envelope=envelope)
        clipped = clip_voronoi_to_parcel(
            [regions] if regions.geom_type != "GeometryCollection" else list(regions.geoms),
            parcel_geometry,
        )
        return clipped
    except Exception as e:
        logger.error(f"Weighted Voronoi failed: {e}")
        return _fallback_partition(parcel_geometry, num_parts)


def generate_centroidal_voronoi(
    parcel_geometry: Any, num_parts: int, iterations: int = 100
) -> List[Any]:
    if isinstance(parcel_geometry, dict):
        parcel_geometry = shape(parcel_geometry)

    min_x, min_y, max_x, max_y = parcel_geometry.bounds

    seeds_x = np.random.uniform(min_x, max_x, num_parts)
    seeds_y = np.random.uniform(min_y, max_y, num_parts)
    seeds = np.column_stack([seeds_x, seeds_y])

    for iteration in range(iterations):
        vor = Voronoi(seeds)
        new_seeds = []
        for i in range(num_parts):
            region_idx = vor.point_region[i]
            region_vertices = vor.regions[region_idx]
            if -1 in region_vertices or len(region_vertices) == 0:
                new_seeds.append(seeds[i])
                continue
            polygon_pts = [vor.vertices[v] for v in region_vertices]
            try:
                cell_poly = Polygon(polygon_pts).intersection(parcel_geometry)
                if cell_poly.is_empty:
                    new_seeds.append(seeds[i])
                else:
                    centroid = cell_poly.centroid
                    new_seeds.append([centroid.x, centroid.y])
            except Exception:
                new_seeds.append(seeds[i])
        seeds = np.array(new_seeds)

    vor = Voronoi(seeds)
    regions = []
    for i in range(num_parts):
        region_idx = vor.point_region[i]
        region_vertices = vor.regions[region_idx]
        if -1 in region_vertices or len(region_vertices) == 0:
            continue
        polygon_pts = [vor.vertices[v] for v in region_vertices]
        try:
            cell_poly = Polygon(polygon_pts)
            if not cell_poly.is_empty:
                regions.append(cell_poly)
        except Exception:
            continue

    return regions


def clip_voronoi_to_parcel(
    voronoi_regions: List[Any], parcel_geometry: Any
) -> List[Any]:
    clipped = []
    for region in voronoi_regions:
        intersection = region.intersection(parcel_geometry)
        if not intersection.is_empty:
            if intersection.geom_type == "Polygon":
                clipped.append(intersection)
            elif intersection.geom_type == "MultiPolygon":
                for geom in intersection.geoms:
                    if not geom.is_empty:
                        clipped.append(geom)
    return clipped


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
    adjusted = []
    for p in partitions:
        try:
            from shapely.affinity import scale as shapely_scale
            centroid = p.centroid
            scaled = shapely_scale(p, xfact=math.sqrt(scale), yfact=math.sqrt(scale), origin=(centroid.x, centroid.y))
            if scaled.is_empty:
                adjusted.append(p)
            else:
                adjusted.append(scaled)
        except Exception:
            adjusted.append(p)
    return adjusted


def _fallback_partition(geometry: Any, num_parts: int) -> List[Any]:
    min_x, min_y, max_x, max_y = geometry.bounds
    width = (max_x - min_x) / num_parts
    parts = []
    for i in range(num_parts):
        cell = box(min_x + i * width, min_y, min_x + (i + 1) * width, max_y)
        intersection = cell.intersection(geometry)
        if not intersection.is_empty:
            parts.append(intersection)
    return parts
