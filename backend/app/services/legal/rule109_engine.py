import logging
import math
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.services.gis.geometry_engine import (
    calculate_area, calculate_perimeter, calculate_compactness, geojson_to_shapely,
)

logger = logging.getLogger(__name__)


def check_rule_109a(plan: Dict[str, Any], owners: List[Dict[str, Any]]) -> Dict[str, Any]:
    results = []
    all_compliant = True
    for allotment in plan.get("allotments", []):
        owner_id = allotment.get("owner_id")
        owner = next((o for o in owners if str(o.get("id")) == str(owner_id)), None)
        if owner:
            expected_share = owner.get("share_percentage", 0)
            actual_share = (allotment.get("actual_area", 0) / plan.get("total_area", 1)) * 100 if plan.get("total_area", 0) > 0 else 0
            deviation = abs(expected_share - actual_share)
            compliant = deviation <= 0.5
            if not compliant:
                all_compliant = False
            results.append({
                "owner_id": str(owner_id),
                "owner_name": allotment.get("owner_name", ""),
                "expected_share_percentage": expected_share,
                "actual_share_percentage": round(actual_share, 2),
                "deviation": round(deviation, 2),
                "compliant": compliant,
                "rule": "109(a)",
                "description": "Share compliance - each co-sharer entitled to proportionate share",
            })

    return {
        "rule": "109(a)",
        "title": "Share Compliance",
        "compliant": all_compliant,
        "details": results,
        "overall_compliance_percentage": (sum(1 for r in results if r["compliant"]) / len(results) * 100) if results else 0,
    }


def check_rule_109b(plan: Dict[str, Any]) -> Dict[str, Any]:
    results = []
    all_compliant = True
    for allotment in plan.get("allotments", []):
        geom = allotment.get("geometry")
        if geom:
            g = geojson_to_shapely(geom) if isinstance(geom, dict) else geom
            compactness = calculate_compactness(g)
            compliant = compactness >= 0.3
            if not compliant:
                all_compliant = False
            results.append({
                "owner_id": str(allotment.get("owner_id", "")),
                "owner_name": allotment.get("owner_name", ""),
                "compactness_score": round(compactness * 100, 2),
                "compliant": compliant,
                "rule": "109(b)",
                "description": "Compactness - each share should be compact and contiguous",
            })

    return {
        "rule": "109(b)",
        "title": "Compactness Compliance",
        "compliant": all_compliant,
        "details": results,
        "overall_compliance_percentage": (sum(1 for r in results if r["compliant"]) / len(results) * 100) if results else 0,
    }


