"""
AutoDoc scraper — autodoc.fr (Cloudflare protected → Flaresolverr fallback).

AutoDoc structure:
  - Search by make/model/year via their API endpoint
  - Paginated JSON API: /api/catalog/article/list
  - Part pages: /fr/pneu-et-roue/{category}/{make}/{model}/{year}

Dry-run: python main.py --source autodoc --limit 20 --dry-run
"""

import json
import os
import re
from typing import AsyncIterator

import httpx
import structlog
from playwright.async_api import Browser

from .base import BaseScraper

logger = structlog.get_logger()

AUTODOC_BASE  = "https://www.autodoc.fr"
FLARESOLVERR  = os.environ.get("FLARESOLVERR_URL", "http://localhost:8191")

# Top make/category combos to seed scraping (extend from TecDoc data)
SEED_SEARCHES: list[dict] = [
    {"make": "volkswagen", "model": "golf-7",       "year": 2016, "cat": "disques-de-frein"},
    {"make": "volkswagen", "model": "golf-7",       "year": 2016, "cat": "plaquettes"},
    {"make": "peugeot",    "model": "308-t9",       "year": 2014, "cat": "disques-de-frein"},
    {"make": "renault",    "model": "clio-4",       "year": 2012, "cat": "disques-de-frein"},
    {"make": "ford",       "model": "focus-3",      "year": 2011, "cat": "disques-de-frein"},
    {"make": "bmw",        "model": "serie-3-f30",  "year": 2012, "cat": "disques-de-frein"},
    {"make": "mercedes",   "model": "classe-c-w205","year": 2014, "cat": "disques-de-frein"},
    {"make": "audi",       "model": "a3-8v",        "year": 2012, "cat": "disques-de-frein"},
]

# AutoDoc API base URL for JSON catalog
AUTODOC_API = "https://api.autodoc.fr/api"


