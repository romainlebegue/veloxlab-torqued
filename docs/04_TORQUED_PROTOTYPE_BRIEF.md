# TORQUED — Prototype Brief for Claude Code

> **Purpose** : Build a living prototype — deployed on Vercel + Supabase, with real data, a handful of live functions, and a UX that communicates the full vision
> **This is NOT** : A production MVP. No full seller onboarding. No payment flows. No MoR operations.
> **This IS** : A demo that an investor or a seller can open, navigate, feel the product, and immediately understand what TORQUED becomes at scale
> **Stack** : Next.js 15 (App Router) + Supabase + Tailwind + shadcn/ui + Anthropic API + Vercel
> **Reference documents** : `01_TORQUED_VISION.md` (full vision), `02_TORQUED_ROADMAP.md` (phased plan), `03_TORQUED_MVP_BRIEF.md` (full MVP spec)

---

## 0. The one-sentence goal

**"In 4 weeks, anyone should be able to open torqued.vercel.app, search for a part by plate or VIN, see fitment-filtered results with real listings from real sellers, and feel that this is a serious product."**

---

## 1. What the prototype must demonstrate

### 1.1 The fitment promise

The core emotional moment: a user types a plate number or VIN, selects their vehicle, and sees **only the parts that fit** — not a generic catalogue dump. This must work end-to-end, even on a small curated dataset.

### 1.2 The multi-condition comparator

For at least one common part category (e.g. brake discs, oil filters, alternators), the results page must show the same reference available in multiple conditions — NEW IAM, REMAN, REC, USED — side by side with price, delivery estimate, seller name, and condition badge.

### 1.3 The seller tool "wow moment"

A seller-facing page (no auth required for demo) where a seller uploads a photo of a part, the AI reads the OE number, identifies the part type, suggests compatible vehicles, and proposes a pre-filled listing. The seller clicks "confirm" and the listing appears in the catalogue.

This is the moment that sells the seller value proposition to investors and potential sellers simultaneously.

### 1.4 The data richness signal

The catalogue page or a stats bar on the homepage should show real numbers: X sellers · Y SKUs · Z fitment edges · N countries covered. Even if those numbers start small, the infrastructure must be visible.

### 1.5 The "this is real" signal

Deployed on Vercel with a real domain (torqued.vercel.app or torqued.eu if available). Real Supabase project. Real seller data ingested. Not a Figma mockup, not a localhost demo.

---

## 2. Scope — what ships in the prototype

### ✅ In scope

**Public pages:**
- Homepage with search bar (plate FR + VIN + part reference)
- Vehicle selection page (confirm or disambiguate vehicle from plate/VIN result)
- Search results page — fitment-filtered, multi-condition comparator
- Part detail page — all listings for this part, condition × price × delivery × seller
- Stats bar / catalogue health dashboard (public, shows data richness)

**Seller-facing (demo mode, no auth):**
- Photo upload → AI inference → pre-filled listing form
- Listing preview before "publish"
- Simple listing gallery for a given demo seller

**Data:**
- ≥ 5 real sellers onboarded manually (CSV import or direct Supabase seed)
- ≥ 5,000 real SKUs with fitment edges (seeded from eBay imports or manual curation)
- ≥ 500 vehicle records (top FR makes/models)
- ≥ 50 OE cross-references for demo part categories
- Real photos for at least 200 listings

**Fitment:**
- L1 auto-validated from seeded fitment edges
- Plate FR lookup (SIV partner OR static mapping for top 20 demo plates)
- VIN decoder (open source, basic)

**Tech:**
- Deployed and publicly accessible on Vercel
- Supabase project with real schema (vision-ready tables, even if mostly empty)
- Anthropic API wired for photo inference (Photo AI demo)
- Mobile-responsive (investors open links on their phones)
- Fast: LCP < 3s on results page

### ❌ Out of scope for prototype

- User authentication (buyer or seller accounts)
- Real checkout or payment flows
- eBay OAuth connector (manual import for now)
- MoR operations
- Multi-language (FR only, EN strings as fallback)
- Backoffice / admin panel
- Email or notification flows
- Full SEO (robots.txt noindex for now — this is a demo, not a SEO target)
- B2B PRO module
- DMS connectors

---

## 3. Data seeding strategy

The prototype lives or dies by its data. Empty pages kill the demo.

### 3.1 Vehicles (seed first)

Seed 500 vehicles covering the top 20 FR makes/models by registration volume:
- Peugeot 208, 308, 3008, 5008
- Renault Clio, Megane, Captur, Kadjar
- Citroën C3, C4, C5 Aircross
- Volkswagen Golf, Polo, Tiguan
- Toyota Yaris, Corolla
- Ford Focus, Fiesta
- BMW Série 3, 5
- Mercedes Classe A, C

