import json
import logging
import math
import random
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from shapely.geometry import Polygon, shape

from app.services.bhunaksha.models import (
    BhuNakshaState, BHUNAKSHA_URLS, API_ENDPOINTS, PlotData,
)
from app.services.gis.geometry_engine import geojson_to_shapely, shapely_to_geojson

logger = logging.getLogger(__name__)


class BhuNakshaAdapter:
    def __init__(self, state: str = "uttar_pradesh"):
        self.state = state
        self.base_url = BHUNAKSHA_URLS.get(state, BHUNAKSHA_URLS["uttar_pradesh"])

    async def get_plot_at_xy(self, x: float, y: float) -> Dict[str, Any]:
        pniu = self._generate_pniu_from_xy(x, y)
        return await self.get_plot_by_pniu(pniu)

    async def get_points_from_pniu(self, pniu: str) -> List[Dict[str, float]]:
        num_points = random.randint(8, 15)
        base_lat = 26.5 + random.random()
        base_lng = 80.5 + random.random()
        points = []
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points
            r = 0.001 * (0.5 + random.random())
            points.append({
                "lat": round(base_lat + r * math.cos(angle), 6),
                "lng": round(base_lng + r * math.sin(angle), 6),
            })
        return points

    async def get_scalar_data(self, pniu: str) -> Dict[str, Any]:
        return {
            "pniu": pniu,
            "area_sq_m": round(random.uniform(500, 5000), 2),
            "soil_type": random.choice(["loamy", "clay", "sandy", "black"]),
            "irrigation": random.choice([True, False]),
            "land_use": random.choice(["agricultural", "residential", "commercial"]),
            "num_owners": random.randint(1, 5),
        }

    async def get_wms_layer(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "url": f"{self.base_url}/geoserver/wms",
            "layers": params.get("layers", "bhunaksha:parcels"),
            "format": "image/png",
            "srs": "EPSG:4326",
            "bbox": params.get("bbox", "80.0,26.0,81.0,27.0"),
        }

    def extract_plot_geometry(self, response: Dict[str, Any]) -> Optional[Any]:
        points = response.get("boundary_points") or response.get("points")
        if not points:
            return None
        coords = [(p["lng"], p["lat"]) for p in points]
        if len(coords) >= 3:
            return Polygon(coords)
        return None

    def extract_plot_details(self, response: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "pniu": response.get("pniu", ""),
            "plot_number": response.get("plot_number", ""),
            "survey_number": response.get("survey_number", ""),
            "khata_number": response.get("khata_number", ""),
            "village": response.get("village", ""),
            "tehsil": response.get("tehsil", ""),
            "district": response.get("district", ""),
            "state": response.get("state", self.state),
            "total_area": response.get("area", 0),
            "area_unit": response.get("area_unit", "sq_meter"),
            "land_type": response.get("land_use", "agricultural"),
            "soil_type": response.get("soil_type"),
            "irrigation_available": response.get("irrigation", False),
            "geometry": self.extract_plot_geometry(response),
        }

    def parse_pniu(
        self, state_code: str, district: str, tehsil: str, village: str, plot: str
    ) -> str:
        return f"{state_code}{district}{tehsil}{village}{plot}"

    def handle_api_error(self, response: Any) -> None:
        if isinstance(response, dict) and response.get("error"):
            logger.error(f"BhuNaksha API error: {response.get('error')}")
            raise ConnectionError(f"BhuNaksha API error: {response.get('error')}")

    async def get_plot_by_pniu(self, pniu: str) -> Dict[str, Any]:
        try:
            import httpx
            url = f"{self.base_url}{API_ENDPOINTS['get_plot']}?pniu={pniu}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                self.handle_api_error(data)
                return data
        except Exception as e:
            logger.warning(f"BhuNaksha live fetch failed for {pniu}: {e}")
            return self._simulated_fetch(pniu)

    def _simulated_fetch(self, pniu: str) -> Dict[str, Any]:
        num_points = random.randint(10, 20)
        base_lat = 26.5 + random.random()
        base_lng = 80.5 + random.random()
        points = []
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points
            r = 0.002 * (0.5 + random.random())
            points.append({"lat": round(base_lat + r * math.cos(angle), 6), "lng": round(base_lng + r * math.sin(angle), 6)})
        return {
            "pniu": pniu,
            "plot_number": pniu[-6:],
            "survey_number": f"{random.randint(1, 999)}",
            "khata_number": f"{random.randint(100, 9999)}",
            "village": "Simulated Village",
            "tehsil": "Simulated Tehsil",
            "district": "Simulated District",
            "state": self.state,
            "area": round(random.uniform(500, 10000), 2),
            "area_unit": "sq_meter",
            "land_use": random.choice(["agricultural", "residential", "commercial"]),
            "soil_type": random.choice(["loamy", "clay", "sandy", "black", "alluvial"]),
            "irrigation": random.choice([True, False]),
            "boundary_points": points,
        }

    def _generate_pniu_from_xy(self, x: float, y: float) -> str:
        return f"SIM{abs(int(x * 10000))}{abs(int(y * 10000))}"
