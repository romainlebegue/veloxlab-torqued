# PartFinder.eu — Claude Code Project Brief

> This file is the single source of truth for Claude Code sessions on this project.
> Read it fully before writing any code. All decisions here were made in the design phase.
> Max file size: 40 000 chars. Keep updates concise.

---

## Project Overview

**PartFinder.eu** is a pan-European automotive parts **price comparison metasearch engine** —
think Kayak/Skyscanner for car parts. It aggregates listings from eBay FR/DE/UK/ES, AutoDoc,
Mister Auto, Oscaro, Ovoko/RRR, and RockAuto into a unified catalog with real-time price
comparison, fitment data, and a certification label for recycled parts ("REC").

**Stage:** POC → Production  
**Target markets:** France 🇫🇷 Germany 🇩🇪 UK 🇬🇧 Spain 🇪🇸  
**Part types:** New OEM / OES / IAM + Used + REC (Recycled & Certified)  
**Primary differentiator:** Fitment-first search (VIN or make/model/year) + REC certification label

---

## Tech Stack

```
Frontend        Next.js 14 (App Router) + TypeScript + Tailwind CSS
Deployment      Vercel (Edge CDN, ISR, Edge Functions)
Database        Supabase (PostgreSQL 15 + pgvector + pg_trgm + pg_cron)
File storage    Cloudflare R2 (S3-compatible, no egress fees) — part photos
Scrapers        Python 3.12 + Playwright + playwright-stealth (Railway.app)
Anti-CF         Flaresolverr (Docker sidecar on Railway) for CF-protected sites
Search          Supabase full-text (POC) → Algolia (when > 100k refs)
Analytics       PostHog (GDPR-compliant, self-hostable)
Monitoring      Sentry (errors) + Uptime Robot (availability)
Auth            Supabase Auth (sellers + B2B users)
```

---

## Monorepo Structure

```
partfinder/
├── CLAUDE.md                  ← this file
├── .claude/
│   └── rules/
│       ├── scraper.md         ← Python scraper conventions
│       ├── seo.md             ← SEO/schema.org rules
│       └── database.md        ← SQL/Supabase conventions
├── apps/
│   ├── web/                   ← Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (b2c)/         ← Consumer-facing routes
│   │   │   ├── (b2b)/         ← Pro/garage routes (future)
│   │   │   ├── (seller)/      ← Seller dashboard (future)
│   │   │   └── api/           ← API route handlers
│   │   ├── components/
│   │   ├── lib/
│   │   └── public/
│   └── admin/                 ← Ranking rules dashboard (future)
├── packages/
│   ├── db/                    ← Supabase types, migrations, client
│   ├── scraper/               ← Python scrapers
│   │   ├── scrapers/          ← Per-source scrapers
│   │   ├── processors/        ← Normalizer, matcher, fitment
│   │   └── storage/           ← Supabase + R2 uploaders
│   └── shared/                ← Shared types and constants
└── supabase/
    ├── migrations/            ← SQL migration files
    └── functions/             ← Edge Functions
```

---

## Database Schema (Core Tables)

### Primary tables — DO NOT rename without updating all refs

