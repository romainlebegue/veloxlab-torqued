# Scraper conventions (Python / Playwright)

## Inheritance
- All scrapers inherit `BaseScraper` from `packages/scraper/scrapers/base.py`
- Set `source` class attribute to match `sellers.name` in DB (e.g. `"ebay_fr"`)

## Rate limiting
- Base interval: 1 req / 2.5s per domain
- Always add random jitter (0 – 1.5s): `asyncio.sleep(interval + random.uniform(0, JITTER))`
- Never use `time.sleep(N)` with a fixed value

## Retry
- Use `@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=5, max=60))` from tenacity
- Apply to `_fetch_with_retry()` — never retry raw goto calls directly

## Circuit breaker
- Pause domain for 1h if error rate > 20% over 100 requests
- `CircuitBreaker` class in `base.py` — call `check()` before each request, `record()` after

## Stealth
- Apply `playwright_stealth.Stealth()` to every browser context
- Rotate user-agents from the pool of 5 in `base.py`
- Randomize viewport per context

## Part number normalization
- Always call `normalize_part_number()` from `processors/normalize.py` before DB insert
- Never skip this — raw strings must not enter the DB

## Photos
- Download up to 5 photos per listing (MAX_PHOTOS)
- Resize to max 800×600 via Pillow
- Upload to R2 at `parts/{listing_id[:2]}/{listing_id}/{idx}.jpg`
- Never store source URLs in `image_urls` — they expire

## Logging
- Use `structlog` — never `print()` or `logging.basicConfig`
- Never commit `console.log` or debug prints

## Currency
- Convert to EUR at scrape time using `to_eur()` from `processors/normalize.py`
- Store original currency in `currency` field

## FlareSolverr
- Use for Cloudflare-protected sites only
- Pass `FLARESOLVERR_URL` from env — never hardcode
