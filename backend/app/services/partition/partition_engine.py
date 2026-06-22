import logging
import math
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from shapely.geometry import shape as shapely_shape

from app.services.gis.geometry_engine import (
    calculate_area, calculate_perimeter, calculate_compactness,
    geojson_to_shapely, shapely_to_geojson, voronoi_partition,
)
from app.services.partition.voronoi import (
    generate_weighted_voronoi, clip_voronoi_to_parcel, adjust_boundaries,
)
from app.services.partition.compactness import calculate_compactness_score
from app.services.partition.optimization import multi_objective_optimization

logger = logging.getLogger(__name__)


def generate_partition(
    parcel: Any, owners: List[Dict[str, Any]], mode: str = "compactness"
) -> Dict[str, Any]:
    geom = parcel
    if isinstance(parcel, dict) and "geometry" in parcel:
        geom = geojson_to_shapely(parcel["geometry"])
    elif isinstance(parcel, dict):
        geom = geojson_to_shapely(parcel)

    total_area = calculate_area(geom)
    _validate_ownership(owners)

    if mode == "compactness":
        return _generate_compactness_plan(geom, owners, total_area)
    elif mode == "possession":
        return _generate_possession_plan(geom, owners, total_area)
    elif mode == "commercial":
        return _generate_commercial_plan(geom, owners, total_area)
    else:
        logger.warning(f"Unknown mode {mode}, using compactness")
        return _generate_compactness_plan(geom, owners, total_area)


def _generate_compactness_plan(
    geom: Any, owners: List[Dict[str, Any]], total_area: float
) -> Dict[str, Any]:
    num_owners = len(owners)
    weights = [o["share_percentage"] / 100.0 for o in owners]
    allocations = _calculate_allocated_areas(total_area, weights)

    partitions = generate_weighted_voronoi(geom, num_owners, weights)
    partitions = clip_voronoi_to_parcel(partitions, geom)
    partitions = adjust_boundaries(partitions, weights, total_area)

    return _build_plan_result(partitions, allocations, owners, "compactness")


def _generate_possession_plan(
    geom: Any, owners: List[Dict[str, Any]], total_area: float
) -> Dict[str, Any]:
    num_owners = len(owners)
    weights = [o["share_percentage"] / 100.0 for o in owners]
    allocations = _calculate_allocated_areas(total_area, weights)

    possession_weights = [weights[i] for i in range(num_owners)]
    for i, o in enumerate(owners):
        if o.get("existing_possession"):
            possession_weights[i] *= 1.5
    total_w = sum(possession_weights)
    if total_w > 0:
        possession_weights = [w / total_w for w in possession_weights]

    partitions = generate_weighted_voronoi(geom, num_owners, possession_weights)
    partitions = clip_voronoi_to_parcel(partitions, geom)
    partitions = adjust_boundaries(partitions, weights, total_area)

    return _build_plan_result(partitions, allocations, owners, "possession")


def _generate_commercial_plan(
    geom: Any, owners: List[Dict[str, Any]], total_area: float
) -> Dict[str, Any]:
    num_owners = len(owners)
    weights = [o["share_percentage"] / 100.0 for o in owners]
    allocations = _calculate_allocated_areas(total_area, weights)

    commercial_weights = [weights[i] for i in range(num_owners)]
    for i, o in enumerate(owners):
        rf_score = o.get("road_frontage_score", 0)
        if rf_score > 0:
            commercial_weights[i] *= (1 + rf_score / 100)
    total_cw = sum(commercial_weights)
    if total_cw > 0:
        commercial_weights = [w / total_cw for w in commercial_weights]

    partitions = generate_weighted_voronoi(geom, num_owners, commercial_weights)
    partitions = clip_voronoi_to_parcel(partitions, geom)
    partitions = adjust_boundaries(partitions, weights, total_area)

    return _build_plan_result(partitions, allocations, owners, "commercial")


def _validate_ownership(owners: List[Dict[str, Any]]) -> None:
    total = sum(o["share_percentage"] for o in owners)
    if abs(total - 100.0) > 0.01:
        raise ValueError(f"Owner shares must sum to 100%, got {total}%")


def _calculate_allocated_areas(
    total_area: float, weights: List[float]
) -> List[float]:
    return [total_area * w for w in weights]


def _assign_parcels(
    allocations: List[Tuple[str, float]], geometries: List[Any]
) -> List[Dict[str, Any]]:
    result = []
    for i, (owner_info, area) in enumerate(allocations):
        geom = geometries[i] if i < len(geometries) else None
        result.append({
            "owner": owner_info,
            "allocated_area": area,
            "geometry": geom,
        })
    return result


def _build_plan_result(
    partitions: List[Any],
    allocations: List[float],
    owners: List[Dict[str, Any]],
    plan_type: str,
) -> Dict[str, Any]:
    allotments = []
    for i, (owner, alloc_area) in enumerate(zip(owners, allocations)):
        geom = partitions[i] if i < len(partitions) else None
        c_score = calculate_compactness_score(geom) if geom else 0
        actual_area = calculate_area(geom) if geom else 0
        allotments.append({
            "owner_id": owner.get("id"),
            "owner_name": owner.get("owner_name", f"Owner {i+1}"),
            "share_percentage": owner.get("share_percentage", 0),
            "expected_area": alloc_area,
            "actual_area": actual_area,
            "area_difference": actual_area - alloc_area,
            "compactness_score": c_score,
            "geometry": shapely_to_geojson(geom) if geom else None,
        })

    return {
        "plan_type": plan_type,
        "num_allotments": len(allotments),
        "total_area": sum(allocations),
        "allotments": allotments,
    }
