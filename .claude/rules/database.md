# Database conventions (Supabase / PostgreSQL)

## Core rules
- Never use `SELECT *` — always specify column names
- Never rename primary tables without updating ALL references (types.ts, migrations, scrapers)
- Always run `supabase gen types typescript --local > packages/db/types.ts` after each migration
- Migrations are append-only — never edit an existing migration file

## Part number handling
- Always store both `part_number` (raw) and `part_number_normalized` (via `normalize_part_number()`)
- `normalize_part_number` strips spaces, dashes, dots, brand prefixes → uppercase

## Fitment confidence
- TecDoc/MANUAL data → confidence_score = 1.0
- Scraped fitment → confidence_score < 0.8 (default: 0.7)
- Only show scraped fitment in UI once manually verified (verified_at IS NOT NULL)

## REC constraints
- `is_rec = true` requires `rec_donor_vin` (enforced by DB constraint)
- Grade C is never published — only store A and B
- `rec_recall_check = false` → do not publish listing

## Listing primary key
- `listings.id = sha1(source:external_id)` — computed in Python, not DB
- Upsert on conflict using `ON CONFLICT (id) DO UPDATE`

## Currency
- Always normalize to `price_eur` at scrape time using `FX_TO_EUR` dict
- `currency` stores original currency for display

## Indexes
- Add indexes explicitly in migrations — do not rely on implicit indexes
- See `20240001000000_init_schema.sql` for canonical index list

## RLS
- `anon` role: SELECT only on listings (where is_active=true), parts_catalog, fitment, vehicles
- `service_role`: full access — used only in scraper and Edge Functions
- Never expose service_role key to client-side code
