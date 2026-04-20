# TORQUED — 24-Month Roadmap

> **Purpose** : Phased activation plan from MVP to full vision
> **Horizon** : 24 months — MVP → V1 → V2
> **Reference document** : `01_TORQUED_VISION.md` (master vision)
> **Build reference** : `03_TORQUED_MVP_BRIEF.md` (what is shipped first)

---

## 0. Roadmap Philosophy

**Architecture is built for the vision from day one. Features are activated progressively.**

This principle is fundamental. Supabase schemas, API contracts, data models, and core engines (fitment, pricing, routing, governance) are designed for the full vision at V3. At each phase, specific features light up, but no architectural refactoring is required. This is the only way to build ambitious scope with solo-to-small-team resources.

**Consequence for the MVP:** the MVP is architecturally rich but functionally focused. Many tables will be empty, many rule engines will have trivial rulesets, many UIs will be hidden behind feature flags — but the scaffolding is correct.

---

## 1. Phase Overview

| Phase | Timeline | Headline | Primary Goal |
|---|---|---|---|
| **MVP — Alpha** | Months 0–6 | *"Prove the fitment engine with one country, one audience"* | Validate technical feasibility + fitment quality |
| **MVP — Beta** | Months 6–9 | *"First revenue-generating traffic, limited scope"* | Validate commercial viability |
| **V1** | Months 9–15 | *"Full B2C launch, 4 languages, multi-condition"* | Scale to pan-EU B2C reach |
| **V2** | Months 15–24 | *"B2B PRO complete, Data moat hardening"* | Unlock the B2B sourcing tool + MoR maturity |
| **V3 (beyond)** | 24+ months | *"Data as a Service, Motorcycle, Vertical extensions"* | Monetize the data moat |

---

## 2. MVP Alpha (Months 0–6) — Prove the Engine

### 2.1 Scope

**One country, one language, narrow audience, fitment engine + catalog ingestion foundation.**

- **Geography:** France only
- **Language:** French only (EN available as a technical toggle for internal use)
- **Audience:** B2C DIY Enthusiast (long-tail, Recycled + Used focused) — the segment where TORQUED is differentiated from Autodoc/Oscaro
- **Part conditions:** Recycled (PIEC traced) + Used (untraced) as primary surfaces; IAM available but not the marketing focus
- **Revenue model:** 100% affiliation-ready, 0% MoR active (MoR infrastructure built, not turned on)
- **Vehicle scope:** Cars only

### 2.2 Capabilities activated

**Catalog Ingestion Layer**
- eBay Connector — import-only mode (OAuth onboarding, Inventory API ingestion, ePID fitment capture)
- Native Import — CSV upload for sellers without eBay access (small tooling, limited UX)
- Linnworks connector — deferred to V1
- AWIN feeds — deferred to MVP Beta
- DMS connectors beyond Linnworks — deferred to V1 / V2

**Data Foundation**
- All core entities modeled (vehicles, parts, fitment_edges, listings, sellers, transactions, media)
- Vehicle database seeded from open TecAlliance datasets + manually curated top 2,000 FR vehicles
- Parts taxonomy bootstrapped from eBay category structure + normalized

**Fitment Engine**
- L1 Auto-validated from imported ePID and OE exact match
- L3 Human-validated queue operational for ambiguous cases
- L2 AI-validated and L4 Community-validated — infrastructure built, not activated
- Photo AI: OCR on OE/IAM numbers (Claude Vision or GPT-4V via API), part type classification (lightweight custom model or zero-shot vision)
- OE reverse-matching engine: functional, seeded with ~50k OE cross-references

**Governance**
- 4-level schema present in data model
- Only L1 + L3 operational
- Seller scoring A/B/C/D: infrastructure built, scoring computed but not yet exposed publicly
- Manual seller onboarding (no self-serve at this stage)

**Buyer-facing**
- FR B2C website at `torqued.fr` or `torqued.eu/fr`
- Entry points: plate (FR via SIV partner), VIN, part reference, free-text search
- Results page: fitment-filtered + multi-condition comparison surface even if conditions are sparsely populated
- Checkout: **redirect-only** (affiliate model, even on TORQUED-onboarded sellers at this stage — use of deep links to seller eBay listings or seller webshops)
- Account: saved vehicles, order history (tracking redirect clicks), basic profile

**B2B PRO**
- Deferred to V2

**Backoffice**
- Seller onboarding manual flow
- Fitment review queue
- Basic content management

### 2.3 Key decisions embedded in MVP Alpha

- **No MoR at MVP Alpha** — reduces scope massively, de-risks cash flow, allows focus on fitment quality
- **No B2B at MVP Alpha** — avoids building two products at once
- **France-first** — lets the plate integration be built once and validated before extending to other countries
- **Enthusiast-first positioning** — avoids head-to-head with Autodoc on mainstream DIY, capitalizes on the long-tail gap

