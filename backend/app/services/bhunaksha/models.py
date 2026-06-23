from enum import Enum
from typing import Dict, List, Optional, TypedDict


class BhuNakshaState(str, Enum):
    BIHAR = "bihar"
    ODISHA = "odisha"
    MP = "madhyapradesh"
    UP = "uttarpradesh"
    JHARKHAND = "jharkhand"
    MAHARASHTRA = "maharashtra"
    RAJASTHAN = "rajasthan"


BHUNAKSHA_URLS: Dict[str, str] = {
    "bihar": "https://bhunaksha.bihar.gov.in",
    "odisha": "https://bhunaksha.odisha.gov.in",
    "jharkhand": "https://jharbhuni.jharkhand.gov.in",
}


class PlotData(TypedDict, total=False):
    pniu: str
    plot_number: str
    khata_number: str
    survey_number: str
    village: str
    mouza: str
    circle: str
    district: str
    state: str
    total_area: float
    area_unit: str
    land_type: str
    geometry: dict
    boundary_length: float
    vertices: List[dict]
    source: str


API_ENDPOINTS: Dict[str, str] = {
    "search_plot": "/api/public/plot/search",
    "plot_detail": "/api/public/plot/detail",
    "plot_geometry": "/api/public/plot/geometry",
    "document_list": "/api/public/plot/documents",
    "document_download": "/api/public/document/download",
    "map_tile": "/api/public/map/tile",
}
