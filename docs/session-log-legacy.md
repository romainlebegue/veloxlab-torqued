# Legacy session log (partfinder POC era)

> Archived from CLAUDE.md on 2026-04-20 when the project pivoted from the
> "partfinder" scraping POC to the **Torqued prototype** — a clean rebuild
> aligned with `docs/04_TORQUED_PROTOTYPE_BRIEF.md`.
>
> Historical only — paths, table names, and architecture here no longer
> reflect the live repo. See the current CLAUDE.md and the 4 Torqued briefs
> (`docs/01–04_TORQUED_*.md`) for the active state.

---

## Session 1 — Project scaffold
- Monorepo initialized (pnpm workspaces + Turborepo)
- Next.js 14 App Router scaffolded in `apps/web/`
- SEO route groups: `(b2c)/pieces/`, `(b2c)/marques/`, `(b2c)/categories/`, `(b2c)/vin/`
- `packages/db`: Supabase typed client + DB types skeleton
- `packages/shared`: domain TS types (PartListing, VehicleFitment, RankingWeights)
- `packages/scraper`: BaseScraper, EbayFRScraper stub, normalize.py, SupabaseUploader, R2Uploader
- `supabase/`: migration `20240001000000_init_schema.sql` — `parts_catalog`, `fitment`, `listings` (rec_*), `cross_references`, `ranking_rules`, `price_history`, `scraper_jobs` + pg_cron
- `.claude/rules/`: database.md, scraper.md, seo.md

## Session 2 — Search API + Ranking Engine + SEO plumbing
- `supabase/functions/search-parts/`: Edge Function, fitment search + part-number lookup, Kayak grouping, delegates to rank-offers
- `supabase/functions/rank-offers/`: scoring formula from `ranking_rules`, SELLER_META, is_sponsored flag
- `apps/web/lib/search.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`
- `components/part/product-json-ld.tsx` Schema.org Product
- `app/robots.ts`, `app/sitemap.ts`, `app/api/sitemap-parts/`, `app/api/go/[source]/[id]/`

## Session 3 — UI Components
- `components/ui/rec-badge.tsx`, `sponsored-tag.tsx`, `tier-pill.tsx`
- `components/part/offer-row.tsx`, `part-card.tsx`
- `components/search/sort-tabs.tsx`, `vehicle-search-bar.tsx`
- `lib/mock-data.ts` (3 groups, 10 offers incl. 1 REC grade A)
- Home + category page wired, typecheck clean, dev on :3000

## Session 4 — Scrapers + VIN Decoder
- `scrapers/ebay_fr.py`, `autodoc.py`, `oscaro.py`
- `lib/vin.ts` local WMI decoder (no network)
- `components/search/vin-decoder.tsx`
- `app/api/decode-vin/`, `app/(b2c)/vin/[vin]/`
- `docker-compose.yml` + `packages/scraper/Dockerfile`

## Session 5 — Remaining scrapers + Admin dashboard
- `scrapers/ebay_base.py` shared parser + ebay_{fr,de,uk,es}.py
- `scrapers/rockauto.py` (XHR interception, USD→EUR)
- `scrapers/mister_auto.py` (sitemap + JSON-LD)
- `supabase/migrations/20240002000000_scraper_functions.sql`
- `apps/admin/` full: layout, KPI dashboard, ranking rules editor, scraper jobs
- `apps/admin/app/api/admin/ranking/` + `[id]/` routes

## Session 6 — Render deploy + anti-bot fixes
- Scraper moved from Railway to Render.com Cron Job ("torqued-scraper", Oregon, Docker)
- `SCRAPER_SOURCES` env var introduced
- `R2Uploader` made no-op when env vars missing (R2 never configured)
- `SupabaseUploader` switched to `SUPABASE_URL` (non-public)
- `playwright-stealth` removed (pkg_resources broken on Py 3.12) → patchright fallback
- User-Agent headers added to httpx sitemap requests
- Playwright + patchright aligned to 1.52.0
- Bot detection bypass: Playwright sitemap for Oscaro, patchright for Mister Auto

## Session 7 — POC branch + design system + rebrand
- **Rebrand to Torqued** (user-facing; internal names stayed partfinder at this point)
- Branch `poc/static-data` created, `packages/scraper/poc_run.py` one-shot runner
- New scrapers: Ovoko, Kfzteile24
- Design system: `docs/torqued-specs.md`, DM Sans + DM Mono via next/font, coral `#E8412A`, OEM/OES/IAM/CERTIFIED/USED badges
- Design tokens inlined into `apps/web/app/globals.css`
- eBay/RockAuto/AutoDoc flagged broken (bot detection / Cloudflare)

## End of partfinder era

After Session 7, the project pivoted hard. The 4 Torqued briefs landed and
replaced the partfinder POC wholesale. See `CLAUDE.md` Session 8 for what
replaced all of the above.
