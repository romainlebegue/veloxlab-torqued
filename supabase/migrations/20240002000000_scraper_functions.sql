-- ============================================================
-- PartFinder.eu — Scraper support functions
-- ============================================================

-- ============================================================
-- trigger_scraper()
-- Called by pg_cron jobs. Creates a PENDING scraper_job row,
-- then notifies the Railway scraper via pg_notify.
-- The scraper listens on the 'scraper_jobs' channel and picks up
-- the job_id to execute.
-- ============================================================
CREATE OR REPLACE PROCEDURE trigger_scraper(p_source text)
LANGUAGE plpgsql
AS $$
DECLARE
  v_seller_id uuid;
  v_job_id    uuid;
BEGIN
  -- Resolve seller ID from source name
  SELECT id INTO v_seller_id
  FROM sellers
  WHERE name = p_source
  LIMIT 1;

  -- Create job record
  INSERT INTO scraper_jobs (
    seller_id,
    job_type,
    status,
    next_run_at
  ) VALUES (
    v_seller_id,
    'FULL_CRAWL',
    'PENDING',
    now() + interval '24 hours'
  )
  RETURNING id INTO v_job_id;

  -- Notify Railway scraper worker
  PERFORM pg_notify(
    'scraper_jobs',
    json_build_object(
      'job_id',  v_job_id,
      'source',  p_source,
      'job_type','FULL_CRAWL'
    )::text
  );

  RAISE NOTICE 'Triggered scraper job % for source %', v_job_id, p_source;
END;
$$;


-- ============================================================
-- record_price_history()
-- Trigger function: auto-insert into price_history when a
-- listing's price_eur or stock_qty changes.
-- ============================================================
CREATE OR REPLACE FUNCTION record_price_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only record if price or stock changed
  IF (TG_OP = 'INSERT')
     OR (OLD.price_eur  IS DISTINCT FROM NEW.price_eur)
     OR (OLD.stock_qty  IS DISTINCT FROM NEW.stock_qty) THEN

    INSERT INTO price_history (listing_id, price_eur, stock_qty, recorded_at)
    VALUES (NEW.id, NEW.price_eur, NEW.stock_qty, now())
    ON CONFLICT (listing_id, recorded_at) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_listing_price_history
AFTER INSERT OR UPDATE OF price_eur, stock_qty
ON listings
FOR EACH ROW
EXECUTE FUNCTION record_price_history();


-- ============================================================
-- mark_stale_listings()
-- Run daily via pg_cron. Sets is_active = false for listings
-- not seen by the scraper in the last 48 hours.
-- ============================================================
CREATE OR REPLACE PROCEDURE mark_stale_listings()
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE listings
  SET    is_active = false
  WHERE  is_active = true
    AND  last_seen_at < now() - interval '48 hours';

  RAISE NOTICE 'Marked stale listings as inactive';
END;
$$;

-- Schedule stale cleanup daily at 06:00
SELECT cron.schedule(
  'mark-stale-listings',
  '0 6 * * *',
  $$ CALL mark_stale_listings() $$
);


-- ============================================================
-- Seed sellers table (matches SCRAPERS dict in Python)
-- ============================================================
INSERT INTO sellers (name, seller_type, country, verified, b2b_eligible)
VALUES
  ('ebay_fr',     'MARKETPLACE', 'FR', false, false),
  ('ebay_de',     'MARKETPLACE', 'DE', false, false),
  ('ebay_uk',     'MARKETPLACE', 'UK', false, false),
  ('ebay_es',     'MARKETPLACE', 'ES', false, false),
  ('autodoc',     'DEALER',      'DE', true,  true),
  ('oscaro',      'DEALER',      'FR', true,  false),
  ('rockauto',    'DEALER',      'US', true,  false),
  ('mister_auto', 'DEALER',      'FR', true,  false),
  ('ovoko',       'MARKETPLACE', 'LT', false, false)
ON CONFLICT (name) DO NOTHING;
