# TORQUED — Product Vision

> **Version** : v1.0 — Target vision at 3 years
> **Scope** : European automotive parts marketplace, fitment-first, pan-EU, multi-language, multi-condition
> **Audience** : Product, Tech, Claude Code (build master reference)

---

## 1. Executive Summary — The Product in 5 Lines

**TORQUED is the European automotive parts marketplace built on a single promise:**
**"The best fit at the best price."**

Every search returns only the parts that fit the buyer's vehicle. For each fitting part, TORQUED displays a transparent comparison across condition tiers (OE / OES / IAM / Reman / Recycled / Used), prices, delivery costs, delivery lead times, and free shipping thresholds — so the buyer or the workshop can choose the right trade-off in seconds.

**TORQUED does not hold stock.** It aggregates the catalogs of thousands of European sellers — professional merchants, dismantlers, specialist resellers — via native connectors (eBay first, then DMS systems, then direct import). It enriches listings with proprietary fitment data, photo AI, and a 4-level governance framework. It distributes the aggregated catalog through a pan-EU B2C interface and a professional B2B sourcing tool.

**TORQUED monetizes through two primary streams and a digital marketing & partnerships layer:** affiliation (70% of flow — buyer is redirected to the partner seller), Merchant of Record (30% — TORQUED handles the full transaction, stock, delivery, VAT, and after-sales), and a complementary layer covering CPC, CPM, sponsored placements, and outbound feeds. Target GMV at 3-5 years: **€450M**, blended take rate **8%**, revenue **~€36M**.

**The moat is dual:** supply-side (exclusive connectors + seller network built on cross-marketplace value proposition) and demand-side (the only true cross-condition price comparator in European auto parts).

---

## 2. Positioning — The Problem TORQUED Solves

### 2.1 The buyer-side pain

European automotive parts buyers — whether a DIY owner, an enthusiast restoring a classic car, or a professional workshop — face **three compounding frustrations**:

- **Fitment uncertainty.** Generic marketplaces (eBay, Amazon, Allegro) and specialist retailers (Autodoc, Oscaro) rely on incomplete or fragile fitment systems. The same make-model-year can carry dozens of distinct technical variants, and a mismatch causes returns, wasted shipping, and vehicle downtime. For used and recycled parts, there is currently **no reliable fitment standard at all** in Europe.
- **No real comparison across conditions.** Autodoc sells new IAM. Oscaro sells new IAM. Ovoko sells used. Opisto sells recycled. **No one shows the buyer the same reference across OE, IAM, Reman, Recycled, and Used in a single unified view** — so the buyer cannot arbitrate between price and condition.
- **Fragmented shipping and delivery information.** Free shipping thresholds vary by seller, delivery lead times are hidden until checkout, and cross-border sellers are invisible in local searches despite offering better prices.

### 2.2 The seller-side pain

European automotive parts sellers — professional merchants, dismantlers, specialist resellers — are **under-equipped**:

- They depend heavily on eBay but cannot easily reach other marketplaces
- Their fitment data is often incomplete, which suppresses conversion
- Their cross-border listings are deprioritized by domestic-focused marketplaces
- They have no structured access to professional B2B buyers (workshops, bodyshops, sourcing intermediaries)

### 2.3 TORQUED's answer

TORQUED is built on **one technical conviction and one commercial conviction**.

**Technical conviction:** *"Fitment is the product."* Everything flows from a proprietary fitment engine that combines imported OE/ePID data, empirical transactional data, photo AI validation, and community signals. Without a fitment engine better than competitors, a marketplace in this category cannot win.

**Commercial conviction:** *"Comparability is the killer feature."* For every part that fits a vehicle, TORQUED presents alternatives across condition × price × delivery × seller reputation. The buyer keeps control; TORQUED keeps trust.

### 2.4 Competitive landscape at target state

| Player | Fitment | Condition coverage | Pan-EU | B2B |
|---|---|---|---|---|
| Autodoc | Weak on used, variable on new | New IAM only | Yes (multi-domain) | No |
| Oscaro | Mid on new, none on used | New IAM only | FR/ES only | No |
| eBay Motors | ePID on IAM, weak on used | All conditions but fragmented UX | Yes | No |
| Ovoko | No structured used fitment | Used only | Yes (17 countries) | Partial |
| Opisto | FR plate only, no pan-EU | Used / Recycled only | FR/ES/IT | Yes (opisto.pro) |
| **TORQUED** | **Best-in-class, empirical + ePID + AI** | **All 5 conditions unified** | **Pan-EU native** | **Full B2B sourcing tool** |

