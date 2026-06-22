import csv
import json
import logging
from io import StringIO
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.services.reports.kurra_report import generate_kurra_report, _generate_kurra_pdf
from app.services.reports.decree_report import generate_preliminary_decree, generate_final_decree, _generate_decree_pdf

logger = logging.getLogger(__name__)


async def generate_report(plan_id: str, format: str = "pdf") -> bytes:
    report_data = {"plan_id": plan_id, "format": format, "note": "Full report requires DB fetch at runtime"}
    if format == "pdf":
        return _generate_kurra_pdf(report_data)
    return json.dumps(report_data, indent=2, default=str).encode("utf-8")


def generate_comparison_report(plans: List[Dict[str, Any]]) -> Dict[str, Any]:
    comparison = {
        "comparison_title": "Partition Plan Comparison",
        "generated_at": __import__("datetime").datetime.utcnow().isoformat(),
        "num_plans": len(plans),
        "plans": [],
    }

    for plan in plans:
        scores = plan.get("scores", {})
        comparison["plans"].append({
            "plan_id": str(plan.get("id", "")),
            "plan_name": plan.get("plan_name", ""),
            "plan_type": plan.get("plan_type", ""),
            "overall_score": scores.get("overall_score", 0),
            "compactness": scores.get("compactness", 0),
            "share_compliance": scores.get("share_compliance", 0),
            "road_frontage": scores.get("road_frontage", 0),
            "status": plan.get("status", ""),
        })

    if comparison["plans"]:
        comparison["recommended"] = max(
            comparison["plans"],
            key=lambda p: p["overall_score"],
        )

    return comparison


async def generate_summary_report(parcel_id: str) -> Dict[str, Any]:
    return {
        "parcel_id": parcel_id,
        "report_type": "summary",
        "generated_at": __import__("datetime").datetime.utcnow().isoformat(),
        "note": "Full summary requires DB fetch at runtime",
    }


async def export_to_pdf(data: Dict[str, Any]) -> bytes:
    return _generate_kurra_pdf(data)


async def export_to_decree_pdf(data: Dict[str, Any]) -> bytes:
    return _generate_decree_pdf(data)


async def export_to_geojson(geometry: Any) -> Dict[str, Any]:
    from app.services.gis.geometry_engine import shapely_to_geojson
    if hasattr(geometry, "__geo_interface__"):
        return dict(geometry.__geo_interface__)
    if isinstance(geometry, dict):
        return geometry
    return shapely_to_geojson(geometry)


async def export_to_kml(geometry: Any) -> str:
    geojson = await export_to_geojson(geometry)
    coords = _extract_coordinates(geojson)
    kml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<kml xmlns="http://www.opengis.net/kml/2.2">',
        "  <Document>",
        "    <Placemark>",
        "      <name>Parcel Geometry</name>",
        "      <Polygon>",
        "        <outerBoundaryIs>",
        "          <LinearRing>",
        "            <coordinates>",
    ]
    coord_str = " ".join(f"{lng},{lat},0" for lat, lng in coords) if coords else ""
    kml_parts.append(f"              {coord_str}")
    kml_parts.extend([
        "            </coordinates>",
        "          </LinearRing>",
        "        </outerBoundaryIs>",
        "      </Polygon>",
        "    </Placemark>",
        "  </Document>",
        "</kml>",
    ])
    return "\n".join(kml_parts)


async def export_to_csv(data: List[Dict[str, Any]]) -> str:
    if not data:
        return ""
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()


async def export_to_shapefile(geometry: Any, path: str) -> str:
    logger.warning("Shapefile export requires full GeoPandas/GDAL setup")
    try:
        import geopandas as gpd
        from shapely.geometry import shape as shapely_shape
        gdf = gpd.GeoDataFrame(
            {"id": [1], "geometry": [shapely_shape(geometry) if isinstance(geometry, dict) else geometry]},
            crs="EPSG:4326",
        )
        gdf.to_file(path, driver="ESRI Shapefile")
        return path
    except Exception as e:
        logger.error(f"Shapefile export failed: {e}")
        return ""


async def export_to_json(data: Any) -> str:
    return json.dumps(data, indent=2, default=str)


def _extract_coordinates(geojson: Dict[str, Any]) -> List[tuple]:
    if geojson.get("type") == "Polygon":
        coords = geojson.get("coordinates", [[]])[0]
        return [(c[1], c[0]) for c in coords]
    elif geojson.get("type") == "MultiPolygon":
        coords = geojson.get("coordinates", [[[[]]]])[0][0]
        return [(c[1], c[0]) for c in coords]
    return []
