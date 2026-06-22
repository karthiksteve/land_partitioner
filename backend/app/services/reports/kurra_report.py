import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.services.gis.geometry_engine import calculate_area, shapely_to_geojson
from app.services.legal.rule109_engine import generate_compliance_report
from app.services.legal.scoring_engine import ScoreManager

logger = logging.getLogger(__name__)


def generate_kurra_report(partition_plan: Dict[str, Any]) -> Dict[str, Any]:
    parcel = partition_plan.get("parcel", {})
    owners = partition_plan.get("owners", [])
    allotments = partition_plan.get("allotments", [])
    scores = partition_plan.get("scores", {})

    report = {
        "report_title": "Kurra Report - Land Partition Decision Support",
        "generated_at": datetime.utcnow().isoformat(),
        "plan_name": partition_plan.get("plan_name", ""),
        "plan_type": partition_plan.get("plan_type", ""),
        "parcel_details": _format_parcel_details(parcel),
        "owner_details": _format_owner_details(owners),
        "share_details": _format_share_details(owners, parcel.get("total_area", 0)),
        "allotments": [
            {
                "owner_name": a.get("owner_name", ""),
                "expected_area": a.get("expected_area", 0),
                "actual_area": a.get("actual_area", 0),
                "compactness_score": a.get("compactness_score", 0),
                "share_percentage": a.get("share_percentage", 0),
            }
            for a in allotments
        ],
        "scores": scores,
        "map_data": _include_map_data(partition_plan),
        "frontage_analysis": _include_frontage_analysis(partition_plan),
        "commercial_analysis": _include_commercial_analysis(partition_plan),
        "rule_compliance": _include_rule_compliance(partition_plan),
    }

    return report


def _format_parcel_details(parcel: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "pniu": parcel.get("pniu", "N/A"),
        "plot_number": parcel.get("plot_number", "N/A"),
        "survey_number": parcel.get("survey_number", "N/A"),
        "khata_number": parcel.get("khata_number", "N/A"),
        "village": parcel.get("village", "N/A"),
        "tehsil": parcel.get("tehsil", "N/A"),
        "district": parcel.get("district", "N/A"),
        "state": parcel.get("state", "N/A"),
        "total_area_sq_m": parcel.get("total_area", 0),
        "total_area_hectares": parcel.get("total_area", 0) / 10000 if parcel.get("total_area", 0) else 0,
        "total_area_acres": parcel.get("total_area", 0) / 4046.86 if parcel.get("total_area", 0) else 0,
        "land_type": parcel.get("land_type", "N/A"),
        "soil_type": parcel.get("soil_type", "N/A"),
        "irrigation": parcel.get("irrigation_available", False),
    }


