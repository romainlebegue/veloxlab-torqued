-- ============================================================
-- TORQUED — Prototype schema (vision-ready)
-- Date: 2026-04-20
-- Reference: docs/03_TORQUED_MVP_BRIEF.md §3
--
-- Build for the vision, activate for the prototype.
-- Tables are shaped for V3. At prototype many columns stay null.
-- No `users` table yet (no auth in prototype) — seller.user_id and
-- fitment_edges.validated_by are nullable UUIDs without FK for now.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- Clean any partfinder POC artifacts left in the remote database.
-- Safe to keep in later runs — DROP ... IF EXISTS is a no-op once gone.
-- ============================================================
DROP TABLE IF EXISTS public.price_history    CASCADE;
DROP TABLE IF EXISTS public.scraper_jobs     CASCADE;
DROP TABLE IF EXISTS public.ranking_rules    CASCADE;
DROP TABLE IF EXISTS public.cross_references CASCADE;
DROP TABLE IF EXISTS public.listings         CASCADE;
DROP TABLE IF EXISTS public.fitment          CASCADE;
DROP TABLE IF EXISTS public.parts_catalog    CASCADE;
DROP TABLE IF EXISTS public.sellers          CASCADE;
DROP TABLE IF EXISTS public.categories       CASCADE;
DROP TABLE IF EXISTS public.brands           CASCADE;
DROP TABLE IF EXISTS public.vehicles         CASCADE;

-- ============================================================
-- ENUMs
-- ============================================================

CREATE TYPE vehicle_type AS ENUM (
  'car',
  'light_commercial',
  'motorcycle',
  'truck',
  'boat',
  'agricultural',
  'other'
);

CREATE TYPE part_condition AS ENUM (
  'new_oe',        -- OE original equipment
  'new_oes',       -- OES — same manufacturer, non-OE branded
  'new_iam',       -- Independent aftermarket
  'reman',         -- Remanufactured
  'rec_traced',    -- Recycled with traceability (PIEC)
  'used_untraced'  -- Used without formal traceability
);

CREATE TYPE fitment_source AS ENUM (
  'tecdoc_direct',
  'ebay_epid',
  'oe_cross_reference',
  'ai_photo_inference',
  'human_validated',
  'seller_declared',
  'community_reported'
);

CREATE TYPE governance_level AS ENUM (
  'L1_auto',
  'L2_ai',
  'L3_human',
  'L4_community'
);

CREATE TYPE seller_tier AS ENUM ('A', 'B', 'C', 'D', 'unranked');
CREATE TYPE seller_status AS ENUM ('pending', 'active', 'suspended', 'archived');

CREATE TYPE listing_status AS ENUM (
  'draft',
  'pending_review',
  'active',
  'paused',
  'archived'
);

CREATE TYPE ingestion_source AS ENUM (
  'ebay_connector',
  'linnworks',
  'native_import',
  'external_affiliate_feed',
  'dms_connector'
);

-- ============================================================
-- categories (hierarchical taxonomy)
-- ============================================================

CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  uuid REFERENCES categories(id) ON DELETE SET NULL,
  slug       text UNIQUE NOT NULL,
  name       text NOT NULL,
  name_i18n  jsonb NOT NULL DEFAULT '{}'::jsonb,
  depth      smallint NOT NULL DEFAULT 0,
  path       text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories USING GIN (path);

-- ============================================================
-- vehicles (canonical vehicle identification, all vehicle_types)
-- ============================================================

CREATE TABLE vehicles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type      vehicle_type NOT NULL DEFAULT 'car',
  make              text NOT NULL,
  model             text NOT NULL,
  variant           text,
  engine_code       text,
  engine_cc         integer,
  engine_kw         integer,
  engine_hp         integer,
  fuel_type         text CHECK (fuel_type IN ('petrol','diesel','hybrid','electric','lpg','cng','other')),
  body_type         text,
  year_from         smallint,
  year_to           smallint,
  ktype_nr          integer,                         -- TecDoc KType
  manufacturer_code text,
  slug              text UNIQUE NOT NULL,
  display_name      text,
  primary_markets   text[] NOT NULL DEFAULT ARRAY['fr','de','uk','pl'],
  data_source       text,                            -- 'tecalliance', 'manual', 'ebay_import'
  confidence        numeric(3,2) NOT NULL DEFAULT 1.0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_ktype ON vehicles(ktype_nr);

-- ============================================================
-- parts (canonical parts catalog, OE + IAM references)
-- ============================================================