For each: make, model, variant, engine, year range, KType (if available), plate-to-VIN static mapping for 20 demo plates.

### 3.2 Part categories (curated for demo)

Pick 3 high-impact categories that cover new + reman + used naturally:
- **Brake discs** — high fitment specificity, all 4 conditions exist, high price variance
- **Alternators** — complex fitment, REMAN natural candidate, strong used market
- **Headlights** — visual impact in photos, REC/PIEC natural, cross-model compatibility stories

For each category: 50–100 SKUs with OE numbers, IAM references, fitment edges to vehicles above.

### 3.3 Sellers (5 real sellers minimum)

Manually onboard 5 sellers with real stock — ideally drawn from the existing seller network. For each:
- Display name, country, tier (A or B for demo)
- 200–500 listings with photos
- At least 1 seller per condition type (new IAM, reman, rec, used)

### 3.4 Demo plates (static mapping)

Pre-map 20 French plates to vehicles in the DB. When a user enters one of these plates, the system returns the correct vehicle instantly without needing SIV API in production. Store in a `demo_plates` table with clear labeling.

Example demo plates (fictional but plausible format):
- AB-123-CD → Peugeot 308 II 1.6 HDi 2014
- EF-456-GH → Renault Clio IV 0.9 TCe 2016
- IJ-789-KL → Volkswagen Golf VII 2.0 TDI 2015
- etc.

---

## 4. Key screens — UX intent per page

### 4.1 Homepage

**Goal:** communicate the promise in 5 seconds.

- Hero: large search bar with 3 tabs — "Plaque", "VIN", "Référence"
- Under the search: 3 visual entry points — "Freins", "Moteur", "Éclairage" (the 3 demo categories)
- Stats bar: "X pièces enrichies · Y vendeurs · Z compatibilités vérifiées"
- No hero image. No marketing copy. The product is the hero.

### 4.2 Vehicle confirmation page

After plate/VIN input, if disambiguation needed:
- Show 2–3 vehicle candidates with engine, year, body type
- User selects → stored in session (not account, just session)
- Fast: 1 click to confirm

### 4.3 Search results page

**This is the most important page.**

Layout:
- Left: filters (condition, price range, delivery, seller tier, brand)
- Center: results grouped by **part** (not by listing)
- Each part card: part name, primary photo, fitment badge ("Compatible avec votre [vehicle]"), condition tabs (NEW / REMAN / REC / USED) with price under each available condition
- Click condition tab → see listings for that condition inline
- "Voir l'offre" → part detail page

**The condition tabs are the killer feature.** If this works visually, the investor gets it immediately.

### 4.4 Part detail page

- Part identity: name, OE references, IAM references, technical attributes
- Fitment confirmation badge (colored, with confidence level)
- Comparison table: all listings sorted by total cost (price + shipping)
  - Columns: Condition · Prix · Frais de port · Franco de port · Délai · Vendeur · Score
  - "Voir l'offre" button → affiliate redirect (demo: opens a modal saying "En production, vous seriez redirigé vers le vendeur")
- Alternative conditions callout: "Aussi disponible en REC · économisez X%"

### 4.5 Photo AI demo page (seller)

URL: `/demo/seller-tool`

- "Ajoutez une pièce en 30 secondes"
- Upload zone (drag & drop or file picker)
- After upload: loading state with "Analyse en cours..." (Anthropic API call)
- Result: AI-extracted OE number, part type, compatible vehicles list, condition estimate
- Pre-filled form below with all inferred fields
- "Confirmer et publier" button → adds listing to DB (real write for demo purposes)
- After confirm: listing appears in a "Mes pièces ajoutées" gallery on same page

---

## 5. Technical implementation notes

### 5.1 Plate lookup (demo mode)

Do not attempt SIV API integration in the prototype. Use a static `demo_plates` table in Supabase. Add a visible banner: "Recherche par plaque disponible en version complète — nous utilisons ici une sélection de plaques de démonstration."

This is honest, acceptable for investors, and avoids a 3-month habilitation block.

### 5.2 Photo AI (Anthropic API)

Use Claude Vision (claude-sonnet-4-5 or higher). Prompt engineering is the key work here — the prompt must extract:
- Part category (structured JSON)
- All visible OE/IAM numbers
- Condition estimate (new / used / damaged)
- Visible brand markings

Store all inferences in a `photo_inferences` table for future training data.

Rate limit: 1 inference per 10 seconds per IP in demo mode to control costs.

### 5.3 Fitment display

