import logging
import math
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.services.gis.geometry_engine import calculate_area, calculate_compactness

logger = logging.getLogger(__name__)

DEFAULT_WEIGHTS = {
    "compactness": 0.30,
    "share": 0.20,
    "road_frontage": 0.15,
    "commercial_fairness": 0.15,
    "possession_preservation": 0.10,
    "field_preservation": 0.05,
    "family_settlement": 0.05,
}


def calculate_share_compliance(
    allocations: List[Dict[str, Any]], shares: List[float]
) -> float:
    if not allocations or not shares:
        return 0.0
    total_deviation = 0.0
    for i, alloc in enumerate(allocations):
        if i < len(shares):
            expected_share = shares[i]
            actual_share = alloc.get("actual_share_percentage", 0)
            deviation = abs(expected_share - actual_share)
            total_deviation += deviation
    avg_deviation = total_deviation / len(allocations)
    return max(0, min(100, 100 - avg_deviation * 2))


def calculate_compactness_score(allocations: List[Dict[str, Any]]) -> float:
    if not allocations:
        return 0.0
    total_score = 0.0
    for alloc in allocations:
        geom = alloc.get("geometry")
        if geom:
            from shapely.geometry import shape as shapely_shape
            g = shapely_shape(geom) if isinstance(geom, dict) else geom
            comp = calculate_compactness(g)
            total_score += comp * 100
        else:
            total_score += 0
    return total_score / len(allocations)


def calculate_road_frontage_score(
    allocations: List[Dict[str, Any]], road_data: Optional[List[Dict[str, Any]]] = None
) -> float:
    if not allocations:
        return 0.0
    frontages = [a.get("road_frontage_length", 0) for a in allocations]
    if not frontages:
        return 0.0
    max_frontage = max(frontages)
    if max_frontage <= 0:
        return 50.0 if road_data else 100.0
    fairness = 100 - (max(frontages) - min(frontages)) / max_frontage * 100
    return max(0, fairness)


def calculate_commercial_fairness_score(
    allocations: List[Dict[str, Any]], commercial_data: Optional[List[Dict[str, Any]]] = None
) -> float:
    if not allocations:
        return 0.0
    scores = [a.get("commercial_value_score", 0) for a in allocations]
    if not scores or max(scores) <= 0:
        return 100.0
    variance = sum((s - sum(scores) / len(scores)) ** 2 for s in scores) / len(scores)
    fairness = max(0, 100 - math.sqrt(variance) * 10)
    return fairness


def calculate_field_preservation_score(
    allocations: List[Dict[str, Any]], original_fields: Optional[Dict[str, Any]] = None
) -> float:
    if not allocations:
        return 0.0
    total_perimeter = 0.0
    for alloc in allocations:
        geom = alloc.get("geometry")
        if geom:
            from shapely.geometry import shape as shapely_shape
            g = shapely_shape(geom) if isinstance(geom, dict) else geom
            total_perimeter += g.length
    original_perimeter = 0
    if original_fields:
        og = original_fields.get("geometry")
        if og:
            from shapely.geometry import shape as shapely_shape
            g = shapely_shape(og) if isinstance(og, dict) else og
            original_perimeter = g.length
    if original_perimeter <= 0:
        return 100.0
    ratio = total_perimeter / (original_perimeter * len(allocations))
    score = max(0, min(100, 100 - (ratio - 1) * 50))
    return score


def calculate_possession_preservation_score(
    allocations: List[Dict[str, Any]], possessions: Optional[List[Dict[str, Any]]] = None
) -> float:
    if not allocations or not possessions:
        return 100.0
    total_overlap = 0.0
    for alloc in allocations:
        geom = alloc.get("geometry")
        owner_possessions = [p for p in possessions if str(p.get("owner_id")) == str(alloc.get("owner_id"))]
        if geom and owner_possessions:
            from shapely.geometry import shape as shapely_shape
            g = shapely_shape(geom) if isinstance(geom, dict) else geom
            for p in owner_possessions:
                pg = p.get("geometry")
                if pg:
                    pg_shape = shapely_shape(pg) if isinstance(pg, dict) else pg
                    overlap = g.intersection(pg_shape)
                    total_overlap += overlap.area
    total_possession_area = sum(p.get("area", 0) for p in possessions)
    if total_possession_area <= 0:
        return 100.0
    return min(100, total_overlap / total_possession_area * 100)


def calculate_family_settlement_score(
    allocations: List[Dict[str, Any]], settlements: Optional[List[Dict[str, Any]]] = None
) -> float:
    if not settlements:
        return 100.0
    return 100.0


def calculate_overall_score(
    scores: Dict[str, float], weights: Optional[Dict[str, float]] = None
) -> float:
    if weights is None:
        weights = DEFAULT_WEIGHTS
    overall = 0.0
    for key, weight in weights.items():
        score_value = scores.get(key, 0)
        overall += score_value * weight
    return round(overall, 2)


class ScoreManager:
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or DEFAULT_WEIGHTS.copy()

    def compute_all(
        self,
        allocations: List[Dict[str, Any]],
        owners: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        if context is None:
            context = {}
        shares = [o.get("share_percentage", 0) / 100 * 100 for o in owners]

        share_compliance = calculate_share_compliance(allocations, shares)
        compactness = calculate_compactness_score(allocations)
        road_frontage = calculate_road_frontage_score(allocations, context.get("roads"))
        commercial = calculate_commercial_fairness_score(allocations, context.get("commercial_zones"))
        field = calculate_field_preservation_score(allocations, context.get("original_parcel"))
        possession = calculate_possession_preservation_score(allocations, context.get("possessions"))
        settlement = calculate_family_settlement_score(allocations, context.get("settlements"))

        scores = {
            "share_compliance": round(share_compliance, 2),
            "compactness": round(compactness, 2),
            "road_frontage": round(road_frontage, 2),
            "commercial_fairness": round(commercial, 2),
            "field_preservation": round(field, 2),
            "possession_preservation": round(possession, 2),
            "family_settlement": round(settlement, 2),
        }

        overall = calculate_overall_score(scores, self.weights)

        return {
            **scores,
            "overall_score": overall,
            "details": {
                "weights_used": self.weights,
                "num_allocations": len(allocations),
                "num_owners": len(owners),
            },
        }

    def set_weights(self, weights: Dict[str, float]) -> None:
        self.weights = weights