class AutoDocScraper(BaseScraper):
    source = "autodoc"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._session: httpx.AsyncClient | None = None

    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        async with httpx.AsyncClient(
            timeout=20,
            headers={"Accept-Language": "fr-FR,fr;q=0.9", "Accept": "application/json"},
            follow_redirects=True,
        ) as client:
            for seed in SEED_SEARCHES:
                async for listing in self._scrape_search(browser, client, seed):
                    yield listing

    async def _scrape_search(
        self, browser: Browser, client: httpx.AsyncClient, seed: dict
    ) -> AsyncIterator[dict]:
        """
        AutoDoc uses Cloudflare. Strategy:
        1. Try direct JSON API (fast path)
        2. Fallback to Flaresolverr + Playwright if 403/blocked
        """
        make  = seed["make"]
        model = seed["model"]
        year  = seed["year"]
        cat   = seed["cat"]

        url = f"{AUTODOC_BASE}/fr/pneu-et-roue/{cat}/{make}/{model}/{year}"

        try:
            # Fast path: Playwright with stealth
            context = await self._new_context(browser)
            page = await context.new_page()
            await self._fetch_with_retry(page, url)

            # AutoDoc renders results via XHR — wait for the product grid
            await page.wait_for_selector(".product-card", timeout=10_000)

            items = await page.query_selector_all(".product-card")
            for item in items:
                raw = await self._parse_product_card(item, make, model, year)
                if raw:
                    self._circuit_breaker.record(True)
                    yield self._normalize_listing(raw)

            await context.close()

        except Exception as exc:
            logger.warning(
                "autodoc_playwright_failed", url=url, error=str(exc),
                note="Trying Flaresolverr fallback"
            )
            self._circuit_breaker.record(False)
            # Flaresolverr fallback
            async for listing in self._flaresolverr_fallback(client, url, make, model, year):
                yield listing

    async def _parse_product_card(self, item, make: str, model: str, year: int) -> dict | None:
        """Parse a .product-card element from AutoDoc search results."""
        title_el   = await item.query_selector(".product-title, h3, .article-name")
        price_el   = await item.query_selector(".product-price__value, .price")
        brand_el   = await item.query_selector(".product-brand, .brand-name")
        ref_el     = await item.query_selector(".product-article-number, .article-number")
        link_el    = await item.query_selector("a.product-card__link, a")
        image_el   = await item.query_selector("img.product-image, img")
        warranty_el = await item.query_selector(".product-warranty, .warranty")

        if not title_el or not price_el:
            return None

        title      = (await title_el.inner_text()).strip()
        price_text = (await price_el.inner_text()).strip()
        price      = self._parse_price(price_text)
        if price is None:
            return None

        brand      = (await brand_el.inner_text()).strip() if brand_el else None
        part_number = (await ref_el.inner_text()).strip().replace("Réf. :", "").strip() if ref_el else None
        link       = await link_el.get_attribute("href") if link_el else None
        url        = f"{AUTODOC_BASE}{link}" if link and link.startswith("/") else (link or "")
        image_url  = await image_el.get_attribute("src") if image_el else None

        warranty_months = None
        if warranty_el:
            w_text = (await warranty_el.inner_text()).strip()
            m = re.search(r"(\d+)\s*mois", w_text, re.IGNORECASE)
            if m:
                warranty_months = int(m.group(1))

        external_id = re.search(r"/(\d+)(?:\.html)?$", url)
        if not external_id:
            external_id = hashlib.sha1(url.encode()).hexdigest()[:12]
        else:
            external_id = external_id.group(1)

        return {
            "external_id":      external_id,
            "url":              url,
            "title":            title,
            "part_number":      part_number,
            "brand":            brand,
            "condition":        "NEW",
            "part_type":        "NEW_IAM",
            "price":            price,
            "currency":         "EUR",
            "shipping_cost_eur": 5.99,   # AutoDoc standard FR shipping
            "shipping_to":      ["FR", "DE", "ES", "UK"],
            "seller_name":      "AutoDoc",
            "seller_country":   "DE",
            "location_country": "DE",
            "vehicle_make":     make,
            "vehicle_model":    model,
            "vehicle_years":    str(year),
            "warranty_months":  warranty_months or 24,
            "image_urls":       [image_url] if image_url else [],
        }

    async def _flaresolverr_fallback(
        self, client: httpx.AsyncClient, url: str, make: str, model: str, year: int
    ) -> AsyncIterator[dict]:
        """Use Flaresolverr to bypass Cloudflare, then parse HTML."""
        try:
            resp = await client.post(
                f"{FLARESOLVERR}/v1",
                json={
                    "cmd": "request.get",
                    "url": url,
                    "maxTimeout": 30000,
                },
                timeout=40,
            )
            if resp.status_code != 200:
                logger.error("flaresolverr_failed", status=resp.status_code)
                return

            data = resp.json()
            html = data.get("solution", {}).get("response", "")
            if not html:
                return

            # Minimal HTML parsing without browser (fallback only)
            # Extract JSON-LD or meta data if present
            json_ld_matches = re.findall(
                r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL
            )
            for raw_json in json_ld_matches:
                try:
                    data_ld = json.loads(raw_json)
                    if isinstance(data_ld, dict) and data_ld.get("@type") == "Product":
                        listing = self._from_json_ld(data_ld, url, make, model, year)
                        if listing:
                            yield self._normalize_listing(listing)
                except json.JSONDecodeError:
                    continue

        except Exception as exc:
            logger.error("flaresolverr_exception", error=str(exc))

    def _from_json_ld(
        self, data: dict, url: str, make: str, model: str, year: int
    ) -> dict | None:
        """Extract listing from Schema.org Product JSON-LD."""
        offers_raw = data.get("offers", {})
        if isinstance(offers_raw, list):
            offers_raw = offers_raw[0] if offers_raw else {}

        price_str = offers_raw.get("price") or offers_raw.get("lowPrice")
        if not price_str:
            return None

        try:
            price = float(str(price_str).replace(",", "."))
        except ValueError:
            return None

        external_id = re.search(r"/(\d+)", url)
        ext_id = external_id.group(1) if external_id else url[-12:]

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
            "shipping_cost_eur": 5.99,
            "shipping_to":      ["FR"],
            "seller_name":      "AutoDoc",
            "seller_country":   "DE",
            "vehicle_make":     make,
            "vehicle_model":    model,
            "vehicle_years":    str(year),
            "warranty_months":  24,
            "image_urls":       data.get("image", []) if isinstance(data.get("image"), list) else [],
        }

    def _parse_price(self, text: str) -> float | None:
        text = text.replace("\xa0", "").replace(" ", "")
        m = re.search(r"([\d]+[.,][\d]{1,2})", text)
        if m:
            try:
                return float(m.group(1).replace(",", "."))
            except ValueError:
                pass
        return None


import hashlib  # noqa: E402 — used in _parse_product_card