CREATE TABLE parts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oe_numbers           text[] NOT NULL DEFAULT ARRAY[]::text[],
  iam_numbers          text[] NOT NULL DEFAULT ARRAY[]::text[],
  category_id          uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory          text,
  display_name         text NOT NULL,
  display_name_i18n    jsonb NOT NULL DEFAULT '{}'::jsonb,
  technical_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  primary_image_url    text,
  slug                 text UNIQUE NOT NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_parts_oe ON parts USING GIN (oe_numbers);
CREATE INDEX idx_parts_iam ON parts USING GIN (iam_numbers);
CREATE INDEX idx_parts_category ON parts(category_id);
CREATE INDEX idx_parts_display_name_trgm ON parts USING GIN (display_name gin_trgm_ops);

-- ============================================================
-- sellers
-- ============================================================

CREATE TABLE sellers (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid,                       -- FK to users(id) — added when auth ships
  display_name           text NOT NULL,
  legal_name             text,
  country_code           text NOT NULL,
  vat_number             text,
  tier                   seller_tier NOT NULL DEFAULT 'unranked',
  fitment_accuracy_rate  numeric(4,3),
  return_rate            numeric(4,3),
  response_time_hours    numeric(6,2),
  transaction_count      integer NOT NULL DEFAULT 0,
  mor_eligible           boolean NOT NULL DEFAULT false,
  mor_activated_at       timestamptz,
  status                 seller_status NOT NULL DEFAULT 'pending',
  onboarded_at           timestamptz,
  ebay_connected         boolean NOT NULL DEFAULT false,
  ebay_user_id           text,
  ebay_connection_meta   jsonb,
  linnworks_connected    boolean NOT NULL DEFAULT false,
  is_demo                boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_tier ON sellers(tier);

-- ============================================================
-- listings (concrete offers from sellers, tied to parts)
-- ============================================================

CREATE TABLE listings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id               uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  part_id                 uuid REFERENCES parts(id) ON DELETE SET NULL,
  ingestion_source        ingestion_source NOT NULL,
  source_external_id      text,
  source_url              text,
  condition               part_condition NOT NULL,
  price_amount            numeric(10,2) NOT NULL,
  price_currency          text NOT NULL DEFAULT 'EUR',
  shipping_fee            numeric(10,2),
  free_shipping_threshold numeric(10,2),
  delivery_lead_days_min  smallint,
  delivery_lead_days_max  smallint,
  stock_quantity          integer NOT NULL DEFAULT 0,
  stock_status            text NOT NULL DEFAULT 'unknown',
  title                   text NOT NULL,
  title_i18n              jsonb NOT NULL DEFAULT '{}'::jsonb,
  description             text,
  description_i18n        jsonb NOT NULL DEFAULT '{}'::jsonb,
  media                   jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{url, alt, order}]
  status                  listing_status NOT NULL DEFAULT 'pending_review',
  fitment_resolved        boolean NOT NULL DEFAULT false,
  checkout_path           text NOT NULL DEFAULT 'affiliate' CHECK (checkout_path IN ('affiliate','mor')),
  affiliate_deep_link     text,
  is_demo                 boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, ingestion_source, source_external_id)
);

CREATE INDEX idx_listings_part ON listings(part_id) WHERE status = 'active';
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_condition ON listings(condition) WHERE status = 'active';

-- ============================================================
-- fitment_edges (the heart of the product)
-- ============================================================

