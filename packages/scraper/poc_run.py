"""
POC one-shot scraper — runs all 10 sources once and inserts into Supabase.

This is NOT a production cron job. Run it once to populate the DB with
enough real data to drive UX development.

Usage:
  python poc_run.py                    # 100 listings/source, all 10 sources
  python poc_run.py --limit 50         # 50 listings/source
  python poc_run.py --sources oscaro,kfzteile24  # specific sources only
  python poc_run.py --dry-run          # print results, no Supabase insert

Output: progress per source + final summary table.
"""

import argparse
import asyncio
import os
import time
from datetime import timedelta

import structlog
from dotenv import load_dotenv

from scrapers import SCRAPERS
from storage.supabase_uploader import SupabaseUploader
from storage.r2_uploader import R2Uploader

load_dotenv()
logger = structlog.get_logger()

# Default order — most reliable sources first
DEFAULT_SOURCES = [
    "oscaro",
    "mister_auto",
    "kfzteile24",
    "ovoko",
    "ebay_fr",
    "ebay_de",
    "ebay_uk",
    "ebay_es",
    "autodoc",
    "rockauto",
]


def _fmt_duration(seconds: float) -> str:
    return str(timedelta(seconds=int(seconds)))


def _print_summary(results: list[dict]) -> None:
    print("\n" + "=" * 64)
    print(f"  {'SOURCE':<20} {'SCRAPED':>8} {'INSERTED':>9} {'ERRORS':>7} {'TIME':>8}")
    print("=" * 64)

    total_scraped = total_inserted = total_errors = 0
    for r in results:
        status = "✓" if r["errors"] == 0 else "⚠"
        print(
            f"  {status} {r['source']:<18} {r['scraped']:>8} "
            f"{r['inserted']:>9} {r['errors']:>7} {r['duration']:>8}"
        )
        total_scraped   += r["scraped"]
        total_inserted  += r["inserted"]
        total_errors    += r["errors"]

    print("=" * 64)
    print(
        f"  {'TOTAL':<20} {total_scraped:>8} {total_inserted:>9} "
        f"{total_errors:>7}"
    )
    print("=" * 64 + "\n")


async def run_source(
    source: str,
    limit: int,
    dry_run: bool,
    uploader: SupabaseUploader | None,
    r2: R2Uploader | None,
) -> dict:
    result = {"source": source, "scraped": 0, "inserted": 0, "errors": 0, "duration": "—"}
    t0 = time.monotonic()

    ScraperClass = SCRAPERS.get(source)
    if not ScraperClass:
        logger.error("unknown_source", source=source)
        result["errors"] = 1
        return result

    print(f"\n[{source}] starting (limit={limit})…")

    try:
        scraper = ScraperClass(limit=limit, dry_run=dry_run)
        listings = await scraper.run()
        result["scraped"] = len(listings)
        print(f"[{source}] scraped {len(listings)} listings")

        if dry_run:
            if listings:
                print(f"[{source}] sample: {listings[0].get('title', '')[:80]}")
        else:
            if listings and uploader:
                # R2 is a no-op when env vars are missing — safe to call
                if r2:
                    for listing in listings:
                        if listing.get("image_urls"):
                            listing["image_urls"] = r2.upload_photos(
                                listing.get("id", listing.get("external_id", "")),
                                listing["image_urls"],
                            )
                total, new = uploader.upsert_listings(listings)
                result["inserted"] = total
                print(f"[{source}] inserted {total} into Supabase")

    except Exception as exc:
        logger.error("source_failed", source=source, error=str(exc))
        result["errors"] = 1
        print(f"[{source}] FAILED: {exc}")

    result["duration"] = _fmt_duration(time.monotonic() - t0)
    return result


async def main_async(sources: list[str], limit: int, dry_run: bool) -> None:
    uploader = None
    r2 = None

    if not dry_run:
        try:
            uploader = SupabaseUploader()
            r2 = R2Uploader()
        except KeyError as e:
            print(f"\nERROR: missing env var {e}. Set SUPABASE_URL + SUPABASE_SERVICE_KEY in .env\n")
            return

    print(f"\n{'='*64}")
    print(f"  TORQUED POC — one-shot scraper")
    print(f"  Sources  : {', '.join(sources)}")
    print(f"  Limit    : {limit} listings/source")
    print(f"  Mode     : {'DRY RUN (no DB insert)' if dry_run else 'LIVE (inserting to Supabase)'}")
    print(f"{'='*64}")

    results = []
    t_start = time.monotonic()

    for source in sources:
        result = await run_source(source, limit, dry_run, uploader, r2)
        results.append(result)

    total_time = _fmt_duration(time.monotonic() - t_start)
    _print_summary(results)
    print(f"  Total time: {total_time}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Torqued POC one-shot scraper")
    parser.add_argument(
        "--sources",
        help=f"Comma-separated sources (default: all 10). Available: {', '.join(SCRAPERS)}",
        default=None,
    )
    parser.add_argument("--limit", type=int, default=100, help="Listings per source (default: 100)")
    parser.add_argument("--dry-run", action="store_true", help="Don't insert into Supabase")
    args = parser.parse_args()

    sources = (
        [s.strip() for s in args.sources.split(",") if s.strip()]
        if args.sources
        else DEFAULT_SOURCES
    )

    unknown = [s for s in sources if s not in SCRAPERS]
    if unknown:
        parser.error(f"Unknown sources: {unknown}. Available: {list(SCRAPERS)}")

    asyncio.run(main_async(sources, args.limit, args.dry_run))


if __name__ == "__main__":
    main()
