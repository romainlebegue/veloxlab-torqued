"""
Mister Auto scraper — mister-auto.com (FR)

Mister Auto has a clean JSON API for catalog search.
No Cloudflare. Product pages have full Schema.org JSON-LD.

Strategy:
  1. Use their search API: /api/search?q={part}&country=FR
  2. Fallback: sitemap crawl + JSON-LD extraction (same as Oscaro)

Dry-run: python main.py --source mister_auto --limit 20 --dry-run
"""

import json
import re
from typing import AsyncIterator
from xml.etree import ElementTree

import httpx
import structlog
from playwright.async_api import Browser

from .base import BaseScraper

logger = structlog.get_logger()

MISTER_AUTO_BASE    = "https://www.mister-auto.com"
MISTER_AUTO_SITEMAP = "https://www.mister-auto.com/sitemap.xml"

NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

# Search terms to seed (top categories by FR volume)
SEED_QUERIES = [
    "disque frein avant",
    "plaquette frein avant",
    "amortisseur avant",
    "filtre huile",
    "filtre air",
    "courroie distribution",
    "batterie",
    "bougie",
]


class MisterAutoScraper(BaseScraper):
    source = "mister_auto"

    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        product_urls = await self._fetch_product_urls()

        if not product_urls:
            # Fallback: search-based scraping
            async for listing in self._scrape_via_search(browser):
                yield listing
            return

        context = await self._new_context(browser)
        page = await context.new_page()

        for url in product_urls[: self.limit]:
            try:
                await self._fetch_with_retry(page, url)
                raw = await self._extract_json_ld(page, url)
                if raw:
                    self._circuit_breaker.record(True)
                    yield self._normalize_listing(raw)
            except Exception as exc:
                logger.warning("mister_auto_page_failed", url=url, error=str(exc))
                self._circuit_breaker.record(False)

        await context.close()

    async def _fetch_product_urls(self) -> list[str]:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            try:
                resp = await client.get(MISTER_AUTO_SITEMAP)
                resp.raise_for_status()
                root = ElementTree.fromstring(resp.content)
                sub_sitemaps = [
                    loc.text for loc in root.findall("sm:sitemap/sm:loc", NS)
                    if loc.text and "product" in (loc.text or "").lower()
                ]
                urls: list[str] = []
                for sm_url in sub_sitemaps[:2]:
                    r = await client.get(sm_url)
                    r.raise_for_status()
                    sm_root = ElementTree.fromstring(r.content)
                    batch = [
                        loc.text for loc in sm_root.findall("sm:url/sm:loc", NS)
                        if loc.text and "/fr/" in (loc.text or "")
                    ]
                    urls.extend(batch)
                return urls
            except Exception as exc:
                logger.warning("mister_auto_sitemap_failed", error=str(exc))
                return []

    async def _scrape_via_search(self, browser: Browser) -> AsyncIterator[dict]:
        """Search-based fallback when sitemap is unavailable."""
        context = await self._new_context(browser)
        page = await context.new_page()

        for query in SEED_QUERIES:
            url = f"{MISTER_AUTO_BASE}/fr/recherche?q={query.replace(' ', '+')}"
            try:
                await self._fetch_with_retry(page, url)
                await page.wait_for_selector(".product-item, .product-card", timeout=8_000)

                items = await page.query_selector_all(".product-item, .product-card")
                for item in items:
                    try:
                        link_el  = await item.query_selector("a")
                        href     = await link_el.get_attribute("href") if link_el else None
                        if not href:
                            continue
                        prod_url = f"{MISTER_AUTO_BASE}{href}" if href.startswith("/") else href
                        await self._fetch_with_retry(page, prod_url)
                        raw = await self._extract_json_ld(page, prod_url)
                        if raw:
                            self._circuit_breaker.record(True)
                            yield self._normalize_listing(raw)
                    except Exception as exc:
                        logger.warning("mister_auto_item_failed", error=str(exc))
                        self._circuit_breaker.record(False)
            except Exception as exc:
                logger.warning("mister_auto_search_failed", query=query, error=str(exc))

        await context.close()

    async def _extract_json_ld(self, page, url: str) -> dict | None:
        scripts = await page.query_selector_all('script[type="application/ld+json"]')
        for script in scripts:
            try:
                data = json.loads(await script.inner_text())
                if not isinstance(data, dict) or data.get("@type") != "Product":
                    continue

                offers_raw = data.get("offers", {})
                if isinstance(offers_raw, list):
                    offers_raw = offers_raw[0] if offers_raw else {}

                price = float(str(offers_raw.get("price", 0)).replace(",", "."))
                if price <= 0:
                    continue

                availability = offers_raw.get("availability", "")
                stock_qty    = 99 if "InStock" in availability else 0

                ext_id = re.search(r"/(\d+)(?:\.html)?(?:\?|$)", url)
                ext_id = ext_id.group(1) if ext_id else url.split("/")[-1][:20]

                images = data.get("image", [])
                if isinstance(images, str):
                    images = [images]

                # Warranty — Mister Auto typically offers 2 years
                warranty_months = 24
                warranty_el = await page.query_selector(".warranty, .garantie, [data-warranty]")
                if warranty_el:
                    w = await warranty_el.inner_text()
                    m = re.search(r"(\d+)\s*(mois|an)", w, re.IGNORECASE)
                    if m:
                        warranty_months = int(m.group(1)) * (12 if "an" in m.group(2) else 1)

                return {
                    "external_id":      ext_id,
                    "url":              url,
                    "title":            data.get("name", ""),
                    "part_number":      data.get("mpn") or data.get("sku"),
                    "brand":            (data.get("brand") or {}).get("name"),
                    "condition":        "NEW",
                    "part_type":        "NEW_IAM",
                    "price":            price,
                    "currency":         offers_raw.get("priceCurrency", "EUR"),
                    "shipping_cost_eur": 0.0,   # Mister Auto: free shipping FR >20€
                    "shipping_to":      ["FR"],
                    "seller_name":      "Mister Auto",
                    "seller_country":   "FR",
                    "location_country": "FR",
                    "stock_qty":        stock_qty,
                    "warranty_months":  warranty_months,
                    "image_urls":       images[:5],
                }
            except (json.JSONDecodeError, ValueError, KeyError, TypeError):
                continue
        return None
