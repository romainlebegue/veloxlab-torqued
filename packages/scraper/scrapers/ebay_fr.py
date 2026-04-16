from .ebay_base import EbayBaseScraper


class EbayFRScraper(EbayBaseScraper):
    source         = "ebay_fr"
    EBAY_BASE      = "https://www.ebay.fr"
    CURRENCY       = "EUR"
    SELLER_COUNTRY = "FR"
    LOCALE         = "fr-FR"
