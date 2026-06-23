import math
import random
from typing import Any, Dict, List, Optional

import httpx
from shapely.geometry import Point, Polygon

from app.core.config import settings
from app.services.bhunaksha.models import API_ENDPOINTS, BHUNAKSHA_URLS, PlotData

# Bihar bounding box
BIHAR_LAT_MIN, BIHAR_LAT_MAX = 24.5, 27.5
BIHAR_LNG_MIN, BIHAR_LNG_MAX = 83.5, 88.0


def _generate_mock_geometry(center_lat: Optional[float] = None,
                             center_lng: Optional[float] = None,
                             size_meters: float = 50.0) -> Dict[str, Any]:
    if center_lat is None:
        center_lat = random.uniform(BIHAR_LAT_MIN, BIHAR_LAT_MAX)
    if center_lng is None:
        center_lng = random.uniform(BIHAR_LNG_MIN, BIHAR_LNG_MAX)

    lat_offset = size_meters / 111320.0
    lng_offset = size_meters / (111320.0 * math.cos(math.radians(center_lat)))

    half_lat = lat_offset / 2
    half_lng = lng_offset / 2

    perturbation = size_meters * 0.1 / 111320.0

    coords = [
        [center_lng - half_lng + random.uniform(-perturbation, perturbation),
         center_lat - half_lat + random.uniform(-perturbation, perturbation)],
        [center_lng + half_lng + random.uniform(-perturbation, perturbation),
         center_lat - half_lat + random.uniform(-perturbation, perturbation)],
        [center_lng + half_lng + random.uniform(-perturbation, perturbation),
         center_lat + half_lat + random.uniform(-perturbation, perturbation)],
        [center_lng - half_lng + random.uniform(-perturbation, perturbation),
         center_lat + half_lat + random.uniform(-perturbation, perturbation)],
        [center_lng - half_lng + random.uniform(-perturbation, perturbation),
         center_lat - half_lat + random.uniform(-perturbation, perturbation)],
    ]

    return {
        "type": "Polygon",
        "coordinates": [coords],
    }


def _parse_pniu(district_code: str, circle_code: str,
                mouza_code: str, plot_number: str) -> str:
    return f"{district_code.zfill(4)}{circle_code.zfill(4)}{mouza_code.zfill(6)}{plot_number.zfill(5)}"


def _compute_boundary_length(geometry: Dict[str, Any]) -> float:
    try:
        coords = geometry["coordinates"][0]
        polygon = Polygon(coords)
        return polygon.length * 111320.0
    except (KeyError, IndexError, TypeError):
        return 0.0


def _compute_vertices(geometry: Dict[str, Any]) -> List[Dict[str, float]]:
    try:
        coords = geometry["coordinates"][0]
        return [{"lng": round(c[0], 6), "lat": round(c[1], 6)} for c in coords]
    except (KeyError, IndexError, TypeError):
        return []


class BhuNakshaAdapter:
    """
    Adapter for Bihar BhuNaksha portal.

    Currently simulates responses with realistic cadastral data.
    When BhuNaksha APIs become available, replace the _fetch_from_api
    method with real HTTP calls using httpx.
    """

    def __init__(self, state: str = "bihar"):
        self.state = state
        self.base_url = BHUNAKSHA_URLS.get(state, settings.BHUNAKSHA_BASE_URL)

    async def search_parcel(self, district: str, circle: str,
                            mouza: str, plot_number: str) -> PlotData:
        """
        Search for a parcel on BhuNaksha.

        Currently returns simulated data. To use live data,
        uncomment the httpx call in _fetch_from_api.
        """
        pniu = _parse_pniu(district, circle, mouza, plot_number)
        geometry = _generate_mock_geometry()
        boundary_length = _compute_boundary_length(geometry)
        vertices = _compute_vertices(geometry)

        area = random.uniform(100.0, 5000.0)

        return {
            "pniu": pniu,
            "plot_number": plot_number,
            "khata_number": str(random.randint(1, 9999)),
            "survey_number": str(random.randint(1, 500)),
            "village": mouza,
            "mouza": mouza,
            "circle": circle,
            "district": district,
            "state": "Bihar",
            "total_area": round(area, 2),
            "area_unit": "sqm",
            "land_type": random.choice(["Agriculture", "Residential", "Commercial", "Industrial"]),
            "geometry": geometry,
            "boundary_length": round(boundary_length, 2),
            "vertices": vertices,
            "source": "bhunaksha",
        }

    async def _fetch_from_api(self, endpoint: str, params: dict) -> dict:
        """
        Real API call placeholder.
        Replace this method's body with actual httpx request when
        BhuNaksha public APIs are available.
        """
        url = f"{self.base_url}{API_ENDPOINTS[endpoint]}"
        async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    def extract_plot_details(self, response: dict) -> PlotData:
        return {
            "pniu": response.get("pniu", ""),
            "plot_number": response.get("plotNumber", response.get("plot_number", "")),
            "khata_number": response.get("khataNumber", response.get("khata_number", "")),
            "survey_number": response.get("surveyNumber", response.get("survey_number", "")),
            "village": response.get("village", ""),
            "mouza": response.get("mouza", ""),
            "circle": response.get("circle", ""),
            "district": response.get("district", ""),
            "state": response.get("state", "Bihar"),
            "total_area": response.get("totalArea", response.get("total_area", 0.0)),
            "area_unit": response.get("areaUnit", response.get("area_unit", "sqm")),
            "land_type": response.get("landType", response.get("land_type", "")),
            "geometry": response.get("geometry", _generate_mock_geometry()),
            "boundary_length": response.get("boundaryLength", response.get("boundary_length", 0.0)),
            "source": "bhunaksha",
        }

    def get_document_urls(self, pniu: str) -> List[Dict[str, str]]:
        return [
            {
                "document_type": "parcel_pdf",
                "file_name": f"{pniu}_parcel.pdf",
                "source_url": f"{self.base_url}/api/public/document/parcel/{pniu}",
            },
            {
                "document_type": "ror",
                "file_name": f"{pniu}_ror.pdf",
                "source_url": f"{self.base_url}/api/public/document/ror/{pniu}",
            },
            {
                "document_type": "land_record",
                "file_name": f"{pniu}_land_record.pdf",
                "source_url": f"{self.base_url}/api/public/document/land-record/{pniu}",
            },
            {
                "document_type": "geojson",
                "file_name": f"{pniu}_geometry.geojson",
                "source_url": f"{self.base_url}/api/public/document/geojson/{pniu}",
            },
        ]
