"""
Kfzteile24 scraper — kfzteile24.de (DE pure-player, IAM neuf)

Kfzteile24 is one of Germany's leading online auto parts retailers.
No Cloudflare. Good JSON-LD on product pages.

Strategy:
  1. Seed category URLs → collect product links from listing pages
  2. For each product page, extract Schema.org Product JSON-LD
  3. Fallback: parse HTML product detail if no JSON-LD

Dry-run: python main.py --source kfzteile24 --limit 50 --dry-run
"""

import json
import re
from typing import AsyncIterator

import structlog
from playwright.async_api import Browser

from .base import BaseScraper

logger = structlog.get_logger()

KFZTEILE24_BASE = "https://www.kfzteile24.de"

# Category seed URLs — stable category pages with rich listings
SEED_CATEGORIES = [
    "/bremsscheiben",
    "/bremsbelaege",
    "/stossdaempfer",
    "/oelfilter",
    "/luftfilter",
    "/zuendkerzen",
    "/lichtmaschinen",
    "/anlasser",
    "/scheinwerfer",
    "/stossstangen",
]


class Kfzteile24Scraper(BaseScraper):
    source = "kfzteile24"

    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        product_urls = await self._collect_product_urls(browser)
        logger.info("kfzteile24_urls_found", count=len(product_urls))

        context = await self._new_context(browser)
        page = await context.new_page()

        for url in product_urls[: self.limit]:
            try:
                await self._fetch_with_retry(page, url)
                raw = await self._extract_product(page, url)
                if raw:
                    self._circuit_breaker.record(True)
                    yield self._normalize_listing(raw)
                else:
                    self._circuit_breaker.record(False)
            except Exception as exc:
                logger.warning("kfzteile24_page_failed", url=url, error=str(exc))
                self._circuit_breaker.record(False)

        await context.close()

    async def _collect_product_urls(self, browser: Browser) -> list[str]:
        """Scrape category listing pages to collect product URLs."""
        context = await self._new_context(browser)
        page = await context.new_page()
        urls: list[str] = []

        # Product link selectors for kfzteile24 listing pages
        product_link_selectors = [
            "a.product-name",
            "a.product-title",
            ".product-item a[href*='/produkt']",
            ".product-item a[href*='/p-']",
            "a[href*='/bremsscheibe']",
            "a[href*='/bremsbel']",
            ".catalog-product-item a",
            "[data-product-id] a",
        ]

        for cat_path in SEED_CATEGORIES:
            url = f"{KFZTEILE24_BASE}{cat_path}"
            try:
                await self._fetch_with_retry(page, url)
                await page.wait_for_timeout(2000)

                links = []
                for sel in product_link_selectors:
                    els = await page.query_selector_all(sel)
                    if els:
                        for el in els:
                            href = await el.get_attribute("href")
                            if href:
                                links.append(href)
                        break

                # Generic fallback — any link containing product path patterns
                if not links:
                    all_links = await page.query_selector_all("a[href]")
                    for el in all_links:
                        href = await el.get_attribute("href") or ""
                        if any(p in href for p in ["/p-", "/produkt", "-p-", "article"]):
                            links.append(href)

                for href in links:
                    full = f"{KFZTEILE24_BASE}{href}" if href.startswith("/") else href
                    if full not in urls and KFZTEILE24_BASE in full:
                        urls.append(full)

                logger.info("kfzteile24_category_scraped", category=cat_path, found=len(links))
            except Exception as exc:
                logger.warning("kfzteile24_category_failed", url=url, error=str(exc))

        await context.close()
        return urls

    async def _extract_product(self, page, url: str) -> dict | None:
        """Extract product data — JSON-LD first, HTML fallback."""
        raw = await self._extract_json_ld(page, url)
        if raw:
            return raw
        return await self._extract_html(page, url)

    async def _extract_json_ld(self, page, url: str) -> dict | None:
        scripts = await page.query_selector_all('script[type="application/ld+json"]')
        for script in scripts:
            try:
                data = json.loads(await script.inner_text())
                # Handle @graph arrays
                if isinstance(data, dict) and data.get("@graph"):
                    for item in data["@graph"]:
                        if isinstance(item, dict) and item.get("@type") == "Product":
                            data = item
                            break
                if not isinstance(data, dict) or data.get("@type") != "Product":
                    continue

                offers_raw = data.get("offers", {})
                if isinstance(offers_raw, list):
                    offers_raw = offers_raw[0] if offers_raw else {}

                price_str = offers_raw.get("price") or offers_raw.get("lowPrice") or "0"
                price = float(str(price_str).replace(",", "."))
                if price <= 0:
                    continue

                availability = offers_raw.get("availability", "")
                in_stock = "InStock" in availability or "LimitedAvailability" in availability
                stock_qty = 99 if in_stock else 0

                ext_id = re.search(r"[/-](\d{5,})(?:[/-]|$)", url)
                ext_id = ext_id.group(1) if ext_id else url.split("/")[-1].split("?")[0][:30]

                images = data.get("image", [])
                if isinstance(images, str):
                    images = [images]
                elif isinstance(images, dict):
                    images = [images.get("url", "")]
                images = [img for img in images if img][:5]

                # Shipping to DE/AT/CH standard — also ships to FR, ES, IT
                shipping = float(offers_raw.get("shippingDetails", {}).get("shippingRate", {}).get("value") or 4.99)

                return {
                    "external_id":      ext_id,
                    "url":              url,
                    "title":            data.get("name", ""),
                    "part_number":      data.get("mpn") or data.get("sku") or data.get("gtin13"),
                    "brand":            (data.get("brand") or {}).get("name"),
                    "condition":        "NEW",
                    "part_type":        "NEW_IAM",
                    "price":            price,
                    "currency":         offers_raw.get("priceCurrency", "EUR"),
                    "shipping_cost_eur": shipping,
                    "shipping_to":      ["DE", "AT", "CH", "FR", "ES", "IT", "NL"],
                    "seller_name":      "Kfzteile24",
                    "seller_country":   "DE",
                    "location_country": "DE",
                    "stock_qty":        stock_qty,
                    "warranty_months":  24,
                    "image_urls":       images,
                }
            except (json.JSONDecodeError, ValueError, KeyError, TypeError):
                continue
        return None

    async def _extract_html(self, page, url: str) -> dict | None:
        """HTML fallback when JSON-LD is absent."""
        try:
            title_el = await page.query_selector("h1.product-title, h1.product-name, h1[itemprop='name'], h1")
            price_el = await page.query_selector(
                "[itemprop='price'], .price-box .price, .product-price .price, "
                "[data-price], .final-price"
            )
            sku_el   = await page.query_selector("[itemprop='sku'], .product-sku, .sku-value")
            brand_el = await page.query_selector("[itemprop='brand'] [itemprop='name'], .brand-name")
            img_el   = await page.query_selector(".product-image img, .gallery-image img")

            title = (await title_el.inner_text()).strip() if title_el else ""
            if not title:
                return None

            price_text = (await price_el.inner_text()).strip() if price_el else ""
            price_attr = (await price_el.get_attribute("content")) if price_el else None
            price_str  = price_attr or price_text
            price_match = re.search(r"[\d]+[.,][\d]{2}", price_str.replace(" ", "").replace("\xa0", ""))
            if not price_match:
                return None
            price = float(price_match.group().replace(",", "."))
            if price <= 0:
                return None

            ext_id = re.search(r"[/-](\d{5,})(?:[/-]|$)", url)
            ext_id = ext_id.group(1) if ext_id else url.split("/")[-1][:30]

            img_src = await img_el.get_attribute("src") if img_el else None

            return {
                "external_id":      ext_id,
                "url":              url,
                "title":            title,
                "part_number":      (await sku_el.inner_text()).strip() if sku_el else None,
                "brand":            (await brand_el.inner_text()).strip() if brand_el else None,
                "condition":        "NEW",
                "part_type":        "NEW_IAM",
                "price":            price,
                "currency":         "EUR",
                "shipping_cost_eur": 4.99,
                "shipping_to":      ["DE", "AT", "CH", "FR", "ES", "IT", "NL"],
                "seller_name":      "Kfzteile24",
                "seller_country":   "DE",
                "location_country": "DE",
                "stock_qty":        99,
                "warranty_months":  24,
                "image_urls":       [img_src] if img_src else [],
            }
        except Exception as exc:
            logger.debug("kfzteile24_html_fallback_failed", url=url, error=str(exc))
            return None