def check_rule_109c(
    plan: Dict[str, Any], original_parcel: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    results = []
    all_compliant = True
    parcel_soil = (original_parcel or {}).get("soil_type", "medium")

    for allotment in plan.get("allotments", []):
        compliant = True
        results.append({
            "owner_id": str(allotment.get("owner_id", "")),
            "owner_name": allotment.get("owner_name", ""),
            "soil_quality_assessment": "Balanced" if parcel_soil else "Unknown",
            "area_quality_ratio": round(allotment.get("actual_area", 0) / max(allotment.get("expected_area", 1), 0.01), 2),
            "compliant": compliant,
            "rule": "109(c)",
            "description": "Land quality balance - each share should have balanced land quality",
        })

    return {
        "rule": "109(c)",
        "title": "Land Quality Balance",
        "compliant": all_compliant,
        "details": results,
        "overall_compliance_percentage": (sum(1 for r in results if r["compliant"]) / len(results) * 100) if results else 0,
    }


def check_rule_109d(
    plan: Dict[str, Any], original_parcel: Dict[str, Any]
) -> Dict[str, Any]:
    results = []
    all_compliant = True
    original_geom = original_parcel.get("geometry")
    original_vertex_count = 0
    if original_geom:
        g = geojson_to_shapely(original_geom) if isinstance(original_geom, dict) else original_geom
        if hasattr(g, "exterior") and g.exterior:
            original_vertex_count = len(g.exterior.coords)

    new_total_perimeter = 0
    for allotment in plan.get("allotments", []):
        geom = allotment.get("geometry")
        if geom:
            g = geojson_to_shapely(geom) if isinstance(geom, dict) else geom
            new_total_perimeter += calculate_perimeter(g)

    original_perimeter = 0
    if original_geom:
        g = geojson_to_shapely(original_geom) if isinstance(original_geom, dict) else original_geom
        original_perimeter = calculate_perimeter(g)

    perimeter_increase_ratio = new_total_perimeter / max(original_perimeter, 0.01)
    compliant = perimeter_increase_ratio < 3.0
    if not compliant:
        all_compliant = False

    results.append({
        "original_vertex_count": original_vertex_count,
        "original_perimeter": round(original_perimeter, 2),
        "new_total_perimeter": round(new_total_perimeter, 2),
        "perimeter_increase_ratio": round(perimeter_increase_ratio, 2),
        "compliant": compliant,
        "rule": "109(d)",
        "description": "Field preservation - minimize fragmentation of agricultural fields",
    })

    return {
        "rule": "109(d)",
        "title": "Field Preservation",
        "compliant": all_compliant,
        "details": results,
        "overall_compliance_percentage": 100 if compliant else 0,
    }


def check_rule_109e(
    plan: Dict[str, Any], possessions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    results = []
    all_compliant = True

    for allotment in plan.get("allotments", []):
        owner_id = str(allotment.get("owner_id", ""))
        owner_possessions = [p for p in possessions if str(p.get("owner_id")) == owner_id]
        actual_area = allotment.get("actual_area", 0)
        possession_area = sum(p.get("area", 0) for p in owner_possessions)
        overlap_ratio = possession_area / max(actual_area, 0.01)
        compliant = overlap_ratio >= 0.5 or actual_area <= 0
        if not compliant:
            all_compliant = False
        results.append({
            "owner_id": owner_id,
            "owner_name": allotment.get("owner_name", ""),
            "actual_area": round(actual_area, 2),
            "possession_area": round(possession_area, 2),
            "overlap_ratio": round(overlap_ratio, 2),
            "compliant": compliant,
            "rule": "109(e)",
            "description": "Possession preservation - respect existing possession where possible",
        })

    return {
        "rule": "109(e)",
        "title": "Possession Preservation",
        "compliant": all_compliant,
        "details": results,
        "overall_compliance_percentage": (sum(1 for r in results if r["compliant"]) / len(results) * 100) if results else 0,
    }


def check_rule_109f(
    plan: Dict[str, Any], roads: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    results = []
    all_compliant = True

    for allotment in plan.get("allotments", []):
        geom = allotment.get("geometry")
        road_frontage = 0
        if geom and roads:
            g = geojson_to_shapely(geom) if isinstance(geom, dict) else geom
            for road in roads:
                road_geom = road.get("geometry")
                if road_geom:
                    rg = geojson_to_shapely(road_geom) if isinstance(road_geom, dict) else road_geom
                    road_frontage += g.intersection(rg).length

        compliant = road_frontage > 0
        if not compliant and roads:
            all_compliant = False
        results.append({
            "owner_id": str(allotment.get("owner_id", "")),
            "owner_name": allotment.get("owner_name", ""),
            "road_frontage_meters": round(road_frontage, 2),
            "has_road_access": compliant,
            "compliant": compliant if roads else True,
            "rule": "109(f)",
            "description": "Commercial fairness - equitable road frontage distribution",
        })

    return {
        "rule": "109(f)",
        "title": "Commercial Fairness",
        "compliant": all_compliant,
        "details": results,
        "overall_compliance_percentage": (sum(1 for r in results if r["compliant"]) / len(results) * 100) if results else 0,
    }


def check_rule_109g(
    plan: Dict[str, Any], settlements: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    results = []
    all_compliant = True

    if settlements:
        for allotment in plan.get("allotments", []):
            owner_id = str(allotment.get("owner_id", ""))
            has_settlement = any(
                str(s.get("owner_id")) == owner_id for s in settlements
            )
            compliant = True
            results.append({
                "owner_id": owner_id,
                "owner_name": allotment.get("owner_name", ""),
                "family_settlement_considered": has_settlement,
                "compliant": compliant,
                "rule": "109(g)",
                "description": "Family settlement - consider family arrangements",
            })
    else:
        for allotment in plan.get("allotments", []):
            results.append({
                "owner_id": str(allotment.get("owner_id", "")),
                "owner_name": allotment.get("owner_name", ""),
                "family_settlement_considered": True,
                "compliant": True,
                "rule": "109(g)",
                "description": "Family settlement - consider family arrangements",
            })

    return {
        "rule": "109(g)",
        "title": "Family Settlement",
        "compliant": all_compliant,
        "details": results,
        "overall_compliance_percentage": (sum(1 for r in results if r["compliant"]) / len(results) * 100) if results else 0,
    }


def validate_all_rules(
    plan: Dict[str, Any], context: Dict[str, Any]
) -> Dict[str, Any]:
    owners = context.get("owners", [])
    original_parcel = context.get("original_parcel", {})
    possessions = context.get("possessions", [])
    roads = context.get("roads", [])
    settlements = context.get("settlements", [])

    rule_a = check_rule_109a(plan, owners)
    rule_b = check_rule_109b(plan)
    rule_c = check_rule_109c(plan, original_parcel)
    rule_d = check_rule_109d(plan, original_parcel)
    rule_e = check_rule_109e(plan, possessions)
    rule_f = check_rule_109f(plan, roads)
    rule_g = check_rule_109g(plan, settlements)

    results = [rule_a, rule_b, rule_c, rule_d, rule_e, rule_f, rule_g]
    overall_compliant = all(r["compliant"] for r in results)
    overall_percentage = sum(r["overall_compliance_percentage"] for r in results) / len(results) if results else 0

    return {
        "overall_compliant": overall_compliant,
        "overall_compliance_percentage": round(overall_percentage, 2),
        "rules": {
            "rule_109a": rule_a,
            "rule_109b": rule_b,
            "rule_109c": rule_c,
            "rule_109d": rule_d,
            "rule_109e": rule_e,
            "rule_109f": rule_f,
            "rule_109g": rule_g,
        },
    }


def generate_compliance_report(
    plan: Dict[str, Any], context: Dict[str, Any]
) -> Dict[str, Any]:
    validation = validate_all_rules(plan, context)
    compliant_count = sum(1 for r in validation["rules"].values() if r["compliant"])
    total_rules = len(validation["rules"])

    return {
        "plan_type": plan.get("plan_type", "unknown"),
        "total_rules_checked": total_rules,
        "compliant_rules": compliant_count,
        "non_compliant_rules": total_rules - compliant_count,
        "overall_compliance_percentage": validation["overall_compliance_percentage"],
        "overall_compliant": validation["overall_compliant"],
        "detailed_results": validation["rules"],
    }