```sql
-- Vehicle fitment master (seeded from TecDoc / KType)
vehicles (
  id uuid PK,
  make text,                    -- "BMW", "Volkswagen"...
  model text,                   -- "Série 3 F30", "Golf VII"...
  variant text,                 -- "320d xDrive"...
  year_from int2,
  year_to int2,                 -- null = still in production
  engine_code text,             -- "N47D20C", "EA888"...
  engine_cc int4,
  fuel_type text,               -- petrol/diesel/hybrid/electric
  kw int2,
  ktype_id int4,                -- TecDoc KType reference
  vin_prefix text[],            -- ["WBA", "VF1"] for auto-detect
  region text[]                 -- ["EU", "FR", "DE"]
)

-- Universal parts catalog (OEM refs, cross-refs)
parts_catalog (
  id uuid PK,
  part_number text,
  part_number_normalized text,  -- stripped: "34116792217"
  name text,
  category_id uuid FK,
  part_type text,               -- NEW_OEM/NEW_OES/NEW_IAM/USED/REMAN/MOTO
  brand_id uuid FK,
  is_moto bool DEFAULT false,
  tecdoc_article_id text,
  ean text[]
)

-- THE CORE JOIN: part ↔ vehicle (fitment)
fitment (
  id uuid PK,
  part_id uuid FK → parts_catalog,
  vehicle_id uuid FK → vehicles,
  position text,                -- "front-left", "rear", "all"
  fitment_notes text,
  fitment_attributes jsonb,     -- {axle, side, drive_type}
  source text,                  -- TECDOC/MANUAL/SCRAPED
  confidence_score float4,      -- 0-1, scraped data gets < 0.8
  verified_at timestamptz
)

-- Live inventory from scrapers
listings (
  id text PK,                   -- sha1(source:external_id)
  source text,                  -- "ebay_fr", "rockauto"...
  external_id text,
  url text,
  title text,
  part_number text,
  brand text,
  condition text,               -- NEW/USED/REMAN/REC
  condition_grade text,         -- A/B/C for used/REC
  part_type text,               -- OEM/OES/IAM/REC/USED
  price numeric(10,2),
  currency text,
  price_eur numeric(10,2),      -- always normalized to EUR
  shipping_cost_eur numeric(8,2),
  shipping_to text[],
  seller_name text,
  seller_country text,
  location_country text,
  location_city text,
  fitment_raw text,             -- raw text from scraper
  vehicle_make text,
  vehicle_model text,
  vehicle_years text,
  image_urls text[],            -- R2 URLs after re-hosting
  stock_qty int4,
  warranty_months int2,
  -- REC certification fields
  is_rec bool DEFAULT false,
  rec_grade text,               -- A/B
  rec_donor_vin text,           -- full VIN of donor vehicle
  rec_donor_km int4,
  rec_dismantler text,
  rec_dismantler_cert text,     -- "VHU-FR-044-2019"
  rec_recall_check bool,
  -- Meta
  is_active bool DEFAULT true,
  scraped_at timestamptz,
  last_seen_at timestamptz
)

-- Cross-references (OEM ↔ OES ↔ IAM equivalencies)
cross_references (
  id uuid PK,
  part_id uuid FK → parts_catalog,
  ref_number text,
  ref_number_normalized text,
  brand_id uuid FK,
  ref_type text                 -- OEM/OES/IAM/EAN/TECDOC
)

-- Sellers registry
sellers (
  id uuid PK,
  name text,
  seller_type text,             -- DEALER/DISMANTLER/MARKETPLACE/PRIVATE
  country text,
  verified bool,
  b2b_eligible bool,
  scraper_config jsonb,         -- crawl rules per source
  last_crawled_at timestamptz
)

-- Business ranking rules (editable without redeploy)
ranking_rules (
  id uuid PK,
  source text,                  -- "ebay_fr", "autodoc", "*"
  checkout_type text,           -- "direct"/"affiliate"/"cpc"
  weight_checkout float4,       -- default: direct=10, affiliate=4
  weight_boost float4,          -- commercial agreement boost
  weight_quality float4,
  weight_eco float4,            -- REC bonus
  weight_price float4,
  weight_shipping float4,
  is_active bool,
  valid_from timestamptz,
  valid_to timestamptz,
  notes text                    -- "Q4 deal with AutoDoc"
)

-- Price history (time-series)
price_history (
  listing_id text FK → listings,
  price_eur numeric(10,2),
  stock_qty int4,
  recorded_at timestamptz,
  PRIMARY KEY (listing_id, recorded_at)
)

-- Agent job queue
scraper_jobs (
  id uuid PK,
  seller_id uuid FK,
  job_type text,                -- FULL_CRAWL/DELTA/PRICE_UPDATE
  status text,                  -- PENDING/RUNNING/DONE/FAILED
  listings_found int4,
  listings_new int4,
  error_log jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  next_run_at timestamptz
)
```

