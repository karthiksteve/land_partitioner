import enum
from typing import Any, Dict, List, Optional, TypedDict
from uuid import UUID


class BhuNakshaState(str, enum.Enum):
    BIHAR = "bihar"
    UP = "uttar_pradesh"
    MP = "madhya_pradesh"
    RAJASTHAN = "rajasthan"
    ODISHA = "odisha"
    JHARKHAND = "jharkhand"


BHUNAKSHA_URLS: Dict[str, str] = {
    "bihar": "https://bhumap.bihar.gov.in",
    "uttar_pradesh": "https://upbhunaksha.gov.in",
    "madhya_pradesh": "https://mpbhunaksha.gov.in",
    "rajasthan": "https://rajbhunaksha.rajasthan.gov.in",
    "odisha": "https://bhunaksha.odisha.gov.in",
    "jharkhand": "https://jharbhunaksha.jharkhand.gov.in",
}


API_ENDPOINTS: Dict[str, str] = {
    "get_plot": "/api/plot/detail",
    "get_points": "/api/plot/points",
    "get_scalar": "/api/plot/scalar",
    "wms_service": "/geoserver/wms",
    "search_plot": "/api/search/plot",
    "village_list": "/api/misc/villageList",
}


class PlotData(TypedDict, total=False):
    pniu: str
    plot_number: str
    survey_number: str
    khata_number: str
    village: str
    village_code: str
    tehsil: str
    tehsil_code: str
    district: str
    district_code: str
    state: str
    state_code: str
    area: float
    area_unit: str
    land_use: str
    soil_type: str
    irrigation: bool
    boundary_points: List[Dict[str, float]]
    geometry: Dict[str, Any]
    owners: List[Dict[str, Any]]


class VillageData(TypedDict, total=False):
    village_code: str
    village_name: str
    tehsil_code: str
    tehsil_name: str
    district_code: str
    district_name: str
    state_code: str
    state_name: str
    total_plots: int
