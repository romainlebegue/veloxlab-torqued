"""
Scraper entrypoint.
Usage:
  python main.py --source ebay_fr --limit 50 --dry-run
  python main.py --all --limit 2500
"""

import argparse
import asyncio
import os

import structlog
from dotenv import load_dotenv

from scrapers import SCRAPERS
from storage.supabase_uploader import SupabaseUploader
from storage.r2_uploader import R2Uploader

load_dotenv()
logger = structlog.get_logger()


async def run_scraper(source: str, limit: int, dry_run: bool) -> None:
    ScraperClass = SCRAPERS.get(source)
    if not ScraperClass:
        raise ValueError(f"Unknown source: {source}. Available: {list(SCRAPERS)}")

    scraper = ScraperClass(limit=limit, dry_run=dry_run)
    listings = await scraper.run()

    if dry_run:
        logger.info("dry_run_result", count=len(listings), sample=listings[:2])
        return

    uploader = SupabaseUploader()
    r2 = R2Uploader()

    for listing in listings:
        if listing.get("image_urls"):
            listing["image_urls"] = r2.upload_photos(
                listing["id"], listing["image_urls"]
            )

    total, new = uploader.upsert_listings(listings)
    logger.info("upload_complete", source=source, total=total, new=new)


def main() -> None:
    parser = argparse.ArgumentParser(description="PartFinder scraper")
    parser.add_argument("--source", help="Source name (e.g. ebay_fr)")
    parser.add_argument("--all", action="store_true", help="Run all scrapers")
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.all:
        sources = list(SCRAPERS.keys())
    elif args.source:
        sources = [args.source]
    else:
        env_sources = os.environ.get("SCRAPER_SOURCES", "")
        sources = [s.strip() for s in env_sources.split(",") if s.strip()]
    if not sources:
        parser.error("Provide --source, --all, or set SCRAPER_SOURCES env var")

    for source in sources:
        asyncio.run(run_scraper(source, args.limit, args.dry_run))


if __name__ == "__main__":
    main()
