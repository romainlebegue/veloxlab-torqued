"""
Oscaro scraper — oscaro.com (pas de Cloudflare, JSON-LD natif).

Oscaro expose des Product JSON-LD sur toutes ses pages produit.
Stratégie :
  1. Récupérer le sitemap produit (sitemap.xml → sitemap-products-*.xml)
  2. Extraire les URLs produits
  3. Scraper chaque page produit via le JSON-LD

Dry-run: python main.py --source oscaro --limit 20 --dry-run
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

OSCARO_BASE    = "https://www.oscaro.com"
OSCARO_SITEMAP = "https://www.oscaro.com/sitemap.xml"

# Sitemap namespaces
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


class OscaroScraper(BaseScraper):
    source = "oscaro"

    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        product_urls = await self._fetch_product_urls()
        logger.info("oscaro_urls_found", count=len(product_urls))

        context = await self._new_context(browser)
        page = await context.new_page()

        for url in product_urls[: self.limit]:
            try:
                await self._fetch_with_retry(page, url)
                raw = await self._extract_json_ld(page, url)
                if raw:
                    self._circuit_breaker.record(True)
                    yield self._normalize_listing(raw)
                else:
                    self._circuit_breaker.record(False)
            except Exception as exc:
                logger.warning("oscaro_page_failed", url=url, error=str(exc))
                self._circuit_breaker.record(False)

        await context.close()

    async def _fetch_product_urls(self) -> list[str]:
        """Download Oscaro sitemap and extract product page URLs."""
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            try:
                resp = await client.get(OSCARO_SITEMAP)
                resp.raise_for_status()
            except Exception as exc:
                logger.error("oscaro_sitemap_failed", error=str(exc))
                return []

            root = ElementTree.fromstring(resp.content)
            sub_sitemaps = [
                loc.text for loc in root.findall("sm:sitemap/sm:loc", NS)
                if loc.text and "product" in (loc.text or "")
            ]

            urls: list[str] = []
            for sm_url in sub_sitemaps[:3]:  # cap at 3 sub-sitemaps for POC
                try:
                    r = await client.get(sm_url)
                    r.raise_for_status()
                    sm_root = ElementTree.fromstring(r.content)
                    batch = [
                        loc.text for loc in sm_root.findall("sm:url/sm:loc", NS)
                        if loc.text and "/fr/" in (loc.text or "")
                    ]
                    urls.extend(batch)
                except Exception as exc:
                    logger.warning("oscaro_sub_sitemap_failed", url=sm_url, error=str(exc))

            return urls

    async def _extract_json_ld(self, page, url: str) -> dict | None:
        """Parse Product JSON-LD from a product page."""
        scripts = await page.query_selector_all('script[type="application/ld+json"]')

        for script in scripts:
            try:
                content = await script.inner_text()
                data = json.loads(content)
                if not isinstance(data, dict):
                    continue
                if data.get("@type") != "Product":
                    continue

                offers_raw = data.get("offers", {})
                if isinstance(offers_raw, list):
                    offers_raw = offers_raw[0] if offers_raw else {}

                price_str = offers_raw.get("price") or offers_raw.get("lowPrice", "0")
                try:
                    price = float(str(price_str).replace(",", "."))
                except ValueError:
                    continue

                if price <= 0:
                    continue

                availability = offers_raw.get("availability", "")
                in_stock = "InStock" in availability or "LimitedAvailability" in availability

                # Extract stock quantity if present
                stock_qty = None
                stock_el = await page.query_selector(".stock-qty, [data-stock], .quantity-available")
                if stock_el:
                    stock_text = await stock_el.inner_text()
                    m = re.search(r"(\d+)", stock_text)
                    if m:
                        stock_qty = int(m.group(1))
                elif in_stock:
                    stock_qty = 99  # in stock but qty unknown

                # Part number from MPN or SKU
                part_number = data.get("mpn") or data.get("sku")

                # Warranty
                warranty_months = 24  # Oscaro default
                warranty_el = await page.query_selector(".warranty, .garantie")
                if warranty_el:
                    w = await warranty_el.inner_text()
                    m = re.search(r"(\d+)\s*(mois|an)", w, re.IGNORECASE)
                    if m:
                        warranty_months = int(m.group(1)) * (12 if "an" in m.group(2).lower() else 1)

                # Fitment data
                vehicle_make  = None
                vehicle_model = None
                vehicle_years = None
                breadcrumb_el = await page.query_selector(".breadcrumb, nav[aria-label='breadcrumb']")
                if breadcrumb_el:
                    breadcrumb = await breadcrumb_el.inner_text()
                    parts = [p.strip() for p in breadcrumb.split(">") if p.strip()]
                    if len(parts) >= 3:
                        vehicle_make  = parts[1] if len(parts) > 1 else None
                        vehicle_model = parts[2] if len(parts) > 2 else None

                images = data.get("image", [])
                if isinstance(images, str):
                    images = [images]

                external_id = re.search(r"/(\d+)(?:\.html)?(?:\?|$)", url)
                ext_id = external_id.group(1) if external_id else url.split("/")[-1][:20]

                return {
                    "external_id":      ext_id,
                    "url":              url,
                    "title":            data.get("name", ""),
                    "part_number":      part_number,
                    "brand":            (data.get("brand") or {}).get("name"),
                    "condition":        "NEW",
                    "part_type":        "NEW_IAM",
                    "price":            price,
                    "currency":         offers_raw.get("priceCurrency", "EUR"),
                    "shipping_cost_eur": 4.5,
                    "shipping_to":      ["FR"],
                    "seller_name":      "Oscaro",
                    "seller_country":   "FR",
                    "location_country": "FR",
                    "vehicle_make":     vehicle_make,
                    "vehicle_model":    vehicle_model,
                    "vehicle_years":    vehicle_years,
                    "stock_qty":        stock_qty,
                    "warranty_months":  warranty_months,
                    "image_urls":       images[:5],
                }
            except (json.JSONDecodeError, KeyError, TypeError):
                continue

        return None
