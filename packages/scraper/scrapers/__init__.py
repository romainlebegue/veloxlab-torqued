from .ebay_fr import EbayFRScraper
from .ebay_de import EbayDEScraper
from .ebay_uk import EbayUKScraper
from .ebay_es import EbayESScraper
from .autodoc import AutoDocScraper
from .oscaro import OscaroScraper
from .rockauto import RockAutoScraper
from .mister_auto import MisterAutoScraper
from .ovoko import OvokoScraper
from .kfzteile24 import Kfzteile24Scraper

SCRAPERS: dict[str, type] = {
    "ebay_fr":     EbayFRScraper,
    "ebay_de":     EbayDEScraper,
    "ebay_uk":     EbayUKScraper,
    "ebay_es":     EbayESScraper,
    "autodoc":     AutoDocScraper,
    "oscaro":      OscaroScraper,
    "rockauto":    RockAutoScraper,
    "mister_auto": MisterAutoScraper,
    "ovoko":       OvokoScraper,
    "kfzteile24":  Kfzteile24Scraper,
}