---

## 3. Target Users & Segments

### 3.1 B2C — End consumers

**DIY Mainstream.** Pragmatic, fixes the family car. Wants the right part at a fair price, delivered fast. Enters by plate or VIN. Today served by Autodoc, Oscaro, kfzteile24. TORQUED wins by offering clearer fitment confidence + the ability to consider a cheaper Reman or Recycled equivalent next to the new part.

**DIY Enthusiast.** Passionate restorer, vintage collector, tuner. Today served mostly by eBay and used marketplaces. Lives in the long tail — needs rare or specific parts unavailable on mainstream platforms. TORQUED is the best home for them because the aggregated seller catalog covers rare references and because the enthusiast is willing to pay more for the *right* part.

### 3.2 B2B — Professional users

**Independent Workshops (MRA, ~250,000 in EU).** Need to source the right part quickly at a fair price with easy returns. Today served by local distributors (LKQ, AD Parts, PHE, Inter Cars) with H+2 delivery. TORQUED is complementary — it wins on long-tail references, on recycled parts, and on cross-border sourcing when local distributors fail.

**Bodyshops & Insurance-driven repair.** Need to meet insurer prescriptions and increasingly must use recycled parts (PIEC obligation in France, spreading in EU). TORQUED's ability to surface traced recycled parts with reliable fitment is a direct answer.

**Local Distributors & Sourcing Intermediaries.** The Valused-type actors who hunt specific parts across dismantler networks. TORQUED becomes their structured sourcing engine.

### 3.3 Catalog Contributors — The supply side

**Professional marketplace sellers (~10,000+ in EU).** eBay-first sellers with broad inventories. Primary entry channel.
**Specialist resellers (vintage, tuning, classic, performance).** Unique long-tail stock. High-value enthusiast buyers.
**Certified dismantlers (~8,000 in EU).** Recycled parts with full traceability (VIN, mileage). Structured stock.
**Local distributors.** Dead stock that would otherwise be written off — marginal but real volume.

---

## 4. Product Architecture — Target State

### 4.1 Core architectural principle

TORQUED is structured as **three coupled layers** on top of a shared data foundation:

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUYER-FACING LAYER                           │
│  B2C Website (4 languages) · B2B PRO Sourcing Tool · API        │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                          │
│  Fitment Engine · Pricing · Routing (MoR vs Affiliate) · Checkout│
│  Governance · Scoring · Search · Content / SEO                  │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                    CATALOG INGESTION LAYER                      │
│  eBay Connector · DMS Connectors · Native Import · AWIN Feeds   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   DATA FOUNDATION │
                    │  Parts · Fitment  │
                    │  Vehicles · OE DB │
                    │  Sellers · Scoring│
                    └───────────────────┘
