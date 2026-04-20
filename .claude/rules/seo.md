# SEO / Schema.org conventions

> **Prototype (current):** robots `noindex, nofollow` everywhere. SEO work is deferred per `docs/04_TORQUED_PROTOTYPE_BRIEF.md §2` ("full SEO out of scope"). The rules below describe the **target URL + metadata architecture** we build toward at MVP Alpha, so the prototype's route shapes align with it from day one.
>
> Authoritative spec: `docs/03_TORQUED_MVP_BRIEF.md §7.1` + `§7.3`.

## URL structure (target, per MVP brief §7.1)
```
/                                        ← homepage (plate/VIN/ref search)
/[locale]/recherche?plaque=…             ← plate search results
/[locale]/recherche?vin=…                ← VIN search results
/[locale]/recherche?q=…                  ← free text / OE search
/[locale]/vehicule/[slug]                ← vehicle hub (pivot SEO)
/[locale]/vehicule/[slug]/[category]     ← vehicle × category pivot
/[locale]/piece/[slug]                   ← canonical part page
/[locale]/annonce/[id]                   ← specific listing
/checkout/click/[listing_id]             ← affiliate redirect (tracked)
```

At prototype, `[locale]` is always `fr`. i18n middleware is in place; only FR strings populated.

## Rendering strategy (target)
- SSR for all public pages (Next.js App Router).
- Vehicle hubs + part pages can be ISR at MVP. At prototype, plain SSR is fine.
- No search-results page is indexed (follow Autodoc pattern: crawl parts + vehicles, not queries).
- Never `force-dynamic` on part pages once SEO is on.

## Schema.org JSON-LD (required on every part page at MVP — not at proto)
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "brand": { "@type": "Brand", "name": "..." },
  "mpn": "...",          // normalized OE number
  "description": "...",
  "image": [...],
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "...",
    "highPrice": "...",
    "priceCurrency": "EUR",
    "offerCount": N,
    "offers": [{ "@type": "Offer", ... }]
  }
})}
</script>
```
Also `Vehicle`, `BreadcrumbList`, `Offer`, OG + Twitter cards at MVP.

## Metadata (target)
- Every public page has `generateMetadata()` returning `title`, `description`, `alternates.canonical`.
- Title format: `{part} {make} {model} {year} | Torqued` (or equivalent per page type).
- Description mentions price comparison + condition coverage.
- `hreflang` tags land when the 2nd language ships. Keep `<html lang="fr">` until then.

## Sitemap (target)
- `/sitemap.xml` → index.
- `/sitemap-makes.xml`, `/sitemap-categories.xml`, `/sitemap-parts-[n].xml` (≤ 50k URLs per file).
- Priority: popular make/model combos first, by listing count.

## URL slugs
- Always kebab-case, lowercase.
- Accented chars → ASCII (é→e, ü→u, ç→c).
- Slugify helper — TODO at MVP Alpha, `packages/shared` is the natural home.

## Robots (target production)
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /checkout/click/
Sitemap: https://torqued.eu/sitemap.xml
```

**Current prototype robots:** blanket `noindex, nofollow` (set in `apps/web/app/layout.tsx` `metadata.robots`). Flip to the above when SEO is activated.