CREATE TABLE fitment_edges (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id           uuid NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  vehicle_id        uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  source            fitment_source NOT NULL,
  governance_level  governance_level NOT NULL,
  confidence        numeric(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  evidence          jsonb NOT NULL DEFAULT '{}'::jsonb,
  validated_by      uuid,                        -- FK to users(id) — added when auth ships
  validated_at      timestamptz,
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (part_id, vehicle_id, source)
);

CREATE INDEX idx_fitment_part ON fitment_edges(part_id) WHERE active = true;
CREATE INDEX idx_fitment_vehicle ON fitment_edges(vehicle_id) WHERE active = true;
CREATE INDEX idx_fitment_confidence ON fitment_edges(confidence) WHERE active = true;

-- ============================================================
-- listing_vehicle_applicability (denormalized lookup for search)
-- ============================================================

CREATE TABLE listing_vehicle_applicability (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id             uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  vehicle_id             uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  aggregated_confidence  numeric(3,2) NOT NULL,
  display_tier           governance_level NOT NULL,
  UNIQUE (listing_id, vehicle_id)
);

CREATE INDEX idx_lva_vehicle_tier ON listing_vehicle_applicability(vehicle_id, display_tier, aggregated_confidence);
CREATE INDEX idx_lva_listing ON listing_vehicle_applicability(listing_id);

-- ============================================================
-- oe_cross_references (OE number equivalencies, many-to-many)
-- ============================================================

CREATE TABLE oe_cross_references (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oe_number             text NOT NULL,
  equivalent_oe_number  text NOT NULL,
  distance              smallint NOT NULL DEFAULT 1,
  source                fitment_source NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (oe_number, equivalent_oe_number)
);

CREATE INDEX idx_oe_xref_lookup ON oe_cross_references(oe_number);
CREATE INDEX idx_oe_xref_reverse ON oe_cross_references(equivalent_oe_number);

-- ============================================================
-- photo_inferences (Claude Vision responses)
-- ============================================================

CREATE TABLE photo_inferences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       uuid REFERENCES sellers(id) ON DELETE SET NULL,
  photo_url       text NOT NULL,
  photo_checksum  text,                           -- sha256 for dedup
  model           text NOT NULL,                  -- 'claude-sonnet-4-5', 'claude-haiku-4-5'
  prompt_version  text NOT NULL DEFAULT 'v1',
  raw_response    jsonb NOT NULL,
  parsed          jsonb NOT NULL,                 -- PhotoInferenceResult shape
  confidence      numeric(3,2),
  matched_part_id uuid REFERENCES parts(id) ON DELETE SET NULL,
  listing_id      uuid REFERENCES listings(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_photo_inferences_checksum ON photo_inferences(photo_checksum);
CREATE INDEX idx_photo_inferences_seller ON photo_inferences(seller_id);

-- ============================================================
-- demo_plates (static FR plate → vehicle mapping for prototype)
-- Reference: docs/04_TORQUED_PROTOTYPE_BRIEF.md §5.1
-- ============================================================

CREATE TABLE demo_plates (
  plate         text PRIMARY KEY,                 -- 'AB-123-CD'
  country_code  text NOT NULL DEFAULT 'FR',
  vehicle_id    uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_plates_vehicle ON demo_plates(vehicle_id);

-- ============================================================
-- plate_lookups (cache for real plate APIs — GDPR-safe, hashed)
-- ============================================================

CREATE TABLE plate_lookups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_hash    text NOT NULL,                    -- sha256(plate || salt)
  country_code  text NOT NULL,
  vehicle_id    uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  match_confidence numeric(3,2),
  resolved_at   timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  UNIQUE (plate_hash, country_code)
);

CREATE INDEX idx_plate_lookups_expires ON plate_lookups(expires_at);

-- ============================================================
-- Row Level Security
-- Anon role: public catalog read. Service role: full access.
-- ============================================================

ALTER TABLE vehicles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitment_edges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_vehicle_applicability ENABLE ROW LEVEL SECURITY;
ALTER TABLE oe_cross_references          ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_inferences             ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_plates                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plate_lookups                ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "anon_read_vehicles"                  ON vehicles                     FOR SELECT USING (true);
CREATE POLICY "anon_read_categories"                ON categories                   FOR SELECT USING (true);
CREATE POLICY "anon_read_parts"                     ON parts                        FOR SELECT USING (true);
CREATE POLICY "anon_read_sellers_active"            ON sellers                      FOR SELECT USING (status = 'active');
CREATE POLICY "anon_read_listings_active"           ON listings                     FOR SELECT USING (status = 'active');
CREATE POLICY "anon_read_fitment_edges_active"      ON fitment_edges                FOR SELECT USING (active = true);
CREATE POLICY "anon_read_lva"                       ON listing_vehicle_applicability FOR SELECT USING (true);
CREATE POLICY "anon_read_oe_xref"                   ON oe_cross_references          FOR SELECT USING (true);
CREATE POLICY "anon_read_demo_plates"               ON demo_plates                  FOR SELECT USING (true);

-- photo_inferences and plate_lookups: service role only (no anon policy)

-- ============================================================
-- updated_at trigger helper
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicles_updated      BEFORE UPDATE ON vehicles      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_parts_updated         BEFORE UPDATE ON parts         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sellers_updated       BEFORE UPDATE ON sellers       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_listings_updated      BEFORE UPDATE ON listings      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fitment_edges_updated BEFORE UPDATE ON fitment_edges FOR EACH ROW EXECUTE FUNCTION set_updated_at();