### 2.4 Success criteria at end of Month 6

- ≥ 50,000 SKUs ingested with fitment edges
- ≥ 20 sellers onboarded (≥ 10 via eBay connector)
- Fitment accuracy on sampled listings ≥ 85% (measured by human audit)
- Functional plate-to-parts search at < 3 seconds response time
- At least one end-to-end affiliate transaction tracked from search to partner conversion
- Zero production scraping

---

## 3. MVP Beta (Months 6–9) — First Revenue

### 3.1 Scope additions

- **AWIN feeds activated** for Autodoc FR, kfzteile24, Mister-Auto, Norauto (deal by deal, starting with highest-relevance merchants)
- **MoR checkout** activated on a **narrow curated slice** of the catalog (high-margin Reman + high-value Recycled, only A-scored sellers, only > €50 unit price — directly reflecting the post-mortem lessons)
- **SEO content push** — first 1,000 pivot pages published (vehicle × category × condition) with quality localized content
- **First paid acquisition test** — limited Google Ads budget on long-tail queries

### 3.2 New capabilities

- AWIN feed ingestion pipeline with fitment enrichment
- MoR checkout (Stripe Connect or equivalent), VAT handling (FR only)
- Tracking pixel and affiliate attribution
- Basic seller dashboard: performance metrics, earnings, listing status

### 3.3 Success criteria at end of Month 9

- ≥ €100k GMV monthly run-rate (any combination of affiliate + MoR)
- ≥ 5,000 unique buyers per month
- MoR transactions complete end-to-end (payment, fulfillment, delivery, optional return) with < 5% issue rate
- Seller A/B/C/D scoring publicly exposed (buyer trust signal)

---

## 4. V1 (Months 9–15) — Pan-EU B2C Launch

### 4.1 Scope additions

- **Languages:** EN, DE, PL activated alongside FR — full native content quality on top 3,000 pivot pages per language
- **Countries for plate search:** UK (DVLA), Germany (KBA partner), Poland (CEPIK partner) added progressively
- **Linnworks connector** released — priority for onboarding non-eBay sellers
- **Seller self-serve onboarding** — reduces manual operational load, enables scale
- **Fitment engine L2 (AI-validated) and L4 (Community-validated)** activated — Photo AI becomes a native enrichment path at import, community confirmations feed fitment_edges
- **MoR extended** to broader catalog — all A and B sellers, price threshold lowered to €30 with logistics margin protection
- **Positioning extended** — from "enthusiast long-tail" to "best fit at the best price across all conditions" as the marketing anchor
- **Vehicle scope:** NEW IAM and OES added to the marketed offer (Reman + Recycled + Used remain signature differentiators)

### 4.2 Success criteria at end of Month 15

- ≥ €1M GMV monthly run-rate
- ≥ 4 languages operational with native-equivalent SEO performance in at least 2
- ≥ 200 sellers onboarded
- Fitment engine empirical data: ≥ 500k fitment edges with confidence scoring
- Cross-border transactions ≥ 20% of GMV

---

## 5. V2 (Months 15–24) — B2B Professional Tool

### 5.1 Scope additions

- **B2B PRO Sourcing Tool** launched at `pro.torqued.eu`:
 - Fleet and vehicle list management
 - Purchase list creation and management
 - AI document ingestion (upload a quote or damage report, AI extracts parts + identifies vehicle)
 - Multi-criteria comparator (prices, delivery, franco) across the list
 - Batch checkout with dual MoR / affiliate path per line
 - Multi-user accounts with approval workflows
- **Additional DMS connectors** based on seller demand signal (ChannelAdvisor, Pinnacle Professional, Autogest / Intermobilitas, Opisto 360, ATEMO)
- **Public developer API** beta — selected B2B integrators (DMS vendors, insurance platforms, expert estimation software) given read access to fitment engine
- **Seller Premium Services** — promoted listings, enhanced content, priority positioning monetization
- **Motorcycle stream** launched as second vehicle category — dedicated fitment module (TecDoc moto + empirical layer), dedicated front (UX, search by brand/model/year/displacement), separate acquisition strategy

### 5.2 Success criteria at end of Month 24

- ≥ €3M GMV monthly run-rate (€36M+ annualized)
- B2B PRO: ≥ 1,000 active pro accounts
- MoR mix reaches 25-30% of GMV
- ≥ 500 sellers
- Public API: ≥ 5 B2B integrators in production
- Operational readiness for Series B / scaling round if equity path chosen

---

## 6. V3 and Beyond (24+ Months) — Data Moat Monetization

**Directional, not scheduled:**

