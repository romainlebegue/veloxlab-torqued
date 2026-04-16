"""
RockAuto scraper — rockauto.com

RockAuto loads parts via a JavaScript catalog. Strategy:
  1. Intercept the XHR/fetch calls that load part data (JSON)
  2. Parse the JSON response directly — much faster than DOM parsing
  3. Fallback: parse the rendered HTML table rows

RockAuto does NOT use Cloudflare but does fingerprint browsers.
Playwright stealth handles it.

Dry-run: python main.py --source rockauto --limit 20 --dry-run
"""

import json
import re
from typing import AsyncIterator

import structlog
from playwright.async_api import Browser, Page, Route, Request

from .base import BaseScraper

logger = structlog.get_logger()

ROCKAUTO_BASE = "https://www.rockauto.com"

# Top vehicle/category combos to seed (by EU market relevance)
SEED_URLS = [
    "/en/catalog/volkswagen,golf,2016,1.6l+l4+diesel,3448640,brake+&+wheel+hub,rotor+%2F+disc,8797",
    "/en/catalog/volkswagen,golf,2016,1.6l+l4+diesel,3448640,brake+&+wheel+hub,pad+set,9016",
    "/en/catalog/bmw,3+series,2012,2.0l+l4+diesel,3475701,brake+&+wheel+hub,rotor+%2F+disc,8797",
    "/en/catalog/peugeot,308,2014,1.6l+l4+diesel,3451234,brake+&+wheel+hub,rotor+%2F+disc,8797",
    "/en/catalog/renault,clio,2012,1.5l+l4+diesel,3448001,brake+&+wheel+hub,rotor+%2F+disc,8797",
]

# RockAuto part condition codes
RA_CONDITION_MAP = {
    "New":            "NEW",
    "Remanufactured": "REMAN",
    "Used":           "USED",
}


class RockAutoScraper(BaseScraper):
    source = "rockauto"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._intercepted: list[dict] = []

    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        for seed_path in SEED_URLS:
            url = f"{ROCKAUTO_BASE}{seed_path}"
            async for listing in self._scrape_catalog_page(browser, url):
                yield listing

    async def _scrape_catalog_page(self, browser: Browser, url: str) -> AsyncIterator[dict]:
        self._intercepted = []
        context = await self._new_context(browser)
        page = await context.new_page()

        # Intercept RockAuto's catalog JSON XHR calls
        await page.route("**/rockauto.com/**catalog**", self._intercept_catalog)
        await page.route("**/rockauto.com/api/**",      self._intercept_catalog)

        try:
            await self._fetch_with_retry(page, url)
            # Wait for JS to load parts
            await page.wait_for_selector(".listing-text-row, .ra-part-row", timeout=12_000)

            # Try DOM parsing if interception didn't capture JSON
            if not self._intercepted:
                rows = await self._parse_dom(page, url)
                for row in rows:
                    yield self._normalize_listing(row)
            else:
                for raw in self._intercepted:
                    yield self._normalize_listing(raw)

            self._circuit_breaker.record(True)

        except Exception as exc:
            logger.warning("rockauto_page_failed", url=url, error=str(exc))
            self._circuit_breaker.record(False)

        finally:
            await context.close()

    async def _intercept_catalog(self, route: Route, request: Request) -> None:
        """Intercept JSON catalog responses and parse them."""
        try:
            response = await route.fetch()
            body = await response.text()
            await route.fulfill(response=response)

            if "application/json" in response.headers.get("content-type", ""):
                data = json.loads(body)
                listings = self._parse_catalog_json(data, request.url)
                self._intercepted.extend(listings)
        except Exception as exc:
            logger.warning("rockauto_intercept_failed", error=str(exc))
            await route.continue_()

    def _parse_catalog_json(self, data: dict | list, source_url: str) -> list[dict]:
        """Parse RockAuto catalog JSON — structure varies, try common shapes."""
        results = []
        items = []

        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            items = data.get("parts", data.get("items", data.get("listings", [])))

        for item in items:
            try:
                price = float(str(item.get("price", item.get("listprice", 0))).replace("$", "").replace(",", ""))
                if price <= 0:
                    continue

                ext_id = str(item.get("id", item.get("partnum", item.get("sku", ""))))
                title  = item.get("name", item.get("description", item.get("partname", "")))
                brand  = item.get("brand", item.get("manufacturer", ""))
                part_number = item.get("partnum", item.get("sku", item.get("oem", "")))
                condition   = RA_CONDITION_MAP.get(item.get("condition", "New"), "NEW")

                results.append({
                    "external_id": ext_id,
                    "url":         f"{ROCKAUTO_BASE}/en/catalog/{ext_id}",
                    "title":       title,
                    "part_number": part_number,
                    "brand":       brand,
                    "condition":   condition,
                    "part_type":   "REMAN" if condition == "REMAN" else "NEW_IAM",
                    "price":       price,
                    "currency":    "USD",
                    "shipping_cost_eur": 12.0,  # RockAuto EU shipping estimate
                    "shipping_to": ["FR", "DE", "ES", "UK"],
                    "seller_name": "RockAuto",
                    "seller_country": "US",
                    "location_country": "US",
                    "warranty_months": 12,
                })
            except (ValueError, TypeError, KeyError):
                continue

        return results

    async def _parse_dom(self, page: Page, source_url: str) -> list[dict]:
        """Fallback: parse rendered HTML rows from the parts table."""
        rows = await page.query_selector_all(".listing-text-row")
        results = []

        for row in rows:
            try:
                # Price
                price_el = await row.query_selector(".listing-price")
                if not price_el:
                    continue
                price_text = await price_el.inner_text()
                m = re.search(r"([\d,.]+)", price_text.replace(",", ""))
                if not m:
                    continue
                price = float(m.group(1))

                # Brand + part number
                brand_el   = await row.query_selector(".listing-text-col-brandname")
                partnum_el = await row.query_selector(".listing-part-number")
                info_el    = await row.query_selector(".listing-text-col-moreinfo")

                brand       = (await brand_el.inner_text()).strip() if brand_el else None
                part_number = (await partnum_el.inner_text()).strip() if partnum_el else None
                title       = (await info_el.inner_text()).strip() if info_el else (brand or "Part")

                # Link
                link_el = await row.query_selector("a")
                href    = await link_el.get_attribute("href") if link_el else ""
                url     = f"{ROCKAUTO_BASE}{href}" if href and href.startswith("/") else href
                ext_id  = re.search(r"\[([^\]]+)\]$", href or "")
                ext_id  = ext_id.group(1) if ext_id else part_number or title[:20]

                # Condition
                cond_el   = await row.query_selector(".listing-condition")
                cond_raw  = (await cond_el.inner_text()).strip() if cond_el else "New"
                condition = RA_CONDITION_MAP.get(cond_raw, "NEW")

                results.append(self._normalize_listing({
                    "external_id": ext_id,
                    "url":         url,
                    "title":       title,
                    "part_number": part_number,
                    "brand":       brand,
                    "condition":   condition,
                    "part_type":   "REMAN" if condition == "REMAN" else "NEW_IAM",
                    "price":       price,
                    "currency":    "USD",
                    "shipping_cost_eur": 12.0,
                    "shipping_to": ["FR", "DE", "ES", "UK"],
                    "seller_name": "RockAuto",
                    "seller_country": "US",
                    "warranty_months": 12,
                }))
            except Exception as exc:
                logger.warning("rockauto_dom_row_failed", error=str(exc))

        return results
