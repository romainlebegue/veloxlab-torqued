-- ============================================================
-- PartFinder.eu — Initial Schema Migration
-- Tables: vehicles, parts_catalog, fitment, listings,
--         cross_references, sellers, ranking_rules,
--         price_history, scraper_jobs
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- vehicles
-- ============================================================
CREATE TABLE vehicles (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  make        text NOT NULL,
  model       text NOT NULL,
  variant     text,
  year_from   smallint NOT NULL,
  year_to     smallint,                        -- null = still in production
  engine_code text,
  engine_cc   integer,
  fuel_type   text CHECK (fuel_type IN ('petrol','diesel','hybrid','electric','lpg')),
  kw          smallint,
  ktype_id    integer,                         -- TecDoc KType reference
  vin_prefix  text[],                          -- e.g. ARRAY['WBA','VF1']
  region      text[]                           -- e.g. ARRAY['EU','FR','DE']
);

CREATE INDEX idx_vehicles_make_model   ON vehicles (make, model, year_from, year_to);
CREATE INDEX idx_vehicles_vin_prefix   ON vehicles USING gin (vin_prefix);
CREATE INDEX idx_vehicles_ktype        ON vehicles (ktype_id);

-- ============================================================
-- Brand lookup
-- ============================================================
CREATE TABLE brands (
  id   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE
);

-- ============================================================
-- Category lookup
-- ============================================================
CREATE TABLE categories (
  id        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name      text NOT NULL,
  slug      text NOT NULL UNIQUE,
  parent_id uuid REFERENCES categories (id)
);

-- ============================================================
-- parts_catalog
-- ============================================================
CREATE TABLE parts_catalog (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number            text NOT NULL,
  part_number_normalized text NOT NULL,
  name                   text NOT NULL,
  category_id            uuid REFERENCES categories (id),
  part_type              text NOT NULL CHECK (
                           part_type IN ('NEW_OEM','NEW_OES','NEW_IAM','USED','REMAN','REC','MOTO')
                         ),
  brand_id               uuid REFERENCES brands (id),
  is_moto                boolean NOT NULL DEFAULT false,
  tecdoc_article_id      text,
  ean                    text[]
);

CREATE INDEX idx_parts_pn_normalized ON parts_catalog (part_number_normalized);

-- ============================================================
-- fitment  (part ↔ vehicle — the core moat)
-- ============================================================
CREATE TABLE fitment (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id             uuid NOT NULL REFERENCES parts_catalog (id) ON DELETE CASCADE,
  vehicle_id          uuid NOT NULL REFERENCES vehicles (id) ON DELETE CASCADE,
  position            text,              -- 'front-left', 'rear', 'all'
  fitment_notes       text,
  fitment_attributes  jsonb,             -- {axle, side, drive_type}
  source              text NOT NULL CHECK (source IN ('TECDOC','MANUAL','SCRAPED')),
  confidence_score    real NOT NULL DEFAULT 1.0 CHECK (confidence_score BETWEEN 0 AND 1),
  verified_at         timestamptz
);

CREATE INDEX idx_fitment_part    ON fitment (part_id);
CREATE INDEX idx_fitment_vehicle ON fitment (vehicle_id);

-- ============================================================
-- sellers
-- ============================================================
CREATE TABLE sellers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text NOT NULL UNIQUE,
  seller_type     text NOT NULL CHECK (
                    seller_type IN ('DEALER','DISMANTLER','MARKETPLACE','PRIVATE')
                  ),
  country         text NOT NULL,
  verified        boolean NOT NULL DEFAULT false,
  b2b_eligible    boolean NOT NULL DEFAULT false,
  scraper_config  jsonb,
  last_crawled_at timestamptz
);

-- ============================================================
-- listings  (live inventory from scrapers)
-- ============================================================
CREATE TABLE listings (
  id                  text PRIMARY KEY,      -- sha1(source:external_id)
  source              text NOT NULL,
  external_id         text NOT NULL,
  url                 text NOT NULL,
  title               text NOT NULL,
  part_number         text,
  brand               text,
  condition           text NOT NULL CHECK (condition IN ('NEW','USED','REMAN','REC')),
  condition_grade     text CHECK (condition_grade IN ('A','B','C')),
  part_type           text NOT NULL CHECK (
                        part_type IN ('NEW_OEM','NEW_OES','NEW_IAM','USED','REMAN','REC','MOTO')
                      ),
  price               numeric(10,2) NOT NULL,
  currency            text NOT NULL DEFAULT 'EUR',
  price_eur           numeric(10,2) NOT NULL,
  shipping_cost_eur   numeric(8,2),
  shipping_to         text[],
  seller_name         text,
  seller_country      text,
  location_country    text,
  location_city       text,
  fitment_raw         text,
  vehicle_make        text,
  vehicle_model       text,
  vehicle_years       text,
  image_urls          text[],              -- R2 URLs after re-hosting
  stock_qty           integer,
  warranty_months     smallint,
  -- REC certification fields
  is_rec              boolean NOT NULL DEFAULT false,
  rec_grade           text CHECK (rec_grade IN ('A','B')),
  rec_donor_vin       text,
  rec_donor_km        integer,
  rec_dismantler      text,
  rec_dismantler_cert text,               -- e.g. 'VHU-FR-044-2019'
  rec_recall_check    boolean,
  -- Meta
  is_active           boolean NOT NULL DEFAULT true,
  scraped_at          timestamptz,
  last_seen_at        timestamptz,
  -- Constraint: REC listings must have donor VIN
  CONSTRAINT rec_requires_donor_vin CHECK (
    NOT is_rec OR rec_donor_vin IS NOT NULL
  ),
  -- Constraint: source:external_id must be unique
  UNIQUE (source, external_id)
);

