# Database conventions (Supabase / PostgreSQL)

Canonical schema: `supabase/migrations/20260420000000_torqued_schema.sql`.
Spec per column: `docs/03_TORQUED_MVP_BRIEF.md §3`. If this file conflicts with either, those win.

## Core rules
- Never use `SELECT *` — always name columns.
- Never rename the core tables (`vehicles`, `parts`, `categories`, `sellers`, `listings`, `fitment_edges`, `listing_vehicle_applicability`, `oe_cross_references`, `photo_inferences`, `demo_plates`, `plate_lookups`) without updating the migration, `packages/db/types.ts`, and every TS consumer.
- Every migration is append-only. Don't edit an existing migration file; write a new one.
- After any migration that changes `public.*`, regenerate `packages/db/types.ts` with `supabase gen types typescript --local`.

## OE / IAM references
- `parts.oe_numbers` and `parts.iam_numbers` are `text[]`. Store normalized uppercase numbers (strip spaces / dashes / dots / brand prefixes). Example: `"34 11 6 792 217"` → `"34116792217"`.
- Do the normalization in application code before insert. No trigger.
- `oe_cross_references` carries many-to-many OE equivalencies with a `distance` hop count.

## Fitment confidence (MVP brief §4.2)
- `tecdoc_direct` → `confidence = 1.0`, `governance_level = 'L1_auto'`
- `ebay_epid` → `0.9`, `L1_auto`
- `oe_cross_reference` (distance ≤ 1) → `0.85`, `L1_auto`
- `ai_photo_inference` (model conf ≥ 0.85) → `0.75`, `L2_ai` (UI badge "inferred")
- `human_validated` → `0.9`, `L3_human`
- `community_reported` (≥ 3 confirmations) → gradient `0.6` → `0.95`, `L4_community`
- Multiple edges per `(part, vehicle)` are fine — aggregated confidence is `max()`, not average. We publish the best evidence.

## Listings
- Primary key is a generated `uuid`. Dedup uniqueness: `UNIQUE (seller_id, ingestion_source, source_external_id)`.
- Only `status = 'active'` listings are public (RLS).
- `condition` is the 6-value enum: `new_oe / new_oes / new_iam / reman / rec_traced / used_untraced`. REC data that was embedded in the old partfinder `listings` table is gone — recycled parts are just `rec_traced` now, with provenance stored in the `evidence` JSON of their fitment edges if relevant.
- `is_demo = true` on every prototype seed. Production builds filter it out.

## Checkout path
- `listings.checkout_path` ∈ `{'affiliate','mor'}`. Default `affiliate`.
- MoR is inactive at the prototype stage. The column exists so we don't backfill later.

## Currency
- Store transacted currency in `price_currency`, the amount in `price_amount`. FX conversion happens at display time — not stored redundantly.
- No `price_eur` column. If you find yourself wanting one, revisit with the team.

## RLS
- `anon` role: SELECT only on public catalog tables — `vehicles`, `categories`, `parts`, `oe_cross_references`, `demo_plates`, `listing_vehicle_applicability`, `fitment_edges` where `active`, `listings` where `status='active'`, `sellers` where `status='active'`.
- `photo_inferences` and `plate_lookups` have no anon policy — service role only.
- Never expose `SUPABASE_SERVICE_KEY` client-side. Service-role bypass of RLS is how the seed runner and Edge Functions write.

## Updated-at
- `set_updated_at()` trigger fires on `vehicles / parts / sellers / listings / fitment_edges`. Other tables are either immutable (`oe_cross_references`, `demo_plates`) or not worth the overhead at prototype scale.
