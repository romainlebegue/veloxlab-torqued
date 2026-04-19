# SEO / Schema.org conventions

## URL structure (exact — do not deviate)
```
/pieces/[make]/[model]/[year]/[category]        ← ISR, revalidate 4h
/pieces/[make]/[model]/[year]/[category]/[slug] ← ISR, revalidate 4h
/pieces/ref/[part-number]                       ← ISR, revalidate 4h
/vin/[vin]                                      ← SSR (real-time decode)
/marques/[make]                                 ← ISR or SSG
/categories/[category]                          ← ISR or SSG
```

## Rendering strategy
- `export const revalidate = 14400` on all ISR part pages (4h)
- SSG (`generateStaticParams`) for top-1000 make/model/category combos only
- SSR (no revalidate, no cache) for VIN search and checkout flow
- Never use `force-dynamic` on part listing pages — ISR is required for SEO

## Schema.org JSON-LD (required on every part page)
Every `/pieces/...` page must include:
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "brand": { "@type": "Brand", "name": "..." },
  "mpn": "...",          // normalized part number
  "description": "...",
  "image": [...],        // R2 URLs
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

## Metadata
- Every page needs `generateMetadata()` returning `title`, `description`, `alternates.canonical`
- Title format: `{part} {make} {model} {year} | PartFinder.eu`
- Description: always mention price comparison + condition types

## Sitemap
- `/sitemap.xml` → index sitemap
- `/sitemap-makes.xml`, `/sitemap-categories.xml`, `/sitemap-parts-[n].xml`
- Max 50k URLs per sitemap file
- Update frequency: daily for active listings, weekly for static pages
- Priority: popular make/model combos first (by listing count)

## URL slugs
- Always kebab-case, lowercase
- Accented chars → ASCII equivalent (é→e, ü→u)
- Use `slugify()` from `packages/scraper/processors/normalize.py`

## Robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /go/          ← affiliate redirect URLs
Sitemap: https://partfinder.eu/sitemap.xml
```
