from .ebay_base import EbayBaseScraper


class EbayESScraper(EbayBaseScraper):
    source         = "ebay_es"
    EBAY_BASE      = "https://www.ebay.es"
    CURRENCY       = "EUR"
    SELLER_COUNTRY = "ES"
    LOCALE         = "es-ES"