```

### 4.2 Catalog Ingestion Layer

**Stream 1 — eBay Connector (primary)**
- Native OAuth integration with eBay
- Full Seller Inventory import (Inventory API + Trading API)
- Import of ePID fitment data already attached to each listing (massive head start for the empirical fitment engine)
- Periodic sync of price, stock, descriptions, media
- **Infrastructure ready for bidirectional publication** (TORQUED → eBay) — activation decided at roadmap stage
- Why eBay first: it is the largest global marketplace for automotive parts, and the majority of professional parts sellers in Europe are already present there with structured inventories

**Stream 2 — DMS Connectors**
- Linnworks connector (first priority — serves many marketplace-first sellers)
- Progressive rollout of additional connectors based on seller demand signals: ChannelAdvisor, Autogest / Intermobilitas, Opisto 360, Pinnacle Professional, ATEMO
- Standardized connector architecture — each new connector = one integration stream
- Pull-based periodic sync with reconciliation logic

**Stream 3 — Native Import**
- CSV / XML / API import for sellers without eBay and without a supported DMS
- Bulk upload with AI-assisted enrichment (photo AI + OE decoding + categorization)
- Offline dealers, non-digitized dismantlers, distributors without marketplace channels

### 4.3 Digital Marketing & Partnerships Layer

A dedicated business line running in parallel to the seller ingestion streams. Not only catalog enrichment — a full commercial surface with its own P&L, its own partners, and its own orchestration logic. Three bricks:

**Brick A — External catalog ingestion (feeds & partnerships)**
- Affiliate network feeds: AWIN, Effiliation, TradeDoubler, Rakuten, CJ — and any equivalent network
- Direct bilateral affiliation deals with off-network merchants (Autodoc direct, Oscaro direct, LKQ, large retailers, etc.)
- Feed ingestion with clear provenance tagging — listings flagged as `external_affiliate_feed`, not eligible for MoR
- Fitment completion on external feeds runs through the central fitment engine using OE/IAM cross-references

**Brick B — Paid placements engine**
- Sponsored listings: partners pay for priority positioning within fitment-relevance constraints (a non-compatible listing is never surfaced as compatible — editorial integrity is non-negotiable)
- CPC redirections: partners pay per outbound click, not per conversion
- CPM contextual display on high-intent pages (vehicle hubs, category pages)
- Rule engine that coexists with editorial ranking — both surfaces remain distinguishable to the buyer

**Brick C — Outbound feeds & partnerships**
- TORQUED as a source feeding Google Shopping, Idealo, Kelkoo, Shopzilla and other comparators
- Partner retargeting agreements (inbound traffic valuation)
- Cross-data partnerships with adjacent actors (DMS vendors, insurers, expert estimation software) where data exchange creates mutual value without compromising editorial independence

**Monetization mix** evolves from affiliate-only at MVP Beta to a diversified portfolio at V2, reducing dependency on any single mechanism.

### 4.4 Data Foundation

**Core entities:**
- `vehicles` — canonical vehicle database (make, model, year, engine, KType, VIN decoding rules, plate-to-VIN mapping by country)
- `parts` — canonical parts database (OE numbers, IAM references, category taxonomy, technical attributes)
- `fitment_edges` — the proprietary empirical fitment graph linking parts to vehicles, with confidence scores, source (TecDoc / ePID / AI / human / community), and timestamps
- `listings` — live inventory from all ingestion streams
- `sellers` — seller accounts, A/B/C/D scoring, performance metrics, commercial terms
- `transactions` — order history feeding back into fitment confidence and seller scoring
- `media` — photos, technical diagrams, photo AI inference results

**Design principle:** schemas are built for the full vision from day one — **including when new vehicle categories are added** (see §8). At MVP, some fields may be empty and some tables lightly populated, but the data model does not need refactoring as features light up.

### 4.5 Fitment Engine — The core defensible asset

The fitment engine answers one question with a confidence score: *"Does this part fit this vehicle?"*

It runs on **five evidence sources** ranked by confidence:

1. **ePID / eBay imports** — massive head start, free, already cross-referenced with TecDoc for IAM
2. **OE number cross-referencing** — using proprietary OE database and sibling-part expansion (example: part for Peugeot 308 often fits Peugeot 3008, Citroën C4, DS4, Opel Astra — ×5 to ×10 commercial exposure)
3. **Photo AI inference** — vision model identifies part type + extracts OE numbers from photos
4. **Transactional feedback loop** — returns, reviews, post-purchase confirmations strengthen or weaken fitment edges over time
5. **Human + community validation** — expert moderation queue + buyer reporting

**Business rules specification — dedicated workshop required.** The fitment engine cannot be reduced to a technical architecture. Its defensibility comes from explicit business rules that must be defined before implementation — leaving them implicit would be a founding mistake. A dedicated specification session is a prerequisite to implementation. Key topics to resolve:

- **Propagation rules** — how far compatibility extends across OE cross-references, vehicle variants, shared platforms, running changes
- **Conflict resolution** — arbitration between contradictory sources (seller declaration vs engine computation vs community reports)
- **Part categorization by fitment criticality** — wiper blades vs ECU are not in the same class
- **Used & recycled parts rules** — donor VIN to recipient VIN logic, PIEC traceability requirements, nomenclature enforcement
- **Display and commercial commitment thresholds** — minimum confidence for public display, visual badging strategy, refund guarantee thresholds
- **Feedback loop weighting** — how buyer reports reinforce or degrade the fitment graph over time

The output of this session will be a standalone Business Rules Specification. Its format will be decided after the session.

### 4.6 Governance Framework — The 4-Level Model

Every fitment edge (and every listing) moves through four possible validation levels:

| Level | Source | Validation | Publication |
|---|---|---|---|
| **L1 Auto-validated** | TecDoc / ePID / OE exact match | Automatic | Immediate |
| **L2 AI-validated** | Photo AI + probabilistic cross-ref | AI confidence > threshold | Published with "inferred" badge |
| **L3 Human-validated** | Ambiguous cases | Internal or seller review queue | Published after review |
| **L4 Community-validated** | Post-purchase feedback | Buyer confirmations weight the edge | Continuous reinforcement |

**Seller Scoring A/B/C/D** is computed from: fitment precision (post-purchase confirmation rate), photo quality, return rate, response time, volume, reviews. A-sellers publish faster with less friction; D-sellers are restricted or suspended.

### 4.7 Orchestration Layer

**Routing engine (MoR vs Affiliate).** For each listing, rules decide whether checkout is handled by TORQUED (MoR) or the buyer is redirected to the seller (affiliate). Rules consider:
- Part condition (Reman and Recycled often warrant MoR for SAV control)
- Unit price (MoR more viable above ~€30 based on post-mortem learnings)
- Seller eligibility (only A/B sellers qualify for MoR)
- Seller preference
- Geography / VAT complexity

**Pricing engine.** Normalized price display per part: unit price + shipping + free shipping thresholds + delivery lead time + condition. Supports currency display per user locale.

**Search & fitment application.** Four entry points:
- **By plate** (country by country, starting FR, then UK, DE, PL, extending progressively)
- **By VIN** (pan-EU day one, 17-character decoding + manufacturer databases)
- **By photo** (AI identifies part type + extracts OE → fits against known fitment edges)
- **By part reference** (OE number, IAM reference, free text)

**SEO stack.** Multi-language pivot page architecture built from day one: `/{locale}/{vehicle-slug}/{category-slug}/{part-slug}`. Automated sitemap generation. Hreflang coverage. Structured data (Product, Vehicle, Offer). Content localization workflow combining LLM generation + human review for all four launch languages.

### 4.8 Buyer-Facing Layer

**B2C Website**
- Multi-language native (EN / FR / DE / PL) with extensibility in backoffice
- Entry points: plate / VIN / photo / part reference / make-model-year
- Results page: for each matching part, condition tiers side by side, price comparison, delivery info, seller reputation, stock availability, free-shipping threshold
- Checkout: dual-path — integrated MoR checkout OR redirect to affiliate partner (with clear labeling)
- Buyer account: order history, saved vehicles, tracking, returns
- Mobile-first responsive design

**B2B PRO Sourcing Tool**
- Pro account with authenticated access (separate URL: pro.torqued.eu or equivalent)
- **Vehicle fleet management**: save vehicles by plate, VIN, or fleet import
- **Purchase lists**: create, import (CSV + AI document ingestion), manage shopping lists per vehicle or per fleet
- **AI document ingestion**: upload a quote, damage report, or insurer prescription — AI parses references, identifies target vehicle, populates the list
- **Multi-criteria sourcing comparator**: across the list, compare suppliers, prices, delivery lead times, free shipping thresholds, availability — optimize the basket per vehicle or per fleet
- **Purchase planning**: schedule recurring orders, batch checkout, approval workflows for multi-user accounts
- **Dual-path checkout**: MoR dropship via TORQUED OR redirect to affiliate partner per line
- Quotation export, invoice handling, VAT handling per country

**Developer API**
- Public API for approved B2B integrators (ERP, workshop management software, insurance platforms) to query fitment, availability, pricing

### 4.9 Backoffice / Admin

- Seller management: onboarding, contracts, scoring, badges, restrictions
- Catalog administration: categories, taxonomy, fitment overrides, content moderation
- Listing curation: promotions, featured listings, merchandising rules per language/country
- Content management: SEO content, translations, FAQ, category descriptions
- Rules engine for MoR vs affiliate routing
- Analytics: conversion, revenue per stream, fitment accuracy KPIs, seller performance dashboards

---

## 5. Geography, Languages, Transactions

**Geography.** Pan-EU marketplace, single entity, unified brand TORQUED across all countries.

**Languages at target state.** EN, FR, DE, PL native — extensible in backoffice to add any additional language without engineering involvement. Each language supports full content localization (product descriptions, category pages, SEO pivot pages, transactional emails, legal pages, support).

**Currencies.** EUR primary; GBP, PLN, CZK, HUF, RON surfaced based on user locale. Seller prices stored in their operating currency, converted on display.

**VAT.** Multi-country VAT handling native — cross-border B2C (OSS / IOSS), B2B intra-EU reverse charge, invoicing compliance per country.

**Plate search rollout.** France day one (via SIV partner integrations). Progressive extension: UK (DVLA), Germany (KBA partners), Poland (CEPIK partners), then Spain, Italy, Netherlands, Belgium.

**VIN search.** Pan-EU from day one (open-source VIN decoders + TecAlliance extensions where applicable).

---

## 6. Business Model — Target Unit Economics

**Target GMV at 3-5 years:** €450M
**Target blended take rate:** 8%
**Target revenue:** ~€36M
**Transaction mix:** 70% affiliation / 30% MoR
**Average basket:** ~€150 (blended B2C + B2B)
**Transactions per year:** ~3M

**Revenue composition:**
- **Affiliation commissions** — 3-7% of partner merchant GMV on redirected traffic
- **MoR margin** — 10-20% commission + logistics margin on TORQUED-handled transactions
- **Premium seller services** (target state) — promoted listings, enhanced content, priority positioning
- **Data licensing** (long-term, see §9) — API access to the fitment engine and OE database sold to workshops, insurers, ERP vendors

**Cost structure at target state:**
- Tech & product: ~30% of revenue
- Data partnerships (TecDoc or equivalent + AWIN platform fees): ~5-8%
- Content & SEO production: ~5-8%
- Marketing & acquisition: ~15-25%
- Operations, logistics coordination, SAV: ~10-15%
- G&A: ~8-10%

---

## 7. Moat & Defensibility

### 7.1 Supply moat

- **Seller network density** — by being the first European marketplace offering a native connector + multi-marketplace distribution + fitment enrichment + Pro B2B exposure, TORQUED aggregates a supply side that competitors would need years to replicate
- **Connector stack** — each DMS connector built (Linnworks, Pinnacle, Autogest, etc.) is a capital investment that progressively locks the catalog as a distribution channel for DMS vendors
- **eBay-first onboarding** — the fastest path to supply scale in Europe, reducing seller friction to near-zero

### 7.2 Price comparison moat

- **Multi-condition unified view** — no competitor in Europe today compares OE × IAM × Reman × REC × Used for the same part reference in a single UX. Building this requires the fitment engine to be correct across all conditions — a technical barrier Autodoc and Oscaro do not have, Ovoko and Opisto do not have, eBay does not attempt
- **Transparent total-cost comparison** — unit price, shipping, lead time, free shipping thresholds, seller reputation in one view
- **Trust surface** — the 4-level governance + A/B/C/D seller scoring make the comparator reliable, which is the requirement for it to become the default reflex for professional buyers

### 7.3 Data as a compounding asset

Every transaction, every return, every buyer confirmation strengthens the fitment graph and the seller scoring. The longer TORQUED operates, the harder it is to replicate the accuracy of its fitment engine. At scale, this data layer becomes independently monetizable (§9).

---

## 8. Vehicle Scope — Horizontal Platform, Vertical Streams

### 8.1 Architectural principle

**Each vehicle category is a separate product stream, with its own front, its own fitment logic, and its own roadmap. The data foundation is unified across all streams.**

This is the horizontal platform / vertical product pattern. One data backbone — same `vehicles` table (with `vehicle_type` discriminant), same `parts`, same `fitment_edges`, same `sellers`, same governance framework, same connector architecture. On top of it, each vehicle category runs as a distinct product with dedicated fitment rules, dedicated UX, and a dedicated acquisition strategy.

Sellers are transversal: a seller with mixed inventory (auto parts + motorcycle parts + marine engine parts) is onboarded once. Their listings are automatically routed to the correct product surface by `vehicle_type`.

### 8.2 Stream 1 — Cars & Light Commercial (primary, day one)

The founding stream. All architecture, fitment engine, connectors, and UX are designed around this category first. KType / TecDoc coverage, ePID, plate-to-VIN by country — everything is built for cars and light commercial vehicles.

### 8.3 Stream 2 — Motorcycles (vision target, second stream)

Motorcycle parts is a separate stream, activated after the car stream reaches operational maturity. It shares the data foundation entirely but requires:
- **Dedicated fitment module** — TecDoc motorcycle coverage exists from 2014 onward, but with lower depth than car coverage. The empirical fitment layer becomes more critical
- **Dedicated UX** — motorcycle search is organized around brand / model / year / displacement, not plate (plate search is limited for motorcycles) and VIN decoding follows a different logic
- **Dedicated front** — either a distinct subdomain, a dedicated section, or a separate brand extension. Branding decision deferred to the time of activation

### 8.4 Beyond — Directional categories

At maturity, other categories could enrich the TORQUED catalog — each as its own stream, never merged into an existing one:
- **Trucks / HGV** — B2B-dominant, fitment by PTAC + powertrain + body type, TecDoc Trucks exists
- **Boats / Marine** — no TecDoc equivalent, fitment organized around marine engine (brand + model + power), completely different logic
- **Agricultural** — extreme long tail, no standard data layer, fitment by brand + model + year

These categories are not in the vision scope. They are named here to confirm that the architecture supports them without refactoring — adding a new stream = new fitment module + new front, nothing else.

### 8.5 Non-negotiable consequence for the data model

The `vehicles` table carries a `vehicle_type` field from day one. The fitment engine is designed as a **rules engine with injectable modules per vehicle_type** from the first implementation — not a car-only engine that gets patched later. At MVP, only the `car` and `light_commercial` modules are implemented; the interface is generic.

---

## 9. Brand & Experience Principles

**Name:** TORQUED

**Brand positioning:** *"The best fit at the best price."*

**Voice:** Technical credibility without jargon. Respect for the buyer's intelligence. Zero marketing fluff. Comparison as a native UX reflex, not a feature.

**Design language:** Utilitarian, data-rich, dense when needed, uncluttered at decision points. Not Autodoc's busy catalog aesthetic. Not Amazon's generic card grid. Closer to a precision instrument — like what a mechanic would design if they built a marketplace.

**Trust signals everywhere:** fitment confidence per part, seller badge visible at every step, delivery commitment upfront, return policy clear before checkout.

---

## 10. What TORQUED Is Not

- **Not a pure-player retailer** — TORQUED does not buy and hold stock (outside the 3PL optional partnership for MoR sellers who want it)
- **Not a classifieds site** — every listing is structured, fitment-qualified, and comparable
- **Not a logistics company** — dropship default, 3PL partnership optional for sellers who want to externalize
- **Not a DMS vendor** — connectors ingest from existing DMS, they do not replace them
- **Not a single-condition specialist** — TORQUED covers all conditions by design, not by accident
- **Not a single-country marketplace** — pan-EU is not a phase, it is the core architecture
- **Not an OEM-locked platform** — independent from any OEM, insurer, or buying group

---

## 11. Vision Constraints & Non-Negotiables

### Must-haves in the target state

- Fitment engine that outperforms ePID and TecDoc-alone approaches on used/recycled parts
- Multi-condition unified comparator as the default results view
- 4-language content quality indistinguishable from a native speaker per country
- MoR operational quality sufficient to compete with Amazon's fulfillment standards on handled SKUs
- Pro B2B tool complete enough to replace Valused-style concierge for mid-complexity sourcing needs
- Zero scraping in production architecture — all data flows are contractual (eBay API, DMS APIs, AWIN partnerships, native imports)

### Explicit non-goals

- No direct competition with Autodoc on pure price on commodity new IAM (commodity pricing war is unwinnable)
- No own-brand parts (TORQUED is neutral infrastructure, not an OEM or IAM manufacturer)
- No physical retail presence
- No ownership of logistics assets (warehouses, fleet)

---

*End of vision document. This document is the master reference. MVP and Roadmap documents are derivatives that select, sequence, and schedule which elements of this vision are activated in which phase.*
