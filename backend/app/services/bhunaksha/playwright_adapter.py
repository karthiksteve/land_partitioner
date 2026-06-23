import asyncio
import logging
from typing import Any, Dict, Optional

from app.services.bhunaksha.adapter import BhuNakshaAdapter
from app.services.bhunaksha.models import PlotData

logger = logging.getLogger(__name__)


class BhuNakshaPlaywrightAdapter:
    """
    Playwright-based adapter for scraping BhuNaksha portal.

    Falls back to BhuNakshaAdapter (simulated data) if Playwright
    is not available or if scraping fails.
    """

    def __init__(self, state: str = "bihar"):
        self.state = state
        self.adapter = BhuNakshaAdapter(state)
        self.browser = None

    async def fetch_plot(self, district: str, circle: str,
                         mouza: str, plot_number: str) -> PlotData:
        try:
            return await self._scrape_plot(district, circle, mouza, plot_number)
        except Exception as exc:
            logger.warning("Playwright scrape failed, falling back to adapter: %s", exc)
            return await self.adapter.search_parcel(district, circle, mouza, plot_number)

    async def _scrape_plot(self, district: str, circle: str,
                           mouza: str, plot_number: str) -> PlotData:
        page = await self._launch_browser()
        try:
            await self._navigate_and_search(page, district, circle, mouza, plot_number)
            geometry = await self._extract_geometry_from_page(page)
            details = await self._extract_details_from_page(page)
            details["geometry"] = geometry
            return details
        finally:
            await page.close()
            if self.browser:
                await self.browser.close()

    async def _launch_browser(self):
        from playwright.async_api import async_playwright
        p = await async_playwright().start()
        self.browser = await p.chromium.launch(headless=True)
        page = await self.browser.new_page()
        page.set_default_timeout(30000)
        return page

    async def _navigate_and_search(self, page, district: str, circle: str,
                                   mouza: str, plot_number: str):
        from app.core.config import settings
        await page.goto(f"{settings.BHUNAKSHA_BASE_URL}/", wait_until="networkidle")
        await page.fill("input[name='district']", district)
        await page.fill("input[name='circle']", circle)
        await page.fill("input[name='mouza']", mouza)
        await page.fill("input[name='plot']", plot_number)
        await page.click("button[type='submit']")
        await page.wait_for_selector(".plot-details", timeout=15000)

    async def _extract_geometry_from_page(self, page) -> Dict[str, Any]:
        try:
            geo_str = await page.evaluate("""
                () => {
                    const el = document.getElementById('plot-geometry');
                    return el ? el.textContent : null;
                }
            """)
            if geo_str:
                import json
                return json.loads(geo_str)
        except Exception as exc:
            logger.warning("Failed to extract geometry from page: %s", exc)
        from app.services.bhunaksha.adapter import _generate_mock_geometry
        return _generate_mock_geometry()

    async def _extract_details_from_page(self, page) -> dict:
        details = {}
        fields = {
            "pniu": "#pniu",
            "plot_number": "#plot-number",
            "khata_number": "#khata-number",
            "survey_number": "#survey-number",
            "village": "#village",
            "mouza": "#mouza",
            "circle": "#circle",
            "district": "#district",
            "total_area": "#total-area",
            "land_type": "#land-type",
        }
        for key, selector in fields.items():
            try:
                value = await page.text_content(selector)
                if value:
                    details[key] = value.strip()
            except Exception:
                pass
        return details

    async def fallback_search(self, district: str, circle: str,
                              mouza: str, plot_number: str) -> PlotData:
        return await self.adapter.search_parcel(district, circle, mouza, plot_number)
