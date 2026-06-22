import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.services.legal.knowledge_base import UP_REVENUE_CODE_SECTIONS, LEGAL_PRECEDENTS
from app.services.gis.geometry_engine import calculate_area, shapely_to_geojson

logger = logging.getLogger(__name__)


def generate_preliminary_decree(partition_plan: Dict[str, Any]) -> Dict[str, Any]:
    plan_name = partition_plan.get("plan_name", "Partition Plan")
    parcel = partition_plan.get("parcel", {})
    owners = partition_plan.get("owners", [])
    allotments = partition_plan.get("allotments", [])

    decree_data = {
        "decree_title": "PRELIMINARY DECREE FOR PARTITION",
        "decree_type": "preliminary",
        "generated_at": datetime.utcnow().isoformat(),
        "plan_name": plan_name,
        "parcel_details": _format_ownership_shares(parcel, owners),
        "valuation": _format_valuation(parcel, allotments),
        "allotments": _format_allotments(allotments),
        "metes_and_bounds": _generate_metes_and_bounds(allotments),
        "legal_references": _include_legal_references(),
        "legal_notice": (
            "This is a preliminary decree issued under Section 116 of the Uttar Pradesh "
            "Revenue Code, 2006 read with Rule 109 of the U.P. Revenue Code Rules. "
            "All co-sharers are directed to show cause within 30 days why this partition "
            "should not be made final."
        ),
    }

    return decree_data


def generate_final_decree(partition_plan: Dict[str, Any]) -> Dict[str, Any]:
    preliminary = generate_preliminary_decree(partition_plan)
    preliminary["decree_title"] = "FINAL DECREE FOR PARTITION"
    preliminary["decree_type"] = "final"
    preliminary["legal_notice"] = (
        "This is a FINAL DECREE issued under Section 119 of the Uttar Pradesh Revenue "
        "Code, 2006. The partition as described herein is hereby confirmed and shall "
        "be binding on all co-sharers. The revenue authorities shall mutate the records "
        "accordingly."
    )
    return preliminary


def _format_ownership_shares(
    parcel: Dict[str, Any], owners: List[Dict[str, Any]]
) -> Dict[str, Any]:
    return {
        "parcel_identifier": parcel.get("pniu", parcel.get("plot_number", "N/A")),
        "village": parcel.get("village", "N/A"),
        "tehsil": parcel.get("tehsil", "N/A"),
        "district": parcel.get("district", "N/A"),
        "total_area": parcel.get("total_area", 0),
        "area_unit": "sq. meters",
        "co_sharers": [
            {
                "name": o.get("owner_name", ""),
                "share_percentage": o.get("share_percentage", 0),
            }
            for o in owners
        ],
    }


def _format_valuation(
    parcel: Dict[str, Any], allotments: List[Dict[str, Any]]
) -> Dict[str, Any]:
    total_area = parcel.get("total_area", 0)
    return {
        "total_area_sq_m": total_area,
        "total_area_hectares": total_area / 10000 if total_area else 0,
        "total_area_acres": total_area / 4046.86 if total_area else 0,
        "allotments_valuation": [
            {
                "owner_name": a.get("owner_name", ""),
                "area_sq_m": a.get("actual_area", 0),
                "share_percentage": a.get("share_percentage", 0),
            }
            for a in allotments
        ],
    }


def _include_legal_references() -> List[Dict[str, str]]:
    references = [
        {
            "section": "Section 116",
            "description": UP_REVENUE_CODE_SECTIONS.get("section_116", "Partition of tenure-holdings"),
        },
        {
            "section": "Section 117",
            "description": UP_REVENUE_CODE_SECTIONS.get("section_117", "Mode of partition"),
        },
        {
            "section": "Section 118",
            "description": UP_REVENUE_CODE_SECTIONS.get("section_118", "Partition map and demarcation"),
        },
        {
            "section": "Section 119",
            "description": UP_REVENUE_CODE_SECTIONS.get("section_119", "Confirmation and final decree"),
        },
    ]
    for p in LEGAL_PRECEDENTS[:3]:
        references.append({
            "section": "Precedent",
            "description": f"{p['case']} ({p['citation']}): {p['principle']}",
        })
    return references


def _generate_metes_and_bounds(allotments: List[Dict[str, Any]]) -> List[str]:
    descriptions = []
    for i, a in enumerate(allotments):
        geom = a.get("geometry")
        if geom:
            from shapely.geometry import shape as shapely_shape
            g = shapely_shape(geom) if isinstance(geom, dict) else geom
            coords = list(g.exterior.coords) if hasattr(g, "exterior") and g.exterior else []
            if coords:
                desc_parts = [f"Plot {i+1} - {a.get('owner_name', 'Unknown')}:"]
                for j, (x, y) in enumerate(coords):
                    direction = (
                        "North-East" if x > 0 and y > 0 else
                        "North-West" if x < 0 and y > 0 else
                        "South-East" if x > 0 and y < 0 else
                        "South-West"
                    )
                    desc_parts.append(f"  Point {j+1}: ({x:.6f}, {y:.6f}) - {direction}")
                descriptions.append("\n".join(desc_parts))
        else:
            descriptions.append(f"Plot {i+1} - {a.get('owner_name', 'Unknown')}: Geometry not available")
    return descriptions


def _format_allotments(allotments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [
        {
            "allotment_order": i + 1,
            "owner_name": a.get("owner_name", f"Owner {i+1}"),
            "area_sq_m": a.get("actual_area", 0),
            "share_percentage": a.get("share_percentage", 0),
        }
        for i, a in enumerate(allotments)
    ]


def _generate_decree_pdf(decree_data: Dict[str, Any]) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from io import BytesIO

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph(decree_data.get("decree_title", "DECREE"), styles["Title"]))
        story.append(Spacer(1, 6*mm))
        story.append(Paragraph(f"Generated: {decree_data.get('generated_at', '')}", styles["Normal"]))
        story.append(Spacer(1, 6*mm))

        ownership = decree_data.get("parcel_details", {})
        story.append(Paragraph("<b>Parcel & Ownership</b>", styles["Heading2"]))
        data = [
            ["Parcel", ownership.get("parcel_identifier", "N/A")],
            ["Village", ownership.get("village", "N/A")],
            ["Tehsil", ownership.get("tehsil", "N/A")],
            ["District", ownership.get("district", "N/A")],
            ["Total Area", f"{ownership.get('total_area', 0):.2f} sq.m"],
        ]
        t = Table(data, colWidths=[120, 300])
        t.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
        ]))
        story.append(t)
        story.append(Spacer(1, 4*mm))

        allotments = decree_data.get("allotments", [])
        if allotments:
            story.append(Paragraph("<b>Allotments</b>", styles["Heading2"]))
            data = [["#", "Owner", "Area (sq.m)", "Share %"]]
            for a in allotments:
                data.append([
                    str(a.get("allotment_order", "")),
                    a.get("owner_name", ""),
                    f"{a.get('area_sq_m', 0):.2f}",
                    f"{a.get('share_percentage', 0):.1f}%",
                ])
            t = Table(data, colWidths=[40, 150, 100, 80])
            t.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ]))
            story.append(t)

        story.append(Spacer(1, 6*mm))
        story.append(Paragraph(decree_data.get("legal_notice", ""), styles["Normal"]))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
    except ImportError:
        logger.warning("reportlab not available, returning JSON fallback")
        return json.dumps(decree_data, indent=2, default=str).encode("utf-8")
    except Exception as e:
        logger.error(f"Decree PDF generation failed: {e}")
        return json.dumps(decree_data, indent=2, default=str).encode("utf-8")