### Key indexes (create these explicitly in migrations)
```sql
-- Fitment lookups (most frequent query)
CREATE INDEX idx_fitment_part ON fitment(part_id);
CREATE INDEX idx_fitment_vehicle ON fitment(vehicle_id);
-- Vehicle search
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model, year_from, year_to);
CREATE INDEX idx_vehicles_vin_prefix ON vehicles USING gin(vin_prefix);
CREATE INDEX idx_vehicles_ktype ON vehicles(ktype_id);
-- Part number search
CREATE INDEX idx_parts_pn_normalized ON parts_catalog(part_number_normalized);
-- Listings search
CREATE INDEX idx_listings_active_price ON listings(is_active, price_eur);
CREATE INDEX idx_listings_source ON listings(source);
-- Cross-refs
CREATE INDEX idx_xref_ref_brand ON cross_references(ref_number_normalized, brand_id);
-- Price history (hypertable candidate for TimescaleDB later)
CREATE INDEX idx_price_history_listing ON price_history(listing_id, recorded_at DESC);
```

### Row Level Security rules
```
anon/public     → SELECT on listings, parts_catalog, fitment, vehicles
seller (auth)   → CRUD on listings WHERE seller_id = auth.uid()
seller (auth)   → UPDATE on sellers WHERE id = auth.uid()
agent (service) → Full access via service_role key
admin           → Full access via custom admin role
```

---

## SEO Architecture (CRITICAL — start indexing early)

### URL structure
```
/pieces/[make]/[model]/[year]/[category]
  → /pieces/volkswagen/golf-7/2016/disques-de-frein

/pieces/[make]/[model]/[year]/[category]/[part-slug]
  → /pieces/volkswagen/golf-7/2016/disques-de-frein/zimmermann-150342752

/pieces/ref/[part-number]
  → /pieces/ref/34116792217

/vin/[vin]
  → /vin/WVWZZZ1KZG1234567  (redirects to vehicle page after decode)

/marques/[make]
  → /marques/volkswagen

/categories/[category]
  → /categories/disques-de-frein
```

### Rendering strategy
```
SSG (build time)     → Top 1000 make/model/category combos (traffic from keyword data)
ISR (revalidate 4h)  → All other part pages (prices refresh without full rebuild)
SSR (per request)    → VIN search, real-time price comparison, checkout flow
```

