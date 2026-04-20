# Torqued — Claude Code project brief

> **Source of truth** = the 4 briefs in `docs/`:
> `01_TORQUED_VISION.md`, `02_TORQUED_ROADMAP.md`, `03_TORQUED_MVP_BRIEF.md`, `04_TORQUED_PROTOTYPE_BRIEF.md`.
> This file is a working memo. **If it ever conflicts with the briefs, the briefs win** — update CLAUDE.md to match, never the other way around.
> Legacy POC history: `docs/session-log-legacy.md`.

---

## Current stage

Prototype — a 4-week deployable demo per `docs/04_TORQUED_PROTOTYPE_BRIEF.md`.
Not the MVP. Not production. A proof of vision.

Sprint 0 (foundation) complete. Sprint 1 (data + homepage, Week 1 of the proto brief) is next.

---

## Three non-negotiables

From `docs/03_TORQUED_MVP_BRIEF.md §0`:

1. **Build for the vision, activate for the prototype.** Schema is V3-ready. Many columns will stay null; many UIs will stay hidden. Never simplify the data model "to match current scope".
2. **Zero scraping in production.** Data flows are contractual: manual seed and CSV import now, eBay OAuth from M2.
3. **Fitment is the product.** Every decision that affects fitment accuracy is first-order. See MVP brief §4.

---

## Stack actually in use

| Layer | Choice | Note |
|---|---|---|
| Frontend | Next.js **14.2.35** App Router | Proto brief says 15; we stayed on 14 to skip async params migration. Revisit later. |
| Styling | Tailwind + shadcn/ui | Torqued design tokens live in `apps/web/app/globals.css` + `tokens.css` — kept alongside shadcn CSS vars. |
| Database | Supabase Postgres | Migration: `supabase/migrations/20260420000000_torqued_schema.sql`. No live project provisioned yet. |
| AI | Anthropic SDK via `@torqued/ai` | Claude Vision for photo inference (MVP brief §4.4). |
| Deploy | Vercel (web) + Supabase (db) | Nothing deployed yet. |

---

## Monorepo layout

```
partfinder/                      (dir name kept; pnpm root name is `torqued`)
├── apps/
│   └── web/                     @torqued/web — Next.js public site
├── packages/
│   ├── ai/                      @torqued/ai — Anthropic wrappers + prompt templates
│   ├── connectors/              @torqued/connectors — ingestion adapter interfaces
│   ├── db/                      @torqued/db — Supabase client, types, seed runner
│   │   └── src/seed/            categories.ts, vehicles.ts, sellers.ts, demo-plates.ts, index.ts
│   ├── fitment/                 @torqued/fitment — FitmentEngine interface + SQL impl
│   ├── shared/                  @torqued/shared — domain types
│   └── ui/                      @torqued/ui — cross-app UI (stub; backoffice later)
├── supabase/
│   ├── config.toml              project_id = "torqued"
│   ├── migrations/              one migration so far (20260420)
│   └── functions/               (empty; Edge Functions go here when needed)
├── docs/                        Torqued briefs (authoritative) + legacy session log
└── Brief/                       user's source copy of the 4 briefs — do not mirror into docs/
```

`apps/backoffice/` will land when seller/admin dashboards are needed. Out of scope for the prototype.

---

## Schema

One migration (`supabase/migrations/20260420000000_torqued_schema.sql`) creates:

- **Enums** (8): `vehicle_type`, `part_condition` (6 values: new_oe/new_oes/new_iam/reman/rec_traced/used_untraced), `fitment_source` (7), `governance_level` (L1–L4), `seller_tier`, `seller_status`, `listing_status`, `ingestion_source`.
- **Tables** (11): `categories`, `vehicles`, `parts`, `sellers`, `listings`, `fitment_edges`, `listing_vehicle_applicability`, `oe_cross_references`, `photo_inferences`, `demo_plates`, `plate_lookups`.
- Public SELECT RLS on catalog tables; write access via service role only.
- `updated_at` trigger on mutable tables.

**Full column-level spec lives in `docs/03_TORQUED_MVP_BRIEF.md §3`.** Don't duplicate it here — read the brief.

TypeScript types: `packages/db/types.ts` — hand-crafted to match the migration. Regenerate with `supabase gen types typescript --local` once the project is live.

No `users` table yet (no auth in the proto). `sellers.user_id` and `fitment_edges.validated_by` are nullable UUIDs without FK until auth ships at MVP Alpha.

---

## Commands

```bash
pnpm install                              # root
pnpm --filter @torqued/web dev            # Next.js on :3000
pnpm --filter @torqued/web build          # production build
pnpm -r typecheck                         # workspace-wide tsc --noEmit
pnpm --filter @torqued/db seed            # run seed against Supabase (env required)
```

No global `pnpm`? Use `npx pnpm@10.28.0 <cmd>`. `corepack enable` fails on this Windows setup with EPERM on `pnpx`; stick to `npx pnpm@...`.

---

## Prototype scope (quick reference)

Full spec in `docs/04_TORQUED_PROTOTYPE_BRIEF.md §2`.

**In scope:** homepage with plate/VIN/reference search, vehicle confirmation, results page with condition tabs, part detail comparator, `/demo/seller-tool` photo AI flow, stats bar. ≥ 5 demo sellers, ≥ 5 000 SKUs, ≥ 500 vehicles, 20 demo plates. 3 curated categories: brake discs / alternators / headlights.