- Fitment Engine and OE Database sold as standalone B2B SaaS to workshops, insurers, estimators, ERP vendors
- Bidirectional publication engine: TORQUED → eBay, Amazon, Allegro, Bol.com, eMAG, Kaufland, Cdiscount (seller chooses channels)
- Additional vehicle category streams (truck, boat, agricultural) evaluated against supply/demand signals — each = new fitment module + new front, no architectural refactoring required
- Potential acquisition targets: regional dismantler networks, DMS vendors, or complementary pro platforms
- Geographic extension beyond EU: UK (post-Brexit optimization), Morocco, Turkey (proxy markets with large EU parts flow)

---

## 7. Cross-Cutting Workstreams

These workstreams run in parallel across all phases and do not map to a single feature release:

### 7.1 Data partnerships
- Month 0–3: Scope TecDoc licensing (full API vs ETAI redistribution) — decide entry point
- Month 3–9: Build OE cross-reference database from open sources + seller transactional data
- Month 9–18: Deepen TecDoc license or negotiate direct IAM brand data partnerships
- Month 18+: Evaluate reselling data rights

### 7.2 SEO & content production
- Month 0–6: Pivot page templates, technical SEO, sitemap automation, schema markup
- Month 6–12: Content production at scale — LLM-assisted pipeline with human review, 3,000+ pages per language
- Month 12–24: Backlink strategy, PR, technical content authority building

### 7.3 Legal & compliance
- Month 0–3: Entity structuring, VAT registrations (OSS/IOSS), T&Cs, privacy policy, seller contracts
- Month 3–9: Per-country compliance (France PIEC, Germany GPSR, Poland e-commerce law)
- Month 9–18: Progressive VAT registrations as cross-border volume grows
- Month 18–24: B2B contracting frameworks, API terms of service, data processing agreements

### 7.4 Commercial & seller relations
- Month 0–6: Hand-curated seller onboarding (founder-led)
- Month 6–12: Formalize onboarding playbook, commercial terms, SLAs
- Month 12–18: Seller success team, commercial relationship management tools
- Month 18–24: Pro seller tier, enterprise seller accounts, DMS vendor partnerships

### 7.5 Trust & quality
- Month 0–6: Manual fitment auditing, seller vetting
- Month 6–12: A/B/C/D scoring exposed publicly, structured buyer feedback capture
- Month 12–24: Automated quality gates, seller coaching dashboards, fraud detection

---

## 8. Resourcing Hypothesis (Directional)

| Phase | Founder + Claude Code | Small team | External support |
|---|---|---|---|
| MVP Alpha (0–6m) | Heavy lift — founder + Claude Code + 1-2 freelancers | — | Legal, accounting, optional designer |
| MVP Beta (6–9m) | Reduced lift | 1 dev hire + 1 ops/content hire | SEO partner, content translators |
| V1 (9–15m) | Orchestration | 3–5 FTE (dev, ops, content, commercial) | Content agencies, legal |
| V2 (15–24m) | Strategic | 8–15 FTE | Scale partners |

**This is directional. Actual resourcing depends on funding path (bootstrap vs Series A) — decision outside this roadmap.**

---

## 9. Top Risks & Mitigation

| Risk | Phase exposed | Mitigation |
|---|---|---|
| Fitment accuracy below seller/buyer expectations | MVP Alpha | Strict L3 human review at launch, narrow scope to accumulate data, conservative confidence scoring |
| Seller onboarding slower than expected | MVP Alpha → Beta | eBay connector = lowest-friction path, founder-led onboarding in early months |
| Autodoc or eBay restricting AWIN / API access | MVP Beta → V1 | Diversify ingestion streams, prioritize native seller catalog share |
| MoR operational complexity | MVP Beta → V1 | Narrow MoR slice at launch, only high-score sellers, explicit logistics partnership for 3PL option |
| SEO traffic ramp slower than projected | V1 | Paid acquisition supplementation, content quality obsession, authority backlinks |
| Multi-language content quality insufficient | V1 | Native reviewer per language, not pure LLM output |
| B2B PRO complexity underestimated | V2 | Start narrow — 1 use case (quote-to-basket), expand |
| Scraping remains tempting for scope gaps | All phases | Strict policy: zero scraping in production — contractual or nothing |

---

## 10. Decision Gates

Formal go/no-go gates where the roadmap is re-evaluated:

- **Month 3** — Fitment engine technical feasibility gate: can we build accurate fitment without TecDoc at MVP?
- **Month 6** — MVP Alpha readiness gate: catalog + fitment + search quality sufficient for public launch?
- **Month 9** — Commercial viability gate: MoR unit economics validated, affiliate funnel converting?
- **Month 15** — Pan-EU readiness gate: languages, plate search, cross-border flows mature?
- **Month 24** — Scale gate: B2B PRO traction sufficient to justify Series A or continue bootstrapping?

---

*End of roadmap. Next: `03_TORQUED_MVP_BRIEF.md` — the tightly scoped build brief for Claude Code to start the MVP.*