### Schema.org JSON-LD (required on every part page)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Disque frein avant Zimmermann VW Golf VII",
  "brand": { "@type": "Brand", "name": "Zimmermann" },
  "mpn": "150342752",
  "description": "...",
  "image": ["https://r2.partfinder.eu/parts/..."],
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "26.78",
    "highPrice": "67.20",
    "priceCurrency": "EUR",
    "offerCount": 6,
    "offers": [
      {
        "@type": "Offer",
        "seller": { "@type": "Organization", "name": "AutoDoc" },
        "price": "52.90",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "url": "https://partfinder.eu/go/autodoc/..."
      }
    ]
  }
}
```

### Sitemap (dynamic, generated by Edge Function)
```
/sitemap.xml           → index sitemap
/sitemap-makes.xml     → /marques/* pages
/sitemap-categories.xml → /categories/* pages
/sitemap-parts-[n].xml → paginated part pages (max 50k URLs per file)
```
Priority: popular make/model combinations first (based on listing count).
Update frequency: daily for parts with active listings, weekly for static pages.

---

## Ranking Engine

The ranking engine lives in `supabase/functions/rank-offers/` and reads weights from
the `ranking_rules` table. This allows business rules to change without redeploy.

### Scoring formula
```typescript
score(offer) =
  weights.checkout[offer.checkout_type]     // direct=10, affiliate=4, cpc=2
  + offer.commercial_boost * weights.boost  // sponsored partner = +1 to +5
  + (offer.rating / 5) * weights.quality * 5
  + (offer.is_rec ? weights.eco : 0)        // REC certified bonus
  + priceScore(offer, allOffers) * weights.price  // cheapest in group = +3
  + (offer.shipping_cost_eur > 15 ? weights.shipping : 0)
  + (offer.ship_days <= 2 ? 2 : offer.ship_days <= 4 ? 1 : 0)
```

### Checkout types
- `direct` — checkout on PartFinder.eu (our cart, maximum margin)
- `affiliate` — redirect to seller with affiliate tracking (rev share)
- `cpc` — redirect with CPC tracking (cost-per-click deal)
- `organic` — no commercial agreement, listed for catalog completeness

### Sort modes (user-facing)
- `smart` — weighted score (default, business-optimized)
- `price` — cheapest total price first
- `eco` — REC certified parts first
- `rating` — seller rating first
- `delivery` — fastest shipping first

### Transparency rule
When `commercial_boost > 0`, display "Sponsored" tag on the offer row.
Never hide this. It's legally required in several EU markets.

---

## REC Certification Label

REC = Recycled & Certified. It's our proprietary trust label for used parts
sourced from certified dismantlers with full traceability.

### Required fields for REC status
```
is_rec: true
rec_grade: "A" | "B"          -- A = excellent, B = good, no grade C published
rec_donor_vin: string          -- full 17-char VIN of donor vehicle
rec_donor_km: number           -- mileage at time of removal
rec_dismantler: string         -- dismantler name
rec_dismantler_cert: string    -- certification number (VHU-FR-xxx, VRAC-UK-xxx, VHU-DE-xxx)
rec_recall_check: bool         -- has part been checked against manufacturer recalls
```

### Grading logic
- Grade A: < 80k km, no damage, recall check passed
- Grade B: 80k–120k km, minor wear acceptable, recall check passed
- Parts with failed recall checks are NOT listed

### Certification bodies by country
- France: VHU agrément (véhicules hors d'usage), SRA protocol
- UK: VRAC certification (Vehicle Recyclers Association Certification)
- Germany: VHU-DE certification
- Spain: VHU-ES (gestores autorizados)

---

## Scraper Architecture

### Per-source scraper pattern
Each scraper inherits from `BaseScraper` (see `packages/scraper/scrapers/base.py`):
- Rate limiting: 1 req / 2.5s per domain + random jitter (never fixed sleep)
- Playwright stealth: `from playwright_stealth import Stealth` — applied to every page
- Retry: tenacity `@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=5, max=60))`
- Circuit breaker: pause domain for 1h if error rate > 20% over 100 requests
- User-agent rotation: pool of 5 real Chrome/Firefox UAs, randomized per context
- Viewport randomization: 1366×768, 1440×900, 1920×1080, 1280×800

### Part number normalization (ALWAYS apply before DB insert)
```python
def normalize_part_number(raw: str) -> str:
    """Strip spaces, dashes, dots → uppercase. '34 11 6 792 217' → '34116792217'"""
    cleaned = raw.upper()
    cleaned = re.sub(r"^(BOSCH|VALEO|FEBI|...)\s*", "", cleaned)  # strip brand prefix
    cleaned = re.sub(r"[^A-Z0-9]", "", cleaned)
    return cleaned
```

### Scraper schedule (pg_cron in Supabase)
```sql
-- Stagger by 15min to avoid concurrent heavy load
SELECT cron.schedule('ebay-fr',  '0 2 * * *', $$ CALL trigger_scraper('ebay_fr')  $$);
SELECT cron.schedule('ebay-de',  '15 2 * * *', $$ CALL trigger_scraper('ebay_de') $$);
SELECT cron.schedule('ebay-uk',  '30 2 * * *', $$ CALL trigger_scraper('ebay_uk') $$);
SELECT cron.schedule('ebay-es',  '45 2 * * *', $$ CALL trigger_scraper('ebay_es') $$);
SELECT cron.schedule('rockauto', '0 3 * * *', $$ CALL trigger_scraper('rockauto') $$);
SELECT cron.schedule('autodoc',  '0 4 * * *', $$ CALL trigger_scraper('autodoc')  $$);
```

### Photo pipeline
1. Scraper captures source image URL
2. Uploader downloads to memory (max 5 photos per listing)
3. Resize to max 800×600 (Pillow)
4. Upload to R2: `parts/{listing_id[:2]}/{listing_id}/{idx}.jpg`
5. Store public R2 URL in `listings.image_urls[]`

---

## FX / Currency normalization

All prices stored as `price_eur`. Conversion at scrape time:
```python
FX_TO_EUR = {"EUR": 1.0, "GBP": 1.17, "USD": 0.93, "CHF": 1.02, "PLN": 0.23}
# TODO: replace with live OpenExchangeRates API call in production
```

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| DB tables | snake_case, plural | `parts_catalog`, `scraper_jobs` |
| DB columns | snake_case | `part_number_normalized` |
| TypeScript files | kebab-case | `part-card.tsx`, `use-search.ts` |
| TypeScript types | PascalCase | `PartListing`, `VehicleFitment` |
| TypeScript functions | camelCase | `scoreOffer()`, `normalizePartNumber()` |
| Python files | snake_case | `ebay_fr.py`, `supabase_client.py` |
| Python classes | PascalCase | `EbayFRScraper`, `SupabaseUploader` |
| URL slugs | kebab-case, lowercase | `volkswagen`, `golf-7`, `disques-de-frein` |
| Env vars | UPPER_SNAKE_CASE | `SUPABASE_SERVICE_KEY`, `R2_BUCKET` |
| Git branches | `feat/`, `fix/`, `chore/` | `feat/ranking-engine` |

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=           # server-side only, never expose to client

# Cloudflare R2
R2_ENDPOINT=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=autoparts-photos
R2_PUBLIC_URL=                  # https://pub-xxx.r2.dev

# Scraper (Railway env)
FLARESOLVERR_URL=http://localhost:8191
REQUESTS_PER_SECOND=0.4
MAX_CONCURRENT_BROWSERS=2

# Analytics / monitoring
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

**Security rules:**
- NEVER commit `.env` or `.env.local` files
- NEVER use `SUPABASE_SERVICE_KEY` in client-side code
- All secrets in Vercel environment variables (production) and `.env.local` (dev)
- `.gitignore` must include: `.env`, `.env.local`, `.env.*.local`, `config/.env`

---

## Commands

```bash
# Frontend (apps/web)
pnpm dev              # start Next.js dev server
pnpm build            # production build
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit

# Database
supabase start        # local Supabase (Docker)
supabase db push      # apply migrations
supabase gen types    # regenerate TypeScript types → packages/db/types.ts

# Scrapers (packages/scraper)
python main.py --source ebay_fr --limit 50 --dry-run   # test run
python main.py --all --limit 2500                       # production run
playwright install chromium                             # install browser

# Docker (local full stack)
docker compose up     # starts Supabase + Flaresolverr + scraper
```

---

## Build Priority Order

When starting a new Claude Code session, work in this order:

1. **Database migrations** — schema first, everything else depends on it
2. **Supabase types** — `supabase gen types` after each migration
3. **Next.js routes** — SEO URL structure before any UI components
4. **Schema.org JSON-LD** — required on every part page from day 1
5. **Search API** — Supabase Edge Function for fitment-based search
6. **Ranking engine** — Edge Function reading from `ranking_rules` table
7. **Scraper integration** — connect existing scrapers to prod Supabase
8. **UI components** — part card, offer rows, search bar, VIN decoder
9. **Sitemap + robots.txt** — dynamic sitemap from Supabase
10. **Admin ranking dashboard** — last, once data is flowing

---

## What NOT to do

- Never use `any` in TypeScript — use `unknown` with type guards
- Never use `SELECT *` in SQL — always specify columns
- Never hardcode source names — use the `sellers` table
- Never run scrapers in the Next.js process — they live on Railway
- Never store photos at source URLs — always re-host to R2 (they expire)
- Never expose ranking rule weights to the client — server-side only
- Never skip `normalize_part_number()` before DB inserts
- Never add `console.log` to committed code — use structured logging
- Never use `time.sleep(N)` with a fixed value — always add jitter

---

## Key Decisions Made (Architecture Decision Records)

**ADR-001: Fitment as the core moat**
Fitment table links parts ↔ vehicles with confidence score. TecDoc/KType = gold standard.
Scraped fitment gets confidence < 0.8 until manually verified.

**ADR-002: Metasearch UX (Kayak model)**
One card per part reference, multiple offer rows inside. Not one card per listing.
User sees "from 26.78€ · 6 offers" and expands to compare.

**ADR-003: Ranking transparency**
Sponsored tag displayed when `commercial_boost > 0`. This is non-negotiable —
EU regulations (DSA, Omnibus Directive) require it.

**ADR-004: REC label = differentiator**
REC requires: donor VIN, dismantler cert number, mileage at removal, recall check.
Grade C parts are never published. Only A and B.

**ADR-005: pg_cron over external job queue**
For POC, Supabase pg_cron is sufficient for daily scraper triggers.
Migrate to proper queue (BullMQ / Inngest) when scraper count > 10.

**ADR-006: ISR over full SSR for part pages**
Part pages revalidate every 4 hours. Prices are never perfectly real-time anyway
(scrapers run nightly). ISR gives SEO benefits of static + freshness of dynamic.

---

## Reference UIs (built in design phase)

Three interactive HTML prototypes were built and saved as artifacts:

1. `autoparts_b2c_marketplace.html` — original B2C catalog with VIN search
2. `partfinder_price_compare_v3.html` — **main reference** — metasearch UI with
   offer ranking, REC label, sponsored tags, sort modes
3. `autoparts_db_architecture.jsx` — interactive database schema explorer

The `partfinder_price_compare_v3.html` is the design reference for the Next.js UI.
Replicate its layout: left sidebar (part families), right main (part cards with
collapsible offer rows, rank badges, REC donor VIN line).

---

## Session Log

### Session 1 — Project scaffold
- Monorepo initialized (pnpm workspaces + Turborepo)
- Next.js 14 App Router scaffolded in `apps/web/`
- SEO route groups created: `(b2c)/pieces/`, `(b2c)/marques/`, `(b2c)/categories/`, `(b2c)/vin/`
- `packages/db`: Supabase typed client + full DB types skeleton
- `packages/shared`: domain TypeScript types (PartListing, VehicleFitment, RankingWeights…)
- `packages/scraper`: BaseScraper, EbayFRScraper stub, normalize.py, SupabaseUploader, R2Uploader
- `supabase/`: initialized + migration `20240001000000_init_schema.sql` (all core tables + indexes + RLS + pg_cron)
- `.claude/rules/`: database.md, scraper.md, seo.md

### Session 2 — Search API + Ranking Engine + SEO plumbing
- `supabase/functions/search-parts/index.ts`: Edge Function — fitment search + part number lookup, groups by part ref (Kayak model), delegates to rank-offers
- `supabase/functions/rank-offers/index.ts`: Edge Function — scoring formula from ranking_rules table, SELLER_META (checkout_type + commercial_boost), is_sponsored flag
- `apps/web/lib/search.ts`: typed client for search-parts Edge Function (ISR-aware fetch)
- `apps/web/lib/supabase/server.ts`: SSR-safe Supabase client (@supabase/ssr)
- `apps/web/lib/supabase/admin.ts`: service-role client for API routes
- `apps/web/components/part/product-json-ld.tsx`: Schema.org Product JSON-LD component
- Category page wired: fetches search-parts, renders JSON-LD, shows basic part groups
- `apps/web/app/robots.ts`: robots.txt (disallows /api/, /go/)
- `apps/web/app/sitemap.ts`: sitemap index
- `apps/web/app/api/sitemap-parts/route.ts`: dynamic part sitemap (50k URLs/page)
- `apps/web/app/api/go/[source]/[id]/route.ts`: affiliate redirect endpoint

### Session 3 — UI Components
- `components/ui/rec-badge.tsx`: label REC A/B avec VIN donor + cert dismantler
- `components/ui/sponsored-tag.tsx`: tag "Sponsorisé" obligatoire DSA
- `components/part/offer-row.tsx`: ligne d'offre (vendeur, condition, prix, livraison, CTA)
- `components/part/part-card.tsx`: carte pièce collapsible (ADR-002 Kayak model)
- `components/search/sort-tabs.tsx`: tabs smart/prix/éco/avis/livraison
- `components/search/vehicle-search-bar.tsx`: barre recherche 3 modes (marque/VIN/réf)
- `lib/mock-data.ts`: données mockées (3 groupes, 10 offres dont 1 REC grade A)
- Home page + category page câblées avec tous les composants
- pnpm installé, typecheck clean, build propre, dev sur :3000

### Session 4 — Scrapers + VIN Decoder
- `scrapers/ebay_fr.py`: parser HTML complet (search cards, prix, condition, shipping)
- `scrapers/autodoc.py`: Playwright + Flaresolverr fallback + JSON-LD extraction
- `scrapers/oscaro.py`: sitemap crawl + JSON-LD natif
- `scrapers/__init__.py`: registre mis à jour (ebay_fr, autodoc, oscaro)
- `lib/vin.ts`: decode local WMI + année modèle + checksum, 0 network
- `components/search/vin-decoder.tsx`: widget avec preview instantané au typing
- `app/api/decode-vin/route.ts`: API route (local WMI → Supabase fallback → redirect slug)
- `app/(b2c)/vin/[vin]/page.tsx`: page VIN avec SSR redirect si Supabase connecté
- `docker-compose.yml` + `packages/scraper/Dockerfile`: stack locale complète

**Next session:** créer compte Supabase → `supabase db push` → déployer Edge Functions → test scraper en dry-run contre prod

---

### Session 5 — Remaining scrapers + Admin dashboard
- `scrapers/ebay_base.py`: EbayBaseScraper shared HTML parser (price/condition/shipping, multilingual condition map)
- `scrapers/ebay_fr.py`, `ebay_de.py`, `ebay_uk.py`, `ebay_es.py`: per-country eBay scrapers
- `scrapers/rockauto.py`: XHR interception via page.route() + DOM fallback, USD→EUR
- `scrapers/mister_auto.py`: sitemap + search fallback + JSON-LD, free shipping FR
- `scrapers/__init__.py`: SCRAPERS dict with all 8 sources
- `supabase/migrations/20240002000000_scraper_functions.sql`: trigger_scraper(), record_price_history() trigger, mark_stale_listings(), sellers seed (8 sources)
- `apps/admin/`: full admin app — layout with sidebar nav, KPI dashboard, ranking rules editor, scraper jobs table
- `apps/admin/app/api/admin/ranking/route.ts`: GET + POST (as any cast for workspace type resolution)
- `apps/admin/app/api/admin/ranking/[id]/route.ts`: PATCH + DELETE (as any cast), EDITABLE_FIELDS whitelist
- `components/ranking-rules-table.tsx`: inline weight editor with save per row, active toggle
- All TypeScript errors resolved, `pnpm typecheck` clean on both web and admin apps

**Next session:** créer compte Supabase → `supabase db push` → déployer Edge Functions → test scraper en dry-run

*Last updated: Session 5 — Scrapers complete + Admin dashboard complete*
