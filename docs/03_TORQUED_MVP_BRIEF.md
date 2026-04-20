# TORQUED — MVP Build Brief for Claude Code

> **Purpose** : Actionable technical and product brief to drive implementation — Seller Tool (Phase 0) + Dropship Marketplaces (Phase 1) + D2C front (Phase 3/M12)
> **Target** : Claude Code — this document is your master build reference
> **Reference** : `01_TORQUED_VISION.md` (full vision), `02_TORQUED_ROADMAP.md` (phased plan), `04_TORQUED_PROTOTYPE_BRIEF.md` (prototype spec)
> **Phasing** :
> - Phase 0 (M0→M2) — Seller Tool deployed: enrichment, bulk import, photo AI, fitment engine
> - Phase 1 (M2→M6) — Dropship live on Amazon EU + Allegro under TORQUED name
> - Phase 2 (M6→M12) — Scale dropship + prep D2C front
> - Phase 3 (M12+) — Front D2C TORQUED public launch

---

## 0. Context for Claude Code

You are building **TORQUED**, a European automotive parts marketplace. This document covers **MVP Alpha only** — the first shippable version. The full vision, which your architecture must support without refactoring, is in `01_TORQUED_VISION.md`.

**Three rules that govern everything:**

1. **Build for the vision, activate for the MVP.** Every database schema, every API contract, every engine interface must be designed to support the full V3 product. At MVP, many columns will be null, many rule engines will have trivial rulesets, many UIs will be behind feature flags. Do not ever simplify the data model to "match the MVP scope" — you will pay for it in refactoring.

2. **Zero scraping in production.** All data flows are contractual: eBay API, direct seller imports, TecAlliance open datasets. If something cannot be built without scraping, it waits.

3. **Fitment is the product.** If fitment is wrong, the product is dead. Every decision that affects fitment accuracy (data sources, confidence scoring, human review routing) is a first-order decision.

---

## 1. Phase 0 + Phase 1 — What We Are Building First

### 1.1 Headline

**Phase 0 (M0→M2) — Seller Tool**
An enrichment and listing tool for professional sellers. Sellers connect via eBay OAuth, import their full inventory, see fitment enrichment applied automatically (photo AI + OE cross-reference), and manage their catalogue. The seller tool is already in progress. The backend data layer (TecDoc + other sources) is treated as an acquired asset — not detailed here.

**Phase 1 (M2→M6) — Dropship Marketplaces**
TORQUED acts as dropshipper on behalf of sellers, under the TORQUED name, on Amazon Auto EU and Allegro first (then Bol.com, Kaufland, Cdiscount, eMAG progressively). The seller's stock is distributed to these partner marketplaces without the seller needing to manage separate accounts. TORQUED collects commission on GMV. No public-facing TORQUED website yet.

**Phase 3 (M12) — D2C Front Launch**
The public TORQUED marketplace opens. Plate FR + VIN + fitment-filtered results + multi-condition comparator. Built on the catalogue already enriched and validated through 12 months of dropship operations.

### 1.2 What ships in Phase 0 (M0→M2)

- Seller onboarding via eBay OAuth (import initial + sync)
- Native bulk import (CSV/XML)
- Photo AI: OCR OE numbers + part type classification
- Fitment engine L1 (auto-validated from ePID + OE cross-ref)
- Seller dashboard: listings, fitment status, scoring A/B/C/D
- Backoffice: fitment review queue, seller management

### 1.3 What ships in Phase 1 (M2→M6)

- Catalogue feed generation for Amazon Auto EU (ASIN mapping + ACES-compatible attributes)
- Catalogue feed generation for Allegro (category mapping + fitment attributes)
- Order management: TORQUED receives marketplace orders, routes to seller for fulfillment
- Commission tracking per marketplace channel
- Seller dashboard extended: marketplace orders, performance per channel

### 1.4 What ships at Phase 3 (M12)

- Public D2C website (FR first): plate + VIN + results + comparator + buyer account
- SEO infrastructure (pivot pages, sitemap, structured data)
- Affiliate tracking + MoR checkout (scoped)
- 4 languages infrastructure (FR complete, EN/DE/PL in progress)

### 1.5 What the architecture supports from day one (never needs refactoring)

- D2C public front — deferred to Phase 3 (M12); architecture and schema fully ready
- MoR checkout — schemas and API contracts ready, activated at Phase 3
- B2B PRO tool — tables modeled, routes not exposed until V2
- Languages beyond French — i18n infrastructure live, only FR strings populated at Phase 0
- Plate search — deferred to Phase 3 (M12 D2C launch)
- DMS connectors beyond eBay — connector interface defined, implementations phased from M9
- Photo AI part-type classification — OCR active in Phase 0, custom model Phase 1+
- Community validation (L4) and AI validation (L2) — schemas present, workflows activated from Phase 3
- Amazon / Allegro order management UI — built in Phase 1, not in Phase 0 seller tool

