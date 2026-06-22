import logging
import math
from typing import Any, Dict, List, Optional, Tuple

from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.ops import unary_union

from app.services.gis.geometry_engine import calculate_area, calculate_perimeter, shapely_to_geojson

logger = logging.getLogger(__name__)


def calculate_polsby_popper(geometry: Any) -> float:
    area = calculate_area(geometry)
    perimeter = calculate_perimeter(geometry)
    if perimeter <= 0 or area <= 0:
        return 0.0
    return float((4 * math.pi * area) / (perimeter * perimeter))


def calculate_schwartzberg(geometry: Any) -> float:
    area = calculate_area(geometry)
    perimeter = calculate_perimeter(geometry)
    if perimeter <= 0 or area <= 0:
        return 0.0
    perimeter_of_circle = 2 * math.pi * math.sqrt(area / math.pi)
    return float(perimeter_of_circle / perimeter)


def calculate_compactness_score(geometry: Any) -> float:
    pp = calculate_polsby_popper(geometry)
    sc = calculate_schwartzberg(geometry)
    return float((pp + sc) / 2 * 100)


def optimize_compactness(
    geometry: Any, num_parts: int, weights: Optional[List[float]] = None
) -> List[Any]:
    if isinstance(geometry, dict):
        from shapely.geometry import shape as shapely_shape
        geometry = shapely_shape(geometry)
    if weights is None:
        weights = [1.0 / num_parts] * num_parts

    from app.services.partition.voronoi import generate_centroidal_voronoi, clip_voronoi_to_parcel, adjust_boundaries
    regions = generate_centroidal_voronoi(geometry, num_parts)
    clipped = clip_voronoi_to_parcel(regions, geometry)
    final = adjust_boundaries(clipped, weights, calculate_area(geometry))
    return final


def minimize_fragmentation(partitions: List[Any]) -> List[Any]:
    if not partitions:
        return partitions

    merged = []
    for p in partitions:
        merged.append(p)

    changed = True
    max_iterations = 10
    iteration = 0
    while changed and iteration < max_iterations:
        changed = False
        iteration += 1
        i = 0
        while i < len(merged) - 1:
            if merged[i].geom_type == "MultiPolygon" or merged[i + 1].geom_type == "MultiPolygon":
                combined = unary_union([merged[i], merged[i + 1]])
                if combined.geom_type == "Polygon":
                    merged[i] = combined
                    merged.pop(i + 1)
                    changed = True
                    continue
            i += 1

    return merged


def _polsby_popper(geometry: Any) -> float:
    return calculate_polsby_popper(geometry)


def _schwartzberg(geometry: Any) -> float:
    return calculate_schwartzberg(geometry)
