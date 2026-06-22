import logging
import math
from typing import Any, Dict, List, Optional, Tuple

from shapely.geometry import shape, Polygon

from app.services.gis.geometry_engine import calculate_area, calculate_compactness
from app.services.partition.voronoi import generate_weighted_voronoi, clip_voronoi_to_parcel, adjust_boundaries
from app.services.partition.compactness import calculate_compactness_score

logger = logging.getLogger(__name__)


def optimize_partition(
    initial_partitions: List[Any],
    targets: List[float],
    constraints: Optional[Dict[str, Any]] = None,
) -> List[Any]:
    if constraints is None:
        constraints = {}
    if len(initial_partitions) != len(targets):
        return initial_partitions

    total_area = sum(calculate_area(p) for p in initial_partitions)
    if total_area <= 0:
        return initial_partitions

    scale_factors = [t / (calculate_area(p) / total_area * total_area) if calculate_area(p) > 0 else 1.0 for p, t in zip(initial_partitions, targets)]
    avg_scale = sum(scale_factors) / len(scale_factors)
    normalized = [s / avg_scale for s in scale_factors]

    optimized = []
    for p, s in zip(initial_partitions, normalized):
        try:
            from shapely.affinity import scale as shapely_scale
            centroid = p.centroid
            scaled = shapely_scale(p, xfact=math.sqrt(s), yfact=math.sqrt(s), origin=(centroid.x, centroid.y))
            if not scaled.is_empty:
                optimized.append(scaled)
            else:
                optimized.append(p)
        except Exception:
            optimized.append(p)
    return optimized


def calculate_water_optimal(
    partitions: List[Any], water_features: List[Any]
) -> Dict[str, Any]:
    scores = []
    for part in partitions:
        water_access = 0.0
        for wf in water_features:
            wf_geom = shape(wf["geometry"]) if isinstance(wf, dict) else wf
            dist = part.distance(wf_geom)
            if dist < 50:
                water_access += 1.0
            elif dist < 100:
                water_access += 0.5
        scores.append(water_access)
    return {
        "scores": scores,
        "average_score": sum(scores) / len(scores) if scores else 0,
    }


def minimize_road_distance(
    partitions: List[Any], road_network: List[Any]
) -> Dict[str, Any]:
    distances = []
    for part in partitions:
        min_dist = float("inf")
        for road in road_network:
            road_geom = shape(road["geometry"]) if isinstance(road, dict) else road
            dist = part.distance(road_geom)
            min_dist = min(min_dist, dist)
        distances.append(min_dist if min_dist != float("inf") else 0)

    score = 0
    if distances:
        avg_dist = sum(distances) / len(distances)
        score = max(0, 100 - avg_dist)

    return {
        "distances": distances,
        "average_distance": sum(distances) / len(distances) if distances else 0,
        "accessibility_score": min(score, 100),
    }


def balance_factors(partitions: List[Any], weights: Dict[str, float]) -> Dict[str, Any]:
    compactness_scores = [calculate_compactness_score(p) for p in partitions]
    areas = [calculate_area(p) for p in partitions]
    total_area = sum(areas)

    area_balance = 100.0
    if len(areas) > 1 and total_area > 0:
        target = total_area / len(areas)
        deviations = [abs(a - target) / target * 100 for a in areas]
        area_balance = max(0, 100 - sum(deviations) / len(deviations))

    avg_compactness = sum(compactness_scores) / len(compactness_scores) if compactness_scores else 0
    weights = weights or {"compactness": 0.5, "area_balance": 0.5}
    weighted_score = (
        weights.get("compactness", 0.5) * avg_compactness
        + weights.get("area_balance", 0.5) * area_balance
    )

    return {
        "compactness_scores": compactness_scores,
        "avg_compactness": avg_compactness,
        "area_balance_score": area_balance,
        "weighted_score": weighted_score,
        "partition_areas": areas,
    }


def multi_objective_optimization(
    parcel: Any, owners: List[Dict[str, Any]]
) -> Dict[str, Any]:
    from app.services.gis.geometry_engine import geojson_to_shapely

    geom = parcel
    if isinstance(parcel, dict) and "geometry" in parcel:
        geom = geojson_to_shapely(parcel["geometry"])
    elif isinstance(parcel, dict):
        geom = geojson_to_shapely(parcel)

    total_area = calculate_area(geom)
    num_owners = len(owners)
    weights = [o["share_percentage"] / 100.0 for o in owners]

    compactness_partitions = generate_weighted_voronoi(geom, num_owners, weights)
    compactness_partitions = clip_voronoi_to_parcel(compactness_partitions, geom)
    compactness_partitions = adjust_boundaries(compactness_partitions, weights, total_area)

    possession_weights = [weights[i] for i in range(num_owners)]
    for i, o in enumerate(owners):
        if o.get("existing_possession"):
            possession_weights[i] *= 1.5
    total_w = sum(possession_weights)
    if total_w > 0:
        possession_weights = [w / total_w for w in possession_weights]
    possession_partitions = generate_weighted_voronoi(geom, num_owners, possession_weights)
    possession_partitions = clip_voronoi_to_parcel(possession_partitions, geom)
    possession_partitions = adjust_boundaries(possession_partitions, weights, total_area)

    commercial_weights = [weights[i] for i in range(num_owners)]
    for i, o in enumerate(owners):
        if o.get("road_frontage_score", 0) > 0:
            commercial_weights[i] *= (1 + o.get("road_frontage_score", 0) / 100)
    total_cw = sum(commercial_weights)
    if total_cw > 0:
        commercial_weights = [w / total_cw for w in commercial_weights]
    commercial_partitions = generate_weighted_voronoi(geom, num_owners, commercial_weights)
    commercial_partitions = clip_voronoi_to_parcel(commercial_partitions, geom)
    commercial_partitions = adjust_boundaries(commercial_partitions, weights, total_area)

    return {
        "compactness_plan": compactness_partitions,
        "possession_plan": possession_partitions,
        "commercial_plan": commercial_partitions,
        "owners": owners,
    }
