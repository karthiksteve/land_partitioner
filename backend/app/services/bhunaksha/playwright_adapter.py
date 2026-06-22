import json
import logging
from typing import Any, Dict, List, Optional

from app.services.bhunaksha.models import BHUNAKSHA_URLS

logger = logging.getLogger(__name__)


class BhuNakshaPlaywrightAdapter:
    def __init__(self, state: str = "uttar_pradesh"):
        self.state = state
        self.base_url = BHUNAKSHA_URLS.get(state, BHUNAKSHA_URLS["uttar_pradesh"])
        self._browser = None

    async def fetch_plot_geometry(self, pniu: str) -> Dict[str, Any]:
        try:
            from playwright.async_api import async_playwright
            async with async_playwright() as pw:
                browser = await pw.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.goto(f"{self.base_url}/map", wait_until="networkidle")
                await page.fill("#search-input", pniu)
                await page.click("#search-button")
                await page.wait_for_timeout(3000)
                geometry = await self._extract_geometry_from_page(page)
                await browser.close()
                if geometry:
                    return geometry
        except ImportError:
            logger.warning("playwright not installed, using fallback extraction")
        except Exception as e:
            logger.error(f"Playwright extraction failed for {pniu}: {e}")
        return self.fallback_extraction(pniu)

    async def launch_browser(self):
        try:
            from playwright.async_api import async_playwright
            pw = await async_playwright().start()
            self._browser = await pw.chromium.launch(headless=True)
            return self._browser
        except Exception as e:
            logger.error(f"Failed to launch browser: {e}")
            return None

    async def navigate_to_plot(self, pniu: str):
        if not self._browser:
            await self.launch_browser()
        try:
            page = await self._browser.new_page()
            await page.goto(f"{self.base_url}/map", wait_until="networkidle")
            await page.fill("#search-input", pniu)
            await page.click("#search-button")
            await page.wait_for_timeout(5000)
            return page
        except Exception as e:
            logger.error(f"Navigation to plot {pniu} failed: {e}")
            return None

    async def _extract_geometry_from_page(self, page) -> Optional[Dict[str, Any]]:
        try:
            geometry_data = await page.evaluate("""
                () => {
                    const geo = window.plotGeometry || null;
                    if (geo) return JSON.parse(geo);
                    const layers = window.map ? window.map.getLayers() : null;
                    if (layers) {
                        for (let i = 0; i < layers.getLength(); i++) {
                            const layer = layers.item(i);
                            const source = layer.getSource ? layer.getSource() : null;
                            if (source) {
                                const features = source.getFeatures();
                                if (features && features.length > 0) {
                                    return JSON.parse(features[0].getGeometry().toGeoJSON());
                                }
                            }
                        }
                    }
                    return null;
                }
            """)
            return geometry_data
        except Exception as e:
            logger.error(f"Failed to extract geometry from page: {e}")
            return None

    async def capture_network_response(self) -> Dict[str, Any]:
        return {
            "status": "captured",
            "note": "Network response capture requires active page with network monitoring",
        }

    def fallback_extraction(self, pniu: str) -> Dict[str, Any]:
        from app.services.bhunaksha.adapter import BhuNakshaAdapter
        adapter = BhuNakshaAdapter(self.state)
        plot_data = adapter._simulated_fetch(pniu)
        geometry = adapter.extract_plot_geometry(plot_data)
        return {
            "pniu": pniu,
            "geometry": __import__("shapely.geometry").geometry.mapping(geometry) if geometry else None,
            "source": "fallback",
            "plot_details": adapter.extract_plot_details(plot_data),
        }
