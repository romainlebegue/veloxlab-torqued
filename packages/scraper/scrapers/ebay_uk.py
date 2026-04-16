from .ebay_base import EbayBaseScraper


class EbayUKScraper(EbayBaseScraper):
    source         = "ebay_uk"
    EBAY_BASE      = "https://www.ebay.co.uk"
    CURRENCY       = "GBP"
    SELLER_COUNTRY = "UK"
    LOCALE         = "en-GB"
