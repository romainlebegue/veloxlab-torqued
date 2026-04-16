"""
Ovoko scraper — ovoko.com (pan-EU used parts marketplace, ex-RRR.lt)

Ovoko is a marketplace of used/recycled parts from dismantlers across Europe.
No Cloudflare. Search results load via XHR JSON — we intercept the API calls.

Strategy:
  1. Seed searches by popular part category
  2. Intercept XHR JSON response from search API
  3. Fallback: parse HTML product cards if XHR interception fails

Dry-run: python main.py --source ovoko --limit 50 --dry-run
"""

import json
import re
from typing import AsyncIterator

import structlog
from playwright.async_api import Browser, Route, Request

from .base import BaseScraper

logger = structlog.get_logger()

OVOKO_BASE = "https://www.ovoko.com"

SEED_QUERIES = [
    "brake disc",
    "brake pad",
    "shock absorber front",
    "oil filter",
    "alternator",
    "starter motor",
    "radiator",
    "headlight",
    "door mirror",
    "bumper front",
]

# Country → currency mapping for Ovoko sellers
_COUNTRY_CURRENCY: dict[str, str] = {
    "DE": "EUR", "FR": "EUR", "ES": "EUR", "IT": "EUR",
    "PL": "PLN", "LT": "EUR", "LV": "EUR", "EE": "EUR",
    "GB": "GBP", "NL": "EUR", "BE": "EUR", "AT": "EUR",
}


class OvokoScraper(BaseScraper):
    source = "ovoko"

    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        context = await self._new_context(browser)
        page = await context.new_page()

        for query in SEED_QUERIES:
            if self._reached_limit:
                break
            try:
                async for listing in self._scrape_query(page, query):
                    yield listing
                    if self._reached_limit:
                        break
            except Exception as exc:
                logger.warning("ovoko_query_failed", query=query, error=str(exc))

        await context.close()

    @property
    def _reached_limit(self) -> bool:
        return False  # limit enforced by run() caller

    async def _scrape_query(self, page, query: str) -> AsyncIterator[dict]:
        captured: list[dict] = []

        async def handle_response(response):
            if "search" in response.url and response.status == 200:
                try:
                    ct = response.headers.get("content-type", "")
                    if "json" in ct:
                        body = await response.json()
                        captured.append(body)
                except Exception:
                    pass

        page.on("response", handle_response)
        search_url = f"{OVOKO_BASE}/en/search?query={query.replace(' ', '+')}&condition=used"

        try:
            await self._fetch_with_retry(page, search_url)
            await page.wait_for_timeout(3000)
        except Exception as exc:
            logger.warning("ovoko_search_failed", query=query, error=str(exc))
            page.remove_listener("response", handle_response)
            return

        page.remove_listener("response", handle_response)

        # Try XHR-captured JSON first
        items = []
        for payload in captured:
            items.extend(self._extract_items_from_json(payload))

        # Fallback: parse HTML cards
        if not items:
            items = await self._extract_items_from_html(page, search_url)

        for item in items:
            raw = self._normalize_listing(item)
            yield raw

    def _extract_items_from_json(self, payload: dict) -> list[dict]:
        """Try multiple known Ovoko API response shapes."""
        candidates = []

        # Shape 1: {"products": [...]}
        products = payload.get("products") or payload.get("items") or payload.get("data") or []
        if isinstance(products, dict):
            products = products.get("items") or products.get("products") or []

        if not isinstance(products, list):
            return []

        for p in products:
            if not isinstance(p, dict):
                continue
            try:
                price = float(p.get("price") or p.get("priceEur") or p.get("price_eur") or 0)
                if price <= 0:
                    continue

                currency = p.get("currency") or p.get("priceCurrency") or "EUR"
                seller_country = (p.get("seller") or {}).get("country") or p.get("country") or "EU"
                ext_id = str(p.get("id") or p.get("slug") or p.get("sku") or "")[:30]
                if not ext_id:
                    continue

                images = p.get("images") or p.get("imageUrls") or []
                if isinstance(images, list):
                    images = [img if isinstance(img, str) else img.get("url", "") for img in images[:5]]
                else:
                    images = []

                candidates.append({
                    "external_id":      ext_id,
                    "url":              p.get("url") or f"{OVOKO_BASE}/en/part/{ext_id}",
                    "title":            p.get("name") or p.get("title") or "",
                    "part_number":      p.get("partNumber") or p.get("oem") or p.get("sku"),
                    "brand":            p.get("brand") or (p.get("manufacturer") or {}).get("name"),
                    "condition":        "USED",
                    "part_type":        "USED",
                    "price":            price,
                    "currency":         currency,
                    "shipping_cost_eur": float(p.get("shippingCost") or p.get("shipping_cost") or 9.99),
                    "shipping_to":      ["FR", "DE", "ES", "IT", "PL", "GB"],
                    "seller_name":      (p.get("seller") or {}).get("name") or "Ovoko Seller",
                    "seller_country":   seller_country,
                    "location_country": seller_country,
                    "location_city":    (p.get("seller") or {}).get("city"),
                    "stock_qty":        1,
                    "image_urls":       [img for img in images if img],
                })
            except (ValueError, TypeError, AttributeError):
                continue

        return candidates

    async def _extract_items_from_html(self, page, search_url: str) -> list[dict]:
        """HTML fallback — parse product cards from search results page."""
        results = []
        selectors = [
            ".product-card",
            ".part-card",
            "[data-testid='product-item']",
            ".search-result-item",
            ".catalog-item",
            "article.product",
        ]

        cards = []
        for sel in selectors:
            cards = await page.query_selector_all(sel)
            if cards:
                break

        if not cards:
            html_preview = (await page.content())[2000:4000]
            logger.warning("ovoko_no_cards_found", url=search_url, html_preview=html_preview)
            return results

        for card in cards:
            try:
                title_el = await card.query_selector("h2, h3, .title, .product-name, [class*='name']")
                price_el = await card.query_selector(".price, [class*='price'], [data-price]")
                link_el  = await card.query_selector("a[href]")
                img_el   = await card.query_selector("img")

                title = (await title_el.inner_text()).strip() if title_el else ""
                href  = await link_el.get_attribute("href") if link_el else None
                img   = await img_el.get_attribute("src") if img_el else None

                price_text = (await price_el.inner_text()).strip() if price_el else ""
                price_match = re.search(r"[\d.,]+", price_text.replace(" ", ""))
                if not price_match:
                    continue
                price = float(price_match.group().replace(",", "."))
                if price <= 0:
                    continue

                url = f"{OVOKO_BASE}{href}" if href and href.startswith("/") else (href or "")
                ext_id = re.search(r"/(\d+)(?:[\-/]|$)", url)
                ext_id = ext_id.group(1) if ext_id else url.split("/")[-1][:30]
                if not ext_id:
                    continue

                results.append({
                    "external_id":      ext_id,
                    "url":              url,
                    "title":            title,
                    "part_number":      None,
                    "brand":            None,
                    "condition":        "USED",
                    "part_type":        "USED",
                    "price":            price,
                    "currency":         "EUR",
                    "shipping_cost_eur": 9.99,
                    "shipping_to":      ["FR", "DE", "ES", "IT", "PL", "GB"],
                    "seller_name":      "Ovoko Seller",
                    "seller_country":   "EU",
                    "location_country": "EU",
                    "stock_qty":        1,
                    "image_urls":       [img] if img else [],
                })
            except Exception as exc:
                logger.debug("ovoko_card_parse_failed", error=str(exc))

        return results