For the prototype, fitment edges are seeded. The engine runs a simple query:
```sql
SELECT l.* FROM listings l
JOIN parts p ON l.part_id = p.id
JOIN fitment_edges fe ON fe.part_id = p.id
WHERE fe.vehicle_id = $vehicle_id
  AND fe.confidence >= 0.7
  AND l.status = 'active'
ORDER BY fe.confidence DESC, l.price_amount ASC
```

No complex scoring at prototype stage. Confidence threshold 0.7 hardcoded.

### 5.4 Demo data flag

Add a `is_demo` boolean on listings and sellers. In production builds, demo data is filtered out. In prototype, it is included. This prevents demo data from polluting future production catalogues.

### 5.5 Performance

- All public pages: SSR via Next.js App Router
- Images: Supabase Storage with Next.js Image optimization
- No heavy JS on initial load — results page must be server-rendered
- Target: Lighthouse ≥ 85 on mobile

---

## 6. Build sequence — 4 weeks

### Week 1 — Foundation + data

- Supabase project live (use vision-ready schema from `03_TORQUED_MVP_BRIEF.md`)
- Seed scripts: vehicles (500), demo plates (20), OE cross-refs (50k subset)
- Manual import of 5 sellers + 5,000 listings with photos
- Fitment edges seeded for 3 demo categories × top 20 vehicles
- Next.js project bootstrapped, deployed to Vercel

### Week 2 — Core search flow

- Homepage with search bar (plate + VIN + reference)
- Demo plate lookup → vehicle confirmation
- Fitment query engine (simple SQL, no scoring complexity)
- Search results page with condition tabs
- Part detail page with comparison table

### Week 3 — Photo AI + polish

- Photo AI upload flow (Anthropic API integration)
- Pre-filled listing form from AI inference
- "Publish" writes to Supabase, appears in listing gallery
- Stats bar wired to real Supabase counts
- Mobile responsive pass on all pages

### Week 4 — Demo quality bar

- 20 demo plates verified end-to-end
- At least 3 complete search journeys working (plate → vehicle → category → part → listing)
- Photo AI tested on 50 real part photos, prompt tuned
- Lighthouse audit + performance fixes
- Demo script written (5-minute investor walkthrough)
- Custom domain configured if available

---

## 7. Demo script (investor + seller walkthrough)

**Scene 1 — The buyer problem (2 min)**
Open homepage. Type demo plate "AB-123-CD". Confirm Peugeot 308. Click "Freins". Show results page — fitment badge, condition tabs. Click REC tab. "Here's where TORQUED is unique — no one in Europe shows you this view."

**Scene 2 — The comparator (1 min)**
On part detail page, show the comparison table. "OE at €180, IAM at €65, Reman at €95, Recycled at €45. Same part, compatible with your car, choose your tradeoff. Autodoc can't show you this."

**Scene 3 — The seller tool (2 min)**
Go to `/demo/seller-tool`. Upload a photo of a brake disc. Watch AI extract OE number. Show pre-filled form. "A seller adds a part in 30 seconds. We already have X sellers. Their inventory is enriched automatically."

**Scene 4 — The scale signal (30 sec)**
Back to homepage. Show stats bar. "X SKUs, Y fitment edges, Z sellers. This is the catalogue asset that compounds over time."

---

## 8. What Claude Code should do next

1. Read `01_TORQUED_VISION.md` and `03_TORQUED_MVP_BRIEF.md` fully — the schema in the MVP brief is the one to use, even for the prototype
2. Set up the Supabase project and run migrations from the vision-ready schema
3. Write seed scripts for vehicles, demo plates, demo OE cross-refs
4. Start with Week 1 items — no UI until data is in place
5. Ask before making any architectural decisions that deviate from the MVP brief schema
6. Flag immediately if any scope item in §2 seems to require more than 4 weeks — discuss tradeoffs before building

---

## 9. Definition of done for the prototype

- [ ] Publicly accessible at torqued.vercel.app (or equivalent)
- [ ] 20 demo plates work end-to-end (plate → vehicle → results)
- [ ] Results page shows fitment-filtered listings with condition tabs
- [ ] Part detail page shows comparison table with ≥ 3 conditions for at least 10 parts
- [ ] Photo AI flow works: upload → inference → pre-filled form → publish → appears in gallery
- [ ] Stats bar shows real numbers from Supabase
- [ ] Mobile responsive on all 4 core pages
- [ ] Lighthouse ≥ 85 on homepage and results page
- [ ] Demo script validated end-to-end in < 6 minutes
- [ ] No hardcoded data — everything comes from Supabase
- [ ] `is_demo` flag present on all seeded data

---

*This prototype is not the MVP. It is the proof of vision. Build it to be shown, not to be used at scale.*
