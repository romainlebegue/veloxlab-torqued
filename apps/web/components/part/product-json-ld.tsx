import type { RankedOffer } from "@/lib/search";

interface ProductJsonLdProps {
  name: string;
  brandName: string | null;
  partNumber: string;
  description: string;
  imageUrls: string[];
  offers: RankedOffer[];
  canonicalUrl: string;
}

/**
 * Schema.org Product JSON-LD — required on every part page.
 * See .claude/rules/seo.md for canonical format.
 */
export function ProductJsonLd({
  name,
  brandName,
  partNumber,
  description,
  imageUrls,
  offers,
  canonicalUrl,
}: ProductJsonLdProps) {
  const activeOffers = offers.filter((o) => o.stock_qty !== 0);
  const prices = activeOffers.map((o) => o.price_eur).sort((a, b) => a - b);
  const lowPrice = prices[0] ?? 0;
  const highPrice = prices[prices.length - 1] ?? 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(brandName && { brand: { "@type": "Brand", name: brandName } }),
    mpn: partNumber,
    description,
    ...(imageUrls.length > 0 && { image: imageUrls }),
    url: `https://torqued.veloxlab.co${canonicalUrl}`,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: lowPrice.toFixed(2),
      highPrice: highPrice.toFixed(2),
      priceCurrency: "EUR",
      offerCount: activeOffers.length,
      offers: activeOffers.map((o) => ({
        "@type": "Offer",
        seller: {
          "@type": "Organization",
          name: o.seller_name ?? o.source,
        },
        price: o.price_eur.toFixed(2),
        priceCurrency: "EUR",
        availability:
          (o.stock_qty ?? 1) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url: `https://torqued.veloxlab.co/go/${o.source}/${o.id}`,
        ...(o.warranty_months && {
          warranty: {
            "@type": "WarrantyPromise",
            durationOfWarranty: {
              "@type": "QuantitativeValue",
              value: o.warranty_months,
              unitCode: "MON",
            },
          },
        }),
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
