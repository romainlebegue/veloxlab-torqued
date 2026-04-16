from .ebay_base import EbayBaseScraper


class EbayDEScraper(EbayBaseScraper):
    source         = "ebay_de"
    EBAY_BASE      = "https://www.ebay.de"
    CURRENCY       = "EUR"
    SELLER_COUNTRY = "DE"
    LOCALE         = "de-DE"