def _format_owner_details(owners: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [
        {
            "owner_name": o.get("owner_name", ""),
            "share_percentage": o.get("share_percentage", 0),
            "existing_possession": o.get("existing_possession", False),
        }
        for o in owners
    ]


def _format_share_details(
    owners: List[Dict[str, Any]], total_area: float
) -> List[Dict[str, Any]]:
    return [
        {
            "owner_name": o.get("owner_name", ""),
            "share_percentage": o.get("share_percentage", 0),
            "entitled_area": total_area * o.get("share_percentage", 0) / 100,
        }
        for o in owners
    ]


def _include_map_data(partition_plan: Dict[str, Any]) -> Dict[str, Any]:
    allotments = partition_plan.get("allotments", [])
    features = []
    for i, a in enumerate(allotments):
        geom = a.get("geometry")
        if geom:
            features.append({
                "type": "Feature",
                "properties": {
                    "owner_name": a.get("owner_name", f"Owner {i+1}"),
                    "owner_id": str(a.get("owner_id", "")),
                    "area": a.get("actual_area", 0),
                    "allotment_order": i + 1,
                },
                "geometry": geom if isinstance(geom, dict) else shapely_to_geojson(geom),
            })
    return {
        "type": "FeatureCollection",
        "features": features,
    }


def _include_frontage_analysis(plan: Dict[str, Any]) -> Dict[str, Any]:
    allotments = plan.get("allotments", [])
    frontages = [a.get("road_frontage_length", 0) for a in allotments]
    return {
        "total_road_frontage": sum(frontages),
        "average_frontage": sum(frontages) / len(frontages) if frontages else 0,
        "frontage_by_owner": [
            {
                "owner_name": a.get("owner_name", ""),
                "frontage_meters": a.get("road_frontage_length", 0),
            }
            for a in allotments
        ],
    }


def _include_commercial_analysis(plan: Dict[str, Any]) -> Dict[str, Any]:
    allotments = plan.get("allotments", [])
    scores = [a.get("commercial_value_score", 0) for a in allotments]
    return {
        "commercial_value_scores": scores,
        "average_commercial_score": sum(scores) / len(scores) if scores else 0,
        "commercial_fairness_assessment": "Equitable" if max(scores) - min(scores) <= 20 else "Inequitable" if scores else "N/A",
    }


def _include_rule_compliance(plan: Dict[str, Any]) -> Dict[str, Any]:
    context = {
        "owners": plan.get("owners", []),
        "original_parcel": plan.get("parcel", {}),
        "possessions": plan.get("possessions", []),
        "roads": plan.get("roads", []),
        "settlements": plan.get("settlements", []),
    }
    compliance = generate_compliance_report(plan, context)
    return compliance


def _generate_kurra_pdf(report_data: Dict[str, Any]) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
            PageBreak, Image,
        )
        from reportlab.lib import colors
        from io import BytesIO

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph("GeoKurra - Land Partition Decision Support", styles["Title"]))
        story.append(Spacer(1, 6*mm))
        story.append(Paragraph(f"<b>Kurra Report</b>", styles["Heading1"]))
        story.append(Spacer(1, 4*mm))

        parcel = report_data.get("parcel_details", {})
        story.append(Paragraph("<b>Parcel Details</b>", styles["Heading2"]))
        parcel_data = [
            ["PNIU", parcel.get("pniu", "N/A")],
            ["Village", parcel.get("village", "N/A")],
            ["Tehsil", parcel.get("tehsil", "N/A")],
            ["District", parcel.get("district", "N/A")],
            ["Total Area (sq.m)", f"{parcel.get('total_area_sq_m', 0):.2f}"],
            ["Land Type", parcel.get("land_type", "N/A")],
        ]
        t = Table(parcel_data, colWidths=[120, 300])
        t.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(t)
        story.append(Spacer(1, 4*mm))

        owners = report_data.get("owner_details", [])
        if owners:
            story.append(Paragraph("<b>Owners & Shares</b>", styles["Heading2"]))
            owner_data = [["Name", "Share %", "Possession"]]
            for o in owners:
                owner_data.append([
                    o.get("owner_name", ""),
                    f"{o.get('share_percentage', 0):.1f}%",
                    "Yes" if o.get("existing_possession") else "No",
                ])
            t = Table(owner_data, colWidths=[200, 100, 100])
            t.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]))
            story.append(t)
            story.append(Spacer(1, 4*mm))

        scores = report_data.get("scores", {})
        if scores:
            story.append(Paragraph("<b>Scoring Summary</b>", styles["Heading2"]))
            score_data = [
                ["Metric", "Score"],
                ["Overall Score", f"{scores.get('overall_score', 0):.1f}%"],
                ["Share Compliance", f"{scores.get('share_compliance', 0):.1f}%"],
                ["Compactness", f"{scores.get('compactness', 0):.1f}%"],
                ["Road Frontage", f"{scores.get('road_frontage', 0):.1f}%"],
                ["Commercial Fairness", f"{scores.get('commercial_fairness', 0):.1f}%"],
            ]
            t = Table(score_data, colWidths=[200, 200])
            t.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("BACKGROUND", (0, 1), (0, -1), colors.whitesmoke),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]))
            story.append(t)

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    except ImportError:
        logger.warning("reportlab not available, returning JSON fallback")
        return json.dumps(report_data, indent=2, default=str).encode("utf-8")
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        return json.dumps(report_data, indent=2, default=str).encode("utf-8")
