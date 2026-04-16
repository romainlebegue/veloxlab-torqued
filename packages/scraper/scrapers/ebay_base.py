"""
EbayBaseScraper — shared logic for all eBay country variants.
Subclass and set: source, EBAY_BASE, CURRENCY, SELLER_COUNTRY, LOCALE.
"""

import re
from typing import AsyncIterator

import structlog
from playwright.async_api import Browser, Page

from .base import BaseScraper

logger = structlog.get_logger()

EBAY_MOTORS_CAT = "9801"  # same category ID across all eBay sites

CONDITION_MAP_MULTILANG = {
    # FR
    "neuf": "NEW", "occasion": "USED", "reconditionné": "REMAN",
    # DE
    "neu": "NEW", "gebraucht": "USED", "generalüberholt": "REMAN",
    # EN
    "new": "NEW", "used": "USED", "refurbished": "REMAN",
    "for parts": "USED", "not working": "USED",
    # ES
    "nuevo": "NEW", "usado": "USED", "reacondicionado": "REMAN",
}


class EbayBaseScraper(BaseScraper):
    """Base for all eBay country scrapers. Override class attributes."""
    EBAY_BASE:      str = ""
    CURRENCY:       str = "EUR"
    SELLER_COUNTRY: str = "FR"
    LOCALE:         str = "fr-FR"

    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        page_num = 1
        while True:
            context = await self._new_context(browser)
            page = await context.new_page()
            url = (
                f"{self.EBAY_BASE}/sch/i.html"
                f"?_sacat={EBAY_MOTORS_CAT}&_pgn={page_num}&_ipg=60"
            )
            try:
                await self._fetch_with_retry(page, url)
                listings = await self._parse_search_page(page)
            except Exception as exc:
                logger.warning(f"{self.source}_page_failed", url=url, error=str(exc))
                await context.close()
                break

            if not listings:
                await context.close()
                break

            for raw in listings:
                yield self._normalize_listing(raw)

            has_next = await page.query_selector(".pagination__next:not([aria-disabled])")
            await context.close()
            if not has_next:
                break
            page_num += 1

    async def _parse_search_page(self, page: Page) -> list[dict]:
        items = await page.query_selector_all(".s-item:not(.s-item--placeholder)")
        results = []
        for item in items:
            try:
                raw = await self._parse_card(item)
                if raw:
                    results.append(raw)
            except Exception as exc:
                logger.warning(f"{self.source}_card_failed", error=str(exc))
        return results

    async def _parse_card(self, item) -> dict | None:
        title_el    = await item.query_selector(".s-item__title")
        price_el    = await item.query_selector(".s-item__price")
        link_el     = await item.query_selector(".s-item__link")
        seller_el   = await item.query_selector(".s-item__seller-info-text")
        image_el    = await item.query_selector(".s-item__image-img")
        cond_el     = await item.query_selector(".SECONDARY_INFO")
        shipping_el = await item.query_selector(".s-item__shipping")

        if not title_el or not price_el or not link_el:
            return None

        title = (await title_el.inner_text()).strip()
        if title.lower() in ("shop on ebay", "ebay angebote", "comprar en ebay"):
            return None

        url = re.sub(r"\?.*", "", await link_el.get_attribute("href") or "")
        ext_id = self._item_id(url)
        if not ext_id:
            return None

        price_text  = (await price_el.inner_text()).strip()
        price, curr = self._parse_price_text(price_text)
        if price is None:
            return None

        cond_raw    = (await cond_el.inner_text()).strip().lower() if cond_el else ""
        condition   = self._map_condition(cond_raw)
        ship_eur    = self._parse_shipping((await shipping_el.inner_text()).strip() if shipping_el else "")
        seller      = (await seller_el.inner_text()).strip().split("\n")[0] if seller_el else None
        img_src     = await image_el.get_attribute("src") if image_el else None

        return {
            "external_id":       ext_id,
            "url":               url,
            "title":             title,
            "condition":         condition,
            "part_type":         "USED" if condition == "USED" else "NEW_IAM",
            "price":             price,
            "currency":          curr or self.CURRENCY,
            "shipping_cost_eur": ship_eur,
            "seller_name":       seller,
            "seller_country":    self.SELLER_COUNTRY,
            "location_country":  self.SELLER_COUNTRY,
            "image_urls":        [img_src] if img_src else [],
        }

    # ------------------------------------------------------------------
    def _item_id(self, url: str) -> str | None:
        m = re.search(r"/itm/(?:[^/]+/)?(\d+)", url)
        return m.group(1) if m else None

    def _parse_price_text(self, text: str) -> tuple[float | None, str]:
        currency = self.CURRENCY
        if "£" in text or "GBP" in text:
            currency = "GBP"
        elif "$" in text or "USD" in text:
            currency = "USD"
        text = text.split("à")[0].split("to")[0].split("bis")[0]
        nums = re.findall(r"[\d\s,.]+", text)
        if not nums:
            return None, currency
        raw = nums[0].strip().replace(" ", "")
        # Normalise EU vs US decimal separators
        if raw.count(",") == 1 and raw.count(".") == 0:
            raw = raw.replace(",", ".")
        elif raw.count(",") >= 1 and raw.count(".") >= 1:
            # e.g. "1.234,56" → "1234.56"
            raw = raw.replace(".", "").replace(",", ".")
        try:
            return float(raw), currency
        except ValueError:
            return None, currency

    def _parse_shipping(self, text: str) -> float | None:
        t = text.lower()
        if any(w in t for w in ("gratuit", "free", "kostenlos", "gratis")):
            return 0.0
        m = re.search(r"([\d,.]+)\s*(?:€|eur|£|gbp)", t, re.IGNORECASE)
        if m:
            raw = m.group(1).replace(",", ".")
            try:
                return float(raw)
            except ValueError:
                pass
        return None

    def _map_condition(self, raw: str) -> str:
        for key, val in CONDITION_MAP_MULTILANG.items():
            if key in raw:
                return val
        return "USED"
