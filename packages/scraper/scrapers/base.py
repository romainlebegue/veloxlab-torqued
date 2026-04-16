"""
BaseScraper — all per-source scrapers inherit from this class.
Enforces: rate limiting, stealth, retry, circuit breaker, UA rotation.
"""

import asyncio
import random
import time
from abc import ABC, abstractmethod
from collections import deque
from typing import AsyncIterator

import structlog
from playwright.async_api import async_playwright, Browser, BrowserContext, Page
try:
    from playwright_stealth import Stealth
    _STEALTH_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    _STEALTH_AVAILABLE = False
    class Stealth:  # noqa: E302
        def __init__(self, *args, **kwargs): pass
        async def __call__(self, page): pass
        async def apply_stealth_async(self, context): pass
from tenacity import retry, stop_after_attempt, wait_exponential

from processors.normalize import normalize_part_number, to_eur

logger = structlog.get_logger()

_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
]

_VIEWPORTS = [
    {"width": 1366, "height": 768},
    {"width": 1440, "height": 900},
    {"width": 1920, "height": 1080},
    {"width": 1280, "height": 800},
]

RATE_LIMIT_INTERVAL = 2.5  # seconds between requests (base)
RATE_JITTER_MAX = 1.5       # max extra seconds of random jitter


class CircuitBreakerOpen(Exception):
    pass


class CircuitBreaker:
    """
    Pauses the domain for 1h if error rate > 20% over 100 requests.
    """

    WINDOW = 100
    THRESHOLD = 0.20
    PAUSE_SECONDS = 3600

    def __init__(self) -> None:
        self._results: deque[bool] = deque(maxlen=self.WINDOW)
        self._paused_until: float = 0.0

    def record(self, success: bool) -> None:
        self._results.append(success)

    def check(self) -> None:
        if time.monotonic() < self._paused_until:
            raise CircuitBreakerOpen("Circuit breaker open — domain paused for 1h")
        if len(self._results) == self.WINDOW:
            error_rate = self._results.count(False) / self.WINDOW
            if error_rate > self.THRESHOLD:
                self._paused_until = time.monotonic() + self.PAUSE_SECONDS
                logger.warning(
                    "circuit_breaker_tripped", error_rate=error_rate
                )
                raise CircuitBreakerOpen(f"Error rate {error_rate:.0%} exceeded threshold")


class BaseScraper(ABC):
    source: str  # e.g. "ebay_fr" — must match sellers.name in DB

    def __init__(self, limit: int = 500, dry_run: bool = False) -> None:
        self.limit = limit
        self.dry_run = dry_run
        self._circuit_breaker = CircuitBreaker()
        self._last_request_at: float = 0.0

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def run(self) -> list[dict]:
        """Entry point. Returns list of normalized listing dicts."""
        listings: list[dict] = []
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            try:
                async for listing in self._scrape(browser):
                    listings.append(listing)
                    if len(listings) >= self.limit:
                        break
            finally:
                await browser.close()
        logger.info("scrape_complete", source=self.source, count=len(listings))
        return listings

    # ------------------------------------------------------------------
    # To implement in subclasses
    # ------------------------------------------------------------------

    @abstractmethod
    async def _scrape(self, browser: Browser) -> AsyncIterator[dict]:
        """Yield normalized listing dicts."""
        ...

    # ------------------------------------------------------------------
    # Helpers available to subclasses
    # ------------------------------------------------------------------

    async def _new_context(self, browser: Browser) -> BrowserContext:
        """Create a stealth browser context with randomized UA + viewport."""
        ua = random.choice(_USER_AGENTS)
        viewport = random.choice(_VIEWPORTS)
        context = await browser.new_context(
            user_agent=ua,
            viewport=viewport,
            locale="fr-FR",
        )
        stealth = Stealth()
        await stealth.apply_stealth_async(context)
        return context

    async def _rate_limited_goto(self, page: Page, url: str) -> None:
        """Navigate with rate limiting + jitter. Never use time.sleep(N)."""
        self._circuit_breaker.check()
        elapsed = time.monotonic() - self._last_request_at
        wait = RATE_LIMIT_INTERVAL + random.uniform(0, RATE_JITTER_MAX) - elapsed
        if wait > 0:
            await asyncio.sleep(wait)
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
            self._circuit_breaker.record(True)
        except Exception as exc:
            self._circuit_breaker.record(False)
            logger.warning("goto_failed", url=url, error=str(exc))
            raise
        finally:
            self._last_request_at = time.monotonic()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=5, max=60))
    async def _fetch_with_retry(self, page: Page, url: str) -> None:
        await self._rate_limited_goto(page, url)

    def _normalize_listing(self, raw: dict) -> dict:
        """
        Apply normalization to a raw listing dict scraped from source.
        Must be called before passing to storage layer.
        """
        if raw.get("part_number"):
            raw["part_number_normalized"] = normalize_part_number(raw["part_number"])
        raw["price_eur"] = to_eur(
            float(raw.get("price", 0)), raw.get("currency", "EUR")
        )
        raw["source"] = self.source
        return raw