CREATE INDEX idx_listings_active_price ON listings (is_active, price_eur);
CREATE INDEX idx_listings_source       ON listings (source);
CREATE INDEX idx_listings_part_number  ON listings (part_number) WHERE part_number IS NOT NULL;

-- ============================================================
-- cross_references  (OEM ↔ OES ↔ IAM equivalencies)
-- ============================================================
CREATE TABLE cross_references (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id              uuid NOT NULL REFERENCES parts_catalog (id) ON DELETE CASCADE,
  ref_number           text NOT NULL,
  ref_number_normalized text NOT NULL,
  brand_id             uuid REFERENCES brands (id),
  ref_type             text NOT NULL CHECK (ref_type IN ('OEM','OES','IAM','EAN','TECDOC'))
);

CREATE INDEX idx_xref_ref_brand ON cross_references (ref_number_normalized, brand_id);

-- ============================================================
-- ranking_rules  (editable without redeploy)
-- ============================================================
CREATE TABLE ranking_rules (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source          text NOT NULL DEFAULT '*',
  checkout_type   text NOT NULL CHECK (checkout_type IN ('direct','affiliate','cpc','organic')),
  weight_checkout real NOT NULL DEFAULT 4.0,
  weight_boost    real NOT NULL DEFAULT 1.0,
  weight_quality  real NOT NULL DEFAULT 1.0,
  weight_eco      real NOT NULL DEFAULT 2.0,   -- REC bonus
  weight_price    real NOT NULL DEFAULT 3.0,
  weight_shipping real NOT NULL DEFAULT 1.0,
  is_active       boolean NOT NULL DEFAULT true,
  valid_from      timestamptz,
  valid_to        timestamptz,
  notes           text
);

-- Seed default ranking rules
INSERT INTO ranking_rules (source, checkout_type, weight_checkout, notes) VALUES
  ('*', 'direct',    10.0, 'Default: direct checkout max margin'),
  ('*', 'affiliate',  4.0, 'Default: affiliate rev share'),
  ('*', 'cpc',        2.0, 'Default: cost-per-click'),
  ('*', 'organic',    0.0, 'Default: no commercial agreement');

-- ============================================================
-- price_history  (time-series)
-- ============================================================
CREATE TABLE price_history (
  listing_id  text NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
  price_eur   numeric(10,2) NOT NULL,
  stock_qty   integer,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, recorded_at)
);

CREATE INDEX idx_price_history_listing ON price_history (listing_id, recorded_at DESC);

-- ============================================================
-- scraper_jobs  (agent job queue)
-- ============================================================
CREATE TABLE scraper_jobs (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id      uuid REFERENCES sellers (id),
  job_type       text NOT NULL CHECK (job_type IN ('FULL_CRAWL','DELTA','PRICE_UPDATE')),
  status         text NOT NULL DEFAULT 'PENDING' CHECK (
                   status IN ('PENDING','RUNNING','DONE','FAILED')
                 ),
  listings_found integer,
  listings_new   integer,
  error_log      jsonb,
  started_at     timestamptz,
  completed_at   timestamptz,
  next_run_at    timestamptz
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_catalog  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitment        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_references ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key)
CREATE POLICY "public_read_listings"       ON listings       FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_parts_catalog"  ON parts_catalog  FOR SELECT USING (true);
CREATE POLICY "public_read_fitment"        ON fitment        FOR SELECT USING (true);
CREATE POLICY "public_read_vehicles"       ON vehicles       FOR SELECT USING (true);
CREATE POLICY "public_read_cross_refs"     ON cross_references FOR SELECT USING (true);

-- ============================================================
-- pg_cron scraper schedule (staggered by 15min)
-- ============================================================
SELECT cron.schedule('ebay-fr',  '0 2 * * *',  $$ CALL trigger_scraper('ebay_fr')  $$);
SELECT cron.schedule('ebay-de',  '15 2 * * *', $$ CALL trigger_scraper('ebay_de')  $$);
SELECT cron.schedule('ebay-uk',  '30 2 * * *', $$ CALL trigger_scraper('ebay_uk')  $$);
SELECT cron.schedule('ebay-es',  '45 2 * * *', $$ CALL trigger_scraper('ebay_es')  $$);
SELECT cron.schedule('rockauto', '0 3 * * *',  $$ CALL trigger_scraper('rockauto') $$);
SELECT cron.schedule('autodoc',  '0 4 * * *',  $$ CALL trigger_scraper('autodoc')  $$);