---

## 2. Architecture

### 2.1 Stack choices (proposed; confirm or amend)

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions) — primary choice given your Supabase-first preference
- **Search:** Postgres full-text search at MVP; migrate to a dedicated search engine (Meilisearch or Typesense) at V1 when catalog exceeds ~500k listings
- **Media storage:** Supabase Storage (migrate to CDN-fronted object storage at V1)
- **Payments (infrastructure-ready, not active at MVP):** Stripe Connect
- **Background jobs:** Supabase Edge Functions + pg_cron for scheduled tasks; Trigger.dev or Inngest if more orchestration is needed
- **AI infrastructure:** Anthropic API (Claude) for OCR, content generation, fitment disambiguation
- **Analytics:** PostHog (self-hostable, GDPR-compliant)
- **Monitoring & errors:** Sentry
- **Email:** Resend (transactional) — infrastructure, not marketing
- **Deployment:** Vercel (frontend) + Supabase (backend)
- **Repo:** monorepo with Turborepo (packages: `web`, `backoffice`, `workers`, `shared`)

### 2.2 High-level architecture diagram

```
         ┌─────────────────────────────────────┐
         │  torqued.fr (Next.js, Vercel)       │
         │  - Public B2C site                  │
         │  - Seller dashboard (auth-gated)    │
         │  - Backoffice (admin-gated)         │
         └────────────────┬────────────────────┘
                          │
               ┌──────────▼──────────┐
               │   Supabase API      │
               │   (REST + RPC)      │
               └──────────┬──────────┘
                          │
    ┌──────────┬──────────┼──────────┬──────────┐
    ▼          ▼          ▼          ▼          ▼
 Postgres   Storage    Auth       Edge Fn    pg_cron
  (data)   (media)  (sellers+   (workers)  (scheduler)
                     admin)
                          │
                          ▼
               ┌───────────────────────┐
               │ External integrations │
               │ - eBay API            │
               │ - Anthropic API       │
               │ - Stripe Connect (off)│
               │ - Plate SIV partner   │
               │ - VIN decoders        │
               └───────────────────────┘
```

### 2.3 Monorepo structure

```
torqued/
├── apps/
│   ├── web/              # Public B2C site + seller dashboard (Next.js)
│   └── backoffice/       # Admin panel (Next.js, separate auth boundary)
├── packages/
│   ├── db/               # Supabase types, migrations, seed scripts
│   ├── shared/           # Shared domain types, utilities
│   ├── fitment/          # Fitment engine (domain logic, testable in isolation)
│   ├── connectors/       # eBay connector, future DMS connectors
│   ├── ai/               # Anthropic API wrappers, prompt templates
│   └── ui/               # Shared UI components (shadcn-based)
├── workers/              # Supabase Edge Functions
├── supabase/             # Migrations, seed, config
└── docs/                 # Vision, roadmap, this brief
```

---

## 3. Data Model — Core Schemas

These are the **canonical tables** for MVP Alpha. Columns marked `[vision]` are present but not populated at MVP. Migrations should create these tables from day one.

### 3.1 `vehicles`

Canonical vehicle identification across makes, models, engines, technical types.

```sql
CREATE TYPE vehicle_type AS ENUM (
    'car',
    'light_commercial',
    'motorcycle',
    'truck',
    'boat',
    'agricultural',
    'other'
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Category discriminant — critical for multi-stream architecture
    vehicle_type vehicle_type NOT NULL DEFAULT 'car',
    -- Identification
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    engine_code TEXT,
    engine_cc INTEGER,
    engine_kw INTEGER,
    engine_hp INTEGER,
    fuel_type TEXT CHECK (fuel_type IN ('petrol','diesel','hybrid','electric','lpg','cng','other')),
    body_type TEXT,
    -- Period
    year_from SMALLINT,
    year_to SMALLINT,
    -- Technical identifiers
    ktype_nr INTEGER,                  -- TecDoc KType identifier
    manufacturer_code TEXT,
    -- Display
    slug TEXT UNIQUE NOT NULL,         -- SEO-friendly, e.g. "peugeot-308-ii-1-6-hdi-92"
    display_name TEXT,                 -- Human-readable
    -- Geo relevance
    primary_markets TEXT[] DEFAULT ARRAY['fr','de','uk','pl'],
    -- Metadata
    data_source TEXT,                  -- 'tecalliance', 'manual', 'ebay_import'
    confidence NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_ktype ON vehicles(ktype_nr);
CREATE INDEX idx_vehicles_slug ON vehicles(slug);
```

### 3.2 `parts`

Canonical parts catalog — unique part references independent of listings.