**Out of scope:** auth, real checkout, eBay OAuth, MoR, multi-language, backoffice, full SEO (robots `noindex` for the proto), B2B PRO, DMS connectors.

---

## Naming conventions

| Context | Convention |
|---|---|
| DB tables / columns | `snake_case` |
| TS files | `kebab-case.tsx` |
| TS types / interfaces | `PascalCase` |
| TS functions | `camelCase` |
| URL slugs | `kebab-case` lowercase, ASCII only (é→e, ü→u) |
| Env vars | `UPPER_SNAKE_CASE` |
| Git branches | `prototype/…`, `feat/…`, `fix/…`, `chore/…` |

---

## Environment

Copy `.env.example` to `.env.local`. Minimum to run the seed: `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`. Photo AI demo requires `ANTHROPIC_API_KEY`.

Rules:
- Never commit `.env*` (covered in `.gitignore`).
- `SUPABASE_SERVICE_KEY` is server-only. Never import in a Client Component or pass to the browser.
- For scripts (seed, workers), prefer `SUPABASE_URL`. For Next.js, `NEXT_PUBLIC_SUPABASE_URL` is the browser-reachable variant. `createAdminClient()` accepts either.

---

## What NOT to do

- **No scrapers.** Brief §0 rule #2. All ingestion is contractual: manual seed → eBay OAuth → DMS connectors.
- **No `any`.** Use `unknown` + type guards. Exception flagged in code: `packages/db/src/seed/index.ts` uses an untyped `SupabaseClient` because the hand-crafted `Database` type tripped generic inference. Revisit when `supabase gen types` replaces the hand-crafted file.
- **No `SELECT *`.** Name columns.
- **Don't duplicate brief content into CLAUDE.md.** Cross-link instead. If the brief changes, CLAUDE.md drifts — always check.
- **Don't reuse old schema names** (`parts_catalog`, `fitment`, `ranking_rules`, `rec_*` columns). They're gone. New names are in the migration above.
- **Don't add features "for future vision".** Build shapes — nullable columns, typed interfaces, empty tables. Activation comes with the phase that needs them.
- **No `console.log` in committed code.** Structured logging when we add it; stick to explicit `console.error` in scripts for now.

---

## Current branch

`prototype/torqued-v1` off `main`. The POC branch `poc/static-data` is abandoned (checkpoint of the old partfinder scraping POC, kept for history).

---

## Session log

### Session 8 — Torqued prototype reset (2026-04-20)

Sprint 0 — structural foundation. Seven PR-sized chunks, no commits yet.

- **PR-01** — saved 4 briefs under `docs/` (sources live in `Brief/`), created `prototype/torqued-v1` from `main`.
- **PR-02** — deleted the partfinder POC: `packages/scraper/` (all Python), `apps/admin/`, both old Supabase migrations, both old Edge Functions (`search-parts`, `rank-offers`), `docker-compose.yml`, POC web routes (`(b2c)`, `(b2b)`, `api/`, `robots.ts`, `sitemap.ts`), POC UI components.
- **PR-03** — renamed `@partfinder/*` → `@torqued/*` across packages and imports; root `package.json` name `partfinder` → `torqued`. Directory stays `partfinder/`. `pnpm-lock.yaml` regenerated on the next install.
- **PR-04** (merged with what was originally PR-05) — scaffolded `packages/ai`, `packages/connectors`, `packages/fitment`, `packages/ui`; added shadcn bootstrap to `apps/web` (`components.json` + `lib/utils.ts` + `clsx`/`tailwind-merge`/`class-variance-authority`/`lucide-react`); added `@anthropic-ai/sdk` in `@torqued/ai`; dropped the Next 15 migration (pure ceremony for the proto).
- **PR-05** — fresh single migration `supabase/migrations/20260420000000_torqued_schema.sql` (8 enums, 11 tables, indexes, RLS, `updated_at` trigger); `packages/db/types.ts` rewritten to match; `supabase/config.toml` unstuck from `supabase/supabase/` nested path; `project_id = "torqued"`.
- **PR-06** — `packages/db/src/seed/` runner: `categories.ts` populated (6 rows, 2-level hierarchy for the 3 demo categories); `vehicles.ts`, `sellers.ts`, `demo-plates.ts` scaffolded empty, awaiting Sprint 1 data; `.env.example` at root; `pnpm --filter @torqued/db seed` script wired via `tsx`.

Sprint 0 exit state: `pnpm install` ✅, `pnpm -r typecheck` ✅, `pnpm --filter @torqued/web build` ✅. Homepage is a placeholder. Nothing committed yet.

**Next — Sprint 1 (Week 1 of proto brief):**
1. Provision Supabase EU project, push migration, regenerate `types.ts` from live DB.
2. Populate `vehicles.ts` (500 FR), `sellers.ts` (5 demo sellers, one per condition type), `demo-plates.ts` (20 FR plates).
3. Seed `parts` + `listings` + `fitment_edges` for brake-discs / alternators / headlights.
4. Build the real homepage per proto brief §4.1 (3-tab search, stats bar, category entry points).

*Last updated: 2026-04-20 — Session 8, Sprint 0 complete.*
