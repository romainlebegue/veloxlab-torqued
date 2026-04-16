"""
Part number and data normalization utilities.
Apply normalize_part_number() to ALL part numbers before DB insert.
"""

import re

# FX rates (replace with OpenExchangeRates API call in production)
FX_TO_EUR: dict[str, float] = {
    "EUR": 1.0,
    "GBP": 1.17,
    "USD": 0.93,
    "CHF": 1.02,
    "PLN": 0.23,
}

# Known brand prefixes to strip (extend as needed)
_BRAND_PREFIXES = re.compile(
    r"^(BOSCH|VALEO|FEBI|BREMBO|ZIMMERMANN|SACHS|HELLA|DELPHI|"
    r"BILSTEIN|MONROE|GABRIEL|NGK|DENSO|MANN|MAHLE|SKF|FAG|INA)\s*",
    re.IGNORECASE,
)


def normalize_part_number(raw: str) -> str:
    """
    Strip spaces, dashes, dots → uppercase.
    '34 11 6 792 217' → '34116792217'
    Always call this before inserting into parts_catalog or cross_references.
    """
    cleaned = raw.upper().strip()
    cleaned = _BRAND_PREFIXES.sub("", cleaned)
    cleaned = re.sub(r"[^A-Z0-9]", "", cleaned)
    return cleaned


def to_eur(price: float, currency: str) -> float:
    """Convert price to EUR using hardcoded rates. Replace with live API in prod."""
    rate = FX_TO_EUR.get(currency.upper(), 1.0)
    return round(price * rate, 2)


def slugify(text: str) -> str:
    """Convert text to URL-safe kebab-case slug."""
    text = text.lower().strip()
    text = re.sub(r"[àáâãäå]", "a", text)
    text = re.sub(r"[èéêë]", "e", text)
    text = re.sub(r"[ìíîï]", "i", text)
    text = re.sub(r"[òóôõöø]", "o", text)
    text = re.sub(r"[ùúûü]", "u", text)
    text = re.sub(r"[ç]", "c", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")
