# BhuNaksha Integration Module

**Cadastral Data Integration with Indian State Land Records Portals**

## Overview

The BhuNaksha Integration Module reverse-engineers the Bihar BhuNaksha portal APIs to retrieve cadastral parcel data (geometry, PNIU, plot details). It provides a primary API-based adapter and a fallback browser automation adapter. The architecture is extensible for UP, MP, Rajasthan, and other state portals.

## Files

### `models.py` - Data Models & Constants

**Enums & Types:**
- `BhuNakshaState`: BIAR, UP, MP, RAJASTHAN
- `PlotData`: TypedDict with geometry, area, pniu, plot_number, khata_number, village, district, tehsil
- `VillageData`: TypedDict with administrative hierarchy
- `BHUNAKSHA_URLS`: Base URLs per state
- `API_ENDPOINTS`: Common endpoint patterns (getPlotAtXY, getPointsFromPNIU, ScalarDataHandler, WMS)

### `adapter.py` - Primary API Adapter

**Class: BhuNakshaAdapter**
- `get_plot_at_xy(x, y)` → Fetch plot by coordinate
- `get_points_from_pniu(pniu)` → Get vertices from PNIU
- `get_scalar_data(pniu)` → Get plot attributes
- `get_wms_layer(params)` → Get WMS tile layer
- `extract_plot_geometry(response)` → Parse geometry from response
- `extract_plot_details(response)` → Parse attributes
- `parse_pniu(state_code, district, tehsil, village, plot)` → Build PNIU code
- `handle_api_error(response)` → Error handling with retries

**Architecture:**
- Adapter pattern: Each state can have its own adapter subclass
- Built-in retry logic with exponential backoff
- Response caching to avoid duplicate requests
- Geometry extraction supports multiple response formats

### `playwright_adapter.py` - Browser Automation Fallback

**Class: BhuNakshaPlaywrightAdapter**
- `fetch_plot_geometry(pniu)` → Full retrieval flow
- `launch_browser()` → Headless Chromium
- `navigate_to_plot(pniu)` → Automated portal navigation
- `extract_geometry_from_page()` → Network response interception
- `capture_network_response()` → Extract API calls from page
- `fallback_extraction(pniu)` → Multiple strategies tried

**Fallback Strategy:**
1. Direct API call (adapter.py)
2. If API fails: Playwright browser automation
3. Intercept network responses during page load
4. Extract GeoJSON from XHR/fetch calls
5. If all fail: return structured error for manual entry

## Key Changes

- Reverse-engineered Bihar BhuNaksha API patterns from portal
- Implemented PNIU parsing and validation
- Playwright fallback extracts geometry through network interception (not screenshots)
- Extensible architecture: add new state by subclassing BhuNakshaAdapter
- Timeout and retry configuration for unreliable rural networks

## Usage

```python
from app.services.bhunaksha.adapter import BhuNakshaAdapter
from app.services.bhunaksha.models import BhuNakshaState

# Direct API integration
adapter = BhuNakshaAdapter(state=BhuNakshaState.BIHAR)
plot = await adapter.get_plot_at_xy(84.123, 25.456)

# Or use Playwright fallback
from app.services.bhunaksha.playwright_adapter import BhuNakshaPlaywrightAdapter
pw_adapter = BhuNakshaPlaywrightAdapter()
geometry = await pw_adapter.fetch_plot_geometry("1023456789")
```
