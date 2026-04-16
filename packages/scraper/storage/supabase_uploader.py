"""
SupabaseUploader — upserts normalized listings into Supabase.
Uses service_role key via environment variable.
"""

import hashlib
import os
from datetime import datetime, timezone

import structlog
from supabase import create_client, Client

logger = structlog.get_logger()


def _listing_id(source: str, external_id: str) -> str:
    """sha1(source:external_id) — matches DB primary key convention."""
    return hashlib.sha1(f"{source}:{external_id}".encode()).hexdigest()


class SupabaseUploader:
    def __init__(self) -> None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        self._client: Client = create_client(url, key)

    def upsert_listings(self, listings: list[dict]) -> tuple[int, int]:
        """
        Upsert listings into DB. Returns (total, new_count).
        """
        now = datetime.now(timezone.utc).isoformat()
        rows = []
        for raw in listings:
            listing_id = _listing_id(raw["source"], raw["external_id"])
            row = {**raw, "id": listing_id, "last_seen_at": now}
            if "scraped_at" not in row:
                row["scraped_at"] = now
            rows.append(row)

        if not rows:
            return 0, 0

        result = (
            self._client.table("listings")
            .upsert(rows, on_conflict="id", returning="minimal")
            .execute()
        )

        logger.info("upsert_complete", count=len(rows))
        return len(rows), len(rows)  # TODO: track actual new vs updated