```sql
CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- References
    oe_numbers TEXT[] DEFAULT '{}',    -- All known OE equivalents
    iam_numbers TEXT[] DEFAULT '{}',   -- IAM brand references (Bosch, Febi, etc.)
    -- Classification
    category_id UUID REFERENCES categories(id),
    subcategory TEXT,
    -- Attributes
    display_name TEXT NOT NULL,
    display_name_i18n JSONB DEFAULT '{}'::jsonb,  -- {fr: "...", en: "...", de: "..."}
    technical_attributes JSONB DEFAULT '{}'::jsonb, -- flexible: dimensions, materials, specs
    -- Media
    primary_image_url TEXT,
    -- SEO
    slug TEXT UNIQUE NOT NULL,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parts_oe ON parts USING GIN (oe_numbers);
CREATE INDEX idx_parts_iam ON parts USING GIN (iam_numbers);
CREATE INDEX idx_parts_category ON parts(category_id);
```

### 3.3 `categories`

Taxonomy for parts (hierarchical).

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_i18n JSONB DEFAULT '{}'::jsonb,
    depth SMALLINT NOT NULL DEFAULT 0,
    path TEXT[], -- ['brakes', 'brake-discs'] for efficient subtree queries
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 `fitment_edges`

The heart of the product — links parts to vehicles with confidence scoring and source tracking.

```sql
CREATE TYPE fitment_source AS ENUM (
    'tecdoc_direct',      -- Official TecAlliance data (if accessed)
    'ebay_epid',          -- Imported ePID from eBay listings
    'oe_cross_reference', -- Derived from OE number expansion
    'ai_photo_inference', -- Photo AI analysis
    'human_validated',    -- Reviewed by internal team
    'seller_declared',    -- Seller's own attestation
    'community_reported'  -- Buyer confirmation post-purchase
);

CREATE TYPE governance_level AS ENUM (
    'L1_auto',
    'L2_ai',
    'L3_human',
    'L4_community'
);

CREATE TABLE fitment_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    source fitment_source NOT NULL,
    governance_level governance_level NOT NULL,
    confidence NUMERIC(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    evidence JSONB DEFAULT '{}'::jsonb, -- references to supporting data
    validated_by UUID REFERENCES users(id), -- if L3 or L4
    validated_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (part_id, vehicle_id, source)
);

CREATE INDEX idx_fitment_part ON fitment_edges(part_id) WHERE active = TRUE;
CREATE INDEX idx_fitment_vehicle ON fitment_edges(vehicle_id) WHERE active = TRUE;
CREATE INDEX idx_fitment_confidence ON fitment_edges(confidence) WHERE active = TRUE;
```

**Key design decisions:**
- A single `(part, vehicle)` pair can have multiple edges — one per source. The **aggregated confidence** for surfacing is a computed view or function.
- `evidence` is flexible JSON: for `ebay_epid` it stores the source listing ID; for `ai_photo_inference` it stores the AI response and input photo refs; for `human_validated` it stores reviewer notes.

### 3.5 `sellers`

```sql
CREATE TYPE seller_tier AS ENUM ('A', 'B', 'C', 'D', 'unranked');
CREATE TYPE seller_status AS ENUM ('pending', 'active', 'suspended', 'archived');

CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id),
    display_name TEXT NOT NULL,
    legal_name TEXT,
    country_code TEXT NOT NULL,
    vat_number TEXT,
    -- Scoring
    tier seller_tier DEFAULT 'unranked',
    fitment_accuracy_rate NUMERIC(4,3),
    return_rate NUMERIC(4,3),
    response_time_hours NUMERIC(6,2),
    transaction_count INTEGER DEFAULT 0,
    -- MoR eligibility [vision — inactive at MVP]
    mor_eligible BOOLEAN DEFAULT FALSE,
    mor_activated_at TIMESTAMPTZ,
    -- Status
    status seller_status DEFAULT 'pending',
    onboarded_at TIMESTAMPTZ,
    -- Connections
    ebay_connected BOOLEAN DEFAULT FALSE,
    ebay_user_id TEXT,
    ebay_connection_meta JSONB,
    linnworks_connected BOOLEAN DEFAULT FALSE, -- [vision]
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.6 `listings`

A listing is a concrete offer from a seller tied to a part.

```sql
CREATE TYPE part_condition AS ENUM (
    'new_oe',        -- OE original equipment
    'new_oes',       -- OES — same manufacturer, non-OE branded
    'new_iam',       -- Independent aftermarket
    'reman',         -- Remanufactured
    'rec_traced',    -- Recycled with traceability (PIEC)
    'used_untraced'  -- Used without formal traceability
);

CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'paused', 'archived');
CREATE TYPE ingestion_source AS ENUM ('ebay_connector', 'linnworks', 'native_import', 'external_affiliate_feed', 'dms_connector');

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    part_id UUID REFERENCES parts(id),              -- Null until part resolution
    -- Source
    ingestion_source ingestion_source NOT NULL,
    source_external_id TEXT,                        -- e.g., eBay listing ID
    source_url TEXT,
    -- Condition & pricing
    condition part_condition NOT NULL,
    price_amount NUMERIC(10,2) NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'EUR',
    shipping_fee NUMERIC(10,2),
    free_shipping_threshold NUMERIC(10,2),
    delivery_lead_days_min SMALLINT,
    delivery_lead_days_max SMALLINT,
    -- Stock
    stock_quantity INTEGER DEFAULT 0,
    stock_status TEXT DEFAULT 'unknown',
    -- Content
    title TEXT NOT NULL,
    title_i18n JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    description_i18n JSONB DEFAULT '{}'::jsonb,
    media JSONB DEFAULT '[]'::jsonb, -- array of {url, alt, order}
    -- Status
    status listing_status DEFAULT 'pending_review',
    fitment_resolved BOOLEAN DEFAULT FALSE,
    -- Affiliate / MoR routing [vision-ready]
    checkout_path TEXT CHECK (checkout_path IN ('affiliate', 'mor')) DEFAULT 'affiliate',
    affiliate_deep_link TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_id, ingestion_source, source_external_id)
);

CREATE INDEX idx_listings_part ON listings(part_id) WHERE status = 'active';
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
```

### 3.7 `listing_vehicle_applicability`

Denormalized pre-computed applicability of a listing to vehicles. Refreshed when either fitment_edges or listings change.

```sql
CREATE TABLE listing_vehicle_applicability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    aggregated_confidence NUMERIC(3,2) NOT NULL,
    display_tier governance_level NOT NULL,        -- L1 shown prominently; L2/L3 badged differently
    UNIQUE(listing_id, vehicle_id)
);

CREATE INDEX idx_lva_vehicle_tier ON listing_vehicle_applicability(vehicle_id, display_tier, aggregated_confidence);
```

### 3.8 Other essential tables

- `users` — Supabase auth base, extended with profile fields, role (`buyer`, `seller`, `admin`, `reviewer`)
- `saved_vehicles` — user's garage (plates, VINs)
- `search_events` — every search logged for SEO and conversion analysis
- `affiliate_clicks` — tracked outbound clicks with attribution
- `transactions` — empty at MVP, schema ready: order, order_items, payments, shipments, returns
- `plate_lookups` — cache of plate → vehicle resolutions
- `content_pivots` — SEO pivot page data (vehicle × category)
- `seller_invitations`, `seller_applications` — onboarding flow
- `fitment_review_queue` — L3 human-validation queue
- `audit_log` — all backoffice admin actions logged

---

## 4. Fitment Engine — Module Specification

Location: `packages/fitment/`

### 4.1 Public interface

```typescript
// packages/fitment/src/index.ts

export interface FitmentEngine {
    // Core: which parts fit this vehicle?
    partsFittingVehicle(vehicleId: string, options?: FitmentQueryOptions): Promise<FitmentMatch[]>;

    // Reverse: which vehicles does this part fit?
    vehiclesFittingPart(partId: string, options?: FitmentQueryOptions): Promise<FitmentMatch[]>;

    // Listings: used by the search pipeline
    listingsFittingVehicle(vehicleId: string, filters?: ListingFilters): Promise<ListingMatch[]>;

    // Ingestion: adds or updates a fitment edge
    recordEdge(input: RecordEdgeInput): Promise<FitmentEdge>;

    // OE expansion: given an OE number, returns likely compatible parts and vehicles
    expandOE(oeNumber: string): Promise<OEExpansionResult>;

    // Photo AI entry point
    inferFromPhoto(photoUrl: string, context?: InferenceContext): Promise<PhotoInferenceResult>;

    // Confidence aggregation for a (part, vehicle) pair across sources
    aggregateConfidence(partId: string, vehicleId: string): Promise<AggregatedFitment>;
}

