"""
R2Uploader — downloads part photos and re-hosts them on Cloudflare R2.
Photos at source URLs expire; we must own the copies.
"""

import io
import os
from pathlib import PurePosixPath

import boto3
import httpx
import structlog
from PIL import Image

logger = structlog.get_logger()

MAX_PHOTOS = 5
MAX_WIDTH = 800
MAX_HEIGHT = 600


class R2Uploader:
    def __init__(self) -> None:
        self._bucket = os.environ["R2_BUCKET"]
        self._public_url = os.environ["R2_PUBLIC_URL"].rstrip("/")
        self._s3 = boto3.client(
            "s3",
            endpoint_url=os.environ["R2_ENDPOINT"],
            aws_access_key_id=os.environ["R2_ACCESS_KEY"],
            aws_secret_access_key=os.environ["R2_SECRET_KEY"],
        )

    def upload_photos(self, listing_id: str, source_urls: list[str]) -> list[str]:
        """
        Download up to MAX_PHOTOS images, resize, upload to R2.
        Returns list of public R2 URLs.
        Path pattern: parts/{listing_id[:2]}/{listing_id}/{idx}.jpg
        """
        public_urls: list[str] = []

        for idx, url in enumerate(source_urls[:MAX_PHOTOS]):
            try:
                image_bytes = self._download(url)
                resized = self._resize(image_bytes)
                key = f"parts/{listing_id[:2]}/{listing_id}/{idx}.jpg"
                self._s3.put_object(
                    Bucket=self._bucket,
                    Key=key,
                    Body=resized,
                    ContentType="image/jpeg",
                )
                public_urls.append(f"{self._public_url}/{key}")
            except Exception as exc:
                logger.warning("photo_upload_failed", url=url, error=str(exc))

        return public_urls

    def _download(self, url: str) -> bytes:
        with httpx.Client(timeout=10) as client:
            resp = client.get(url)
            resp.raise_for_status()
            return resp.content

    def _resize(self, data: bytes) -> bytes:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85, optimize=True)
        return buf.getvalue()