export interface FitmentQueryOptions {
    minConfidence?: number;
    allowedSources?: FitmentSource[];
    allowedGovernanceLevels?: GovernanceLevel[];
}
```

### 4.2 Confidence aggregation rules (MVP)

- If any `tecdoc_direct` edge exists for `(part, vehicle)` → aggregated = 1.0, level = L1
- Else if `ebay_epid` exists → 0.9, L1
- Else if `oe_cross_reference` with transitive distance ≤ 1 → 0.85, L1
- Else if `ai_photo_inference` with model confidence ≥ 0.85 → 0.75, L2 (badged "inferred")
- Else if `human_validated` → 0.9, L3
- Else if `community_reported` with ≥ 3 confirmations → gradient 0.6–0.95, L4
- Multiple sources: aggregated = `max` source confidence, not averaged — we are publishing the best evidence

### 4.3 OE cross-reference engine

Stored in `oe_cross_references` table (many-to-many): `(oe_number, equivalent_oe_number, distance, source)`.

Built at MVP from:
- eBay listing metadata (sellers list multiple OEs per part)
- Manual bootstrap for top-500 parts categories (seeded dataset)
- OE numbers extracted by Photo AI pipeline

### 4.4 Photo AI pipeline (Claude Vision-based at MVP)

Pipeline steps:

1. Seller uploads photo
2. Photo stored in Supabase Storage with checksum deduplication
3. Edge Function `infer-photo` called asynchronously:
   - Sends photo to Anthropic Claude Vision API
   - Prompt requests: (a) category classification, (b) all visible OE/IAM numbers OCR'd with bounding boxes, (c) estimated condition
   - Response parsed, stored in `photo_inferences` table
4. `fitment_engine.inferFromPhoto()` integrates response:
   - If OE number recognized with confidence ≥ 0.9 → match against `parts.oe_numbers`
   - If part matched → propagate fitment edges for linked vehicles
   - If category classified but no OE → present candidate parts to seller for confirmation

**Prompt template** (stored in `packages/ai/src/prompts/photo-inference.ts`): provide context that this is an automotive part photo, ask for structured JSON response with category, OE numbers, IAM references, visible brand markings, and estimated condition. Reject photos that are not automotive parts with a clear error code.

**Cost control:** cache inferences by photo checksum; rate-limit per seller; prefer lower-cost model tier (Claude Haiku for initial pass, escalate to Sonnet for ambiguous cases).

### 4.5 Governance queue

L3 human-validation queue surfaces:
- Listings with no resolvable fitment after all automated steps
- Listings where multiple candidate parts are plausible
- Listings flagged by sellers for expert review
- Listings reported by buyers post-purchase

Queue workflow: assign to internal reviewer → review within SLA (24h MVP) → decision: approve / reassign / reject / request seller info.

---

## 5. eBay Connector — Module Specification

Location: `packages/connectors/ebay/`

### 5.1 Flow

1. **Seller initiates connection** from dashboard: "Connect eBay account"
2. OAuth flow with eBay: TORQUED obtains access + refresh tokens, scopes: `sell.inventory`, `sell.account`, `sell.marketing` (read)
3. Tokens stored encrypted in `seller_connections` (new table): `(seller_id, provider, access_token, refresh_token, expires_at)`
4. Initial import job queued (Edge Function or Trigger.dev):
   - Pulls full Inventory API listing set
   - For each listing: map to `listings` row, extract ePID fitment (if present) → create `fitment_edges` with source `ebay_epid`
   - Store images via Supabase Storage
   - Resolve to canonical `parts` by OE/IAM match or create draft part for review
5. Periodic sync job every 6 hours: diffs new/updated/removed listings

### 5.2 eBay API specifics

- **Inventory API** for structured listings with fitment attributes (`compatibilityList`) — preferred path
- **Trading API** for older listings not migrated to Inventory API — fallback
- **ePID** is returned in `compatibilityList`: each entry maps to a `KTypeNr` → lookup in `vehicles` table by `ktype_nr`
- **Rate limits**: ~5000 calls/day on free tier, scaled with seller agreements — respect them

### 5.3 Error handling

- Token expiration: silent refresh via OAuth refresh token
- Rate limit: exponential backoff, job rescheduled
- Unknown KType: create `vehicles` draft row with `data_source = 'ebay_import'` and flag for curation
- Unknown OE: create `parts` draft row

### 5.4 Data quality signals captured from eBay

eBay seller metadata — feedback score, return rate, dispute rate — is imported into `sellers.ebay_connection_meta` and used as a **primer** for A/B/C/D scoring until TORQUED has enough native transactional data.

---

## 6. Plate & VIN Search

### 6.1 Plate (France at MVP)

- Integration partner required (SIV-authorized reseller — ICS, SIV Auto, or equivalent)
- Authorization process: 2-4 months — kick off in Month 1
- MVP fallback if not ready: **manual plate → VIN lookup via user input** of VIN or make/model/year selector; plate integration activated when partner is live

API interface: `/api/lookup/plate?country=fr&plate=AB-123-CD` → `{ vin, vehicle_id, match_confidence }`

Cache in `plate_lookups` table (GDPR-compliant — hash plate, retention 90 days).

### 6.2 VIN (pan-EU, day 1)

- 17-character VIN decoder: open-source libraries + custom logic for EU manufacturer codes
- API interface: `/api/lookup/vin?vin=WVWZZZ1KZAW000000` → `{ make, model, year, engine_hints, vehicle_candidates[] }`
- If multiple vehicle candidates (VIN does not always uniquely identify trim), present disambiguation UI

### 6.3 Part reference / free text

- Search `parts.oe_numbers` and `parts.iam_numbers` with exact + fuzzy match
- Fall back to full-text search on `parts.display_name` + `listings.title`

---

## 7. Public B2C Website

### 7.1 Routes (Next.js App Router)

- `/` — homepage: entry points (plate, VIN, search bar), featured categories, editorial content
- `/[locale]/recherche?plaque=...` — plate search results
- `/[locale]/recherche?vin=...` — VIN search results
- `/[locale]/recherche?q=...` — free-text or OE number search
- `/[locale]/vehicule/[slug]` — vehicle hub page (pivot SEO page: "Pièces pour Peugeot 308 II 1.6 HDi 92")
- `/[locale]/vehicule/[slug]/[category-slug]` — category × vehicle pivot page
- `/[locale]/piece/[slug]` — canonical part page with all seller listings
- `/[locale]/annonce/[id]` — specific listing detail
- `/compte/*` — buyer account area
- `/vendeur/*` — seller dashboard (auth-required, seller role)
- `/checkout/click/[listing_id]` — affiliate redirect with tracking (MVP default)

At MVP, `[locale]` is always `fr`. The i18n middleware is in place but only FR strings are populated.

### 7.2 Key pages

**Search results page** is the core UX:
- Left rail: filters (condition, price range, brand, delivery, seller tier)
- Center: results as cards grouped by **part** (not by listing), with condition tabs underneath showing alternatives across OE/IAM/Reman/REC/Used
- Each result: title, primary image, fitment confidence badge, price summary ("from €X"), delivery indicator, seller tier indicator
- Click → part detail page showing all listings for this part with full comparison table

**Part detail page:**
- Part identification: OE references, IAM references, technical attributes
- Fitment confirmation: "Cette pièce est compatible avec votre [vehicle]" with confidence badge
- Comparison table: every active listing with columns for price, condition, shipping, delivery, seller, action ("Voir l'offre" → affiliate redirect at MVP)
- Alternative conditions: if looking at a new IAM part, show "Aussi disponible en REC (–35% prix)"

**Vehicle hub page (pivot SEO):**
- H1: "Pièces détachées pour [Vehicle display name]"
- Structured data: `Vehicle` + `ItemList` schemas
- Categories grid with counts of available parts
- Featured popular parts
- Content block (AI-assisted + human reviewed) about maintenance patterns, common issues, etc.
- Internal links to related vehicles (same platform, siblings)

### 7.3 SEO requirements

- Server-side rendering for all public pages
- `hreflang` tags in place even with only FR at MVP (x-default + fr)
- `sitemap.xml` auto-generated from content pivots + active parts + vehicles
- `robots.txt` with search query exclusions
- Canonical tags per locale
- Open Graph + Twitter cards on all pages
- Structured data (`Product`, `Offer`, `Vehicle`, `BreadcrumbList`)
- Sub-3-second LCP on vehicle and part pages (Vercel Edge + image optimization)
- No search results pages indexed (follow Autodoc-like strategy: crawl parts and vehicles, not queries)

---

## 8. Seller Dashboard

Accessible at `/vendeur` for authenticated sellers.

### 8.1 Views

- **Dashboard home:** summary of listings (count, status breakdown), recent clicks, fitment queue items pending seller input
- **Listings:** table with filters (status, condition, fitment resolved, date); bulk actions (pause, archive)
- **Listing detail:** editable fields (title, description, price, stock), fitment edges display, listing performance metrics
- **Connections:** eBay connection status, last sync, trigger manual sync
- **Scoring (visible, not yet monetized):** current tier, accuracy rate, return rate, response time — with explanations of how to improve
- **Settings:** company info, VAT, payout info (MoR-ready, not active)

### 8.2 Photo AI entry

"Ajouter une pièce" flow:
1. Seller uploads photo(s)
2. Photo AI runs, seller sees proposed: category, OE number, fitment
3. Seller confirms, corrects, or overrides each field
4. Listing published to `pending_review` or `active` based on confidence thresholds

This is the **"wow" seller onboarding moment** — keep it polished.

---

## 9. Backoffice (Admin)

Accessible at `/admin` for users with admin role — separate Next.js app to isolate concerns.

### 9.1 Key sections

- **Fitment Review Queue** — L3 governance, reviewers approve/reject fitment edges
- **Sellers** — onboarding review, scoring overrides, tier adjustments, suspensions
- **Parts** — canonical parts administration, merge duplicates, edit technical attributes
- **Vehicles** — canonical vehicles administration, resolve drafts, merge duplicates
- **Categories** — taxonomy management
- **Content** — SEO pivot content, category descriptions
- **Rules** — routing rules for MoR vs affiliate (inactive at MVP but UI present)
- **Analytics** — dashboards on catalog health, fitment accuracy, search conversion, seller performance
- **Audit log** — every admin action visible

### 9.2 Design

Dense, efficient, data-rich. Not a beauty contest. Think Linear or Retool aesthetic — everything scannable, every action two clicks away.

---

## 10. AI Workloads — Anthropic API Usage

### 10.1 Use cases at MVP

- **Photo inference** (§4.4)
- **Listing description cleanup** — eBay seller descriptions often low-quality; clean and normalize at ingestion
- **Content generation for SEO pivot pages** — human-reviewed output for vehicle hubs and category pages
- **Fitment disambiguation** — when multiple candidate parts match, ask Claude to rank based on description context

### 10.2 Operational rules

- All prompts in `packages/ai/src/prompts/` versioned, with tests
- Rate limiting per user action
- Cost tracking per workload type, dashboard in backoffice
- Evaluation suite for prompt regressions (test fixtures + expected outputs)
- Claude Haiku for high-volume low-stakes; Sonnet for nuanced tasks

---

## 11. Security & Compliance

- **Auth:** Supabase Auth with RLS policies enforced on every table (write unit tests for RLS)
- **RLS starting point:**
  - `users` can read only their own row
  - `sellers` can read/write only their own listings, images, inferences
  - `listings` publicly readable if status = active; else only owning seller and admin
  - `fitment_edges` publicly readable; only admin or fitment_engine Edge Functions can write
- **Secrets:** env vars in Vercel + Supabase; no secrets in repo; separate dev/staging/prod projects
- **GDPR:** cookie consent banner (CNIL-compliant for French launch), plate lookups hashed, users can export/delete data
- **Seller PII:** minimized, encrypted at rest where sensitive (VAT, legal name)
- **Rate limiting:** middleware on public APIs; stricter for authenticated actions
- **OWASP:** CSRF protection via SameSite cookies + CSP headers; XSS through React defaults; SQL injection non-issue via Supabase client
- **Logging:** structured logs (JSON), admin actions in `audit_log`, user data access logged

---

## 12. Testing Strategy

- **Unit tests** — vitest for domain logic (fitment engine, pricing, routing)
- **Integration tests** — testing-library for component flows
- **E2E tests** — Playwright for critical journeys: plate search → results → affiliate click; seller onboarding eBay; photo upload → inference → publish
- **Supabase RLS tests** — dedicated test suite asserting policies (attacker scenarios)
- **Fitment evaluation suite** — dataset of known `(part, vehicle)` pairs with expected outcomes; run on every fitment engine change
- **Load testing** — k6 on search endpoints before launch

---

## 13. Observability

- **Frontend:** Sentry for errors + performance; PostHog for analytics and feature flags
- **Backend:** Sentry for Edge Function errors; Supabase logs for DB
- **Business KPIs dashboards (backoffice):**
  - Catalog health: listings count, fitment resolved %, sellers active
  - Search: queries per day, zero-result rate, top missing OEs
  - Conversion: affiliate click-through rate, MoR attempts (once active)
  - Fitment quality: confidence distribution, review queue size, reviewer SLA

---

## 14. Deployment

- **Environments:** local / preview / staging / production (all four)
- **CI/CD:** GitHub Actions → Vercel preview deployments on every PR; main branch auto-deploy to staging; manual promote to production
- **Supabase migrations:** tracked in `supabase/migrations/`, applied via CLI in CI, never hand-edit production
- **Feature flags:** PostHog for runtime flags; env flags for build-time (languages enabled, MoR active, B2B PRO enabled)
- **Rollback:** every deploy has rollback path; database migrations reversible where possible

---

## 15. Build Sequence — Suggested Order for Claude Code

The sequence follows the roadmap phases: seller tool first (Phase 0, target M2), marketplace distribution second (Phase 1, target M6), D2C front third (Phase 3, target M12).

### Phase 0 — Seller Tool (Weeks 1–8, target M2 deploy)

**Sprint 0 — Foundation (Week 1-2)**
- Monorepo skeleton (Turborepo, apps/packages structure)
- Supabase project setup (dev + staging)
- All vision-ready table migrations (even if empty at Phase 0)
- Next.js apps bootstrapped (`web`, `backoffice`)
- Auth wired (Supabase Auth) + CI/CD pipeline

**Sprint 1 — Data Foundation (Week 3-4)**
- Vehicles seed (top 2,000 FR vehicles)
- Categories taxonomy bootstrap
- OE cross-references seed (~50k)
- Basic admin UI for data inspection

**Sprint 2 — Fitment Engine v0 (Week 5-6)**
- `packages/fitment/` module, public interface
- Confidence aggregation (L1 + L3 only)
- OE expansion function
- Unit tests + evaluation dataset

**Sprint 3 — eBay Connector + Seller Dashboard (Week 7-8)**
- eBay OAuth flow + Inventory API ingestion + ePID fitment capture
- Photo AI upload (OCR OE numbers, Claude Vision)
- Seller dashboard: listings, fitment status, scoring A/B/C/D
- Backoffice: fitment review queue, seller management
- **→ Phase 0 deploy: seller tool live for first onboarded sellers**

### Phase 1 — Dropship Marketplaces (Weeks 9–20, target M6)

**Sprint 4 — Amazon EU feed (Week 9-12)**
- Catalogue feed generator → Amazon format (SP-API, ACES-compatible attributes)
- Order ingestion Amazon → TORQUED order management → seller notification
- Commission tracking per channel

**Sprint 5 — Allegro feed (Week 13-16)**
- Catalogue feed generator → Allegro format (Pasuje do fitment, category mapping)
- Allegro API integration + order management
- Per-channel performance dashboard in seller tool
- **→ Phase 1 milestone: first GMV on Amazon + Allegro**

**Sprint 6 — Scale channels (Week 17-20)**
- Feed generator abstraction (generic engine, channel-specific adapters)
- Bol.com / Kaufland / Cdiscount adapters (progressive)
- Pricing rules per channel + multi-channel order overview

### Phase 3 — D2C Front (Weeks 21–36, target M12 launch)

**Sprint 7 — Public search (Week 21-25)**
- Homepage + search (VIN pan-EU, plate FR, OE reference)
- Fitment query engine on public routes
- Search results page with condition tabs + comparator
- Part detail page with comparison table

**Sprint 8 — SEO + Buyer UX (Week 26-30)**
- Vehicle hub pivot pages + category pages
- Structured data, sitemap, hreflang
- Buyer account (saved vehicles, history)
- First 500 AI-drafted + reviewed pages FR

**Sprint 9 — MoR + Affiliate + Launch (Week 31-36)**
- Affiliate click tracking
- MoR checkout (scoped: >€30, A/B sellers)
- Legal pages, cookie consent, E2E tests
- **→ Phase 3 launch: torqued.fr public**

---

## 16. Open Decisions at MVP Start

These decisions are deferred to during-build based on empirical signals. Flag them in code with `TODO(decision)` comments:

- **Plate SIV partner selection** — Month 1 RFP across ICS, SIV Auto, Elas
- **Search engine migration timing** — stay on Postgres FTS vs migrate to Meilisearch depending on catalog growth rate
- **Content generation workflow** — full LLM pipeline vs hybrid with agency — decided at Sprint 5 based on quality assessment
- **Affiliate attribution model** — last-click vs multi-touch — defaults to last-click at MVP, reviewable at MVP Beta
- **Pro B2B early signal capture** — should seller dashboard include a "would you be interested in B2B visibility?" form? — yes, lightweight
- **Photo AI model choice** — Claude Vision vs GPT-4V vs Gemini — start with Claude Vision for prompt flexibility and internal familiarity, A/B test at Sprint 6

---

## 17. Definition of Done for MVP Alpha

MVP Alpha ships when:

- [ ] Public site live at `torqued.fr` with French-only content
- [ ] Plate search (FR) OR VIN search (pan-EU) returns fitting parts within 3 seconds
- [ ] ≥ 50,000 listings ingested from ≥ 20 onboarded sellers
- [ ] Fitment accuracy on sampled 500 listings ≥ 85%
- [ ] Photo AI upload flow functional end-to-end for sellers
- [ ] Seller dashboard operational with live eBay sync
- [ ] Backoffice functional for fitment review, seller management, content admin
- [ ] Affiliate click tracking live with confirmed attribution on at least one transaction
- [ ] Legal pages, cookie consent, GDPR export/delete flows live
- [ ] E2E test suite green, Lighthouse ≥ 90 on public pages
- [ ] First 500 SEO pivot pages published

---

## 18. What Claude Code Should Do Next

When starting work from this brief:

1. **Read** `01_TORQUED_VISION.md` fully before touching any code
2. **Read** `02_TORQUED_ROADMAP.md` to understand where MVP fits in the arc
3. **Read this brief** cover-to-cover
4. **Propose** a detailed Sprint 0 plan with environment setup, tooling choices to confirm or change, and first concrete PRs
5. **Ask clarifying questions** on open points before implementing — specifically: hosting region (Supabase EU), domain strategy, brand assets availability, any existing codebases or assets to bootstrap from
6. **Build iteratively** — each sprint ends with a demo-ready state, even if internal-only

---

*End of MVP brief. Scope is deliberately narrow. Resist scope creep — if an idea feels important, add it to `02_TORQUED_ROADMAP.md` as a future phase, do not expand the MVP.*
