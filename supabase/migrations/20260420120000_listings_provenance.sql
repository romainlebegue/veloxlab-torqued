-- ============================================================
-- Listings provenance — structured metadata for rec_traced items
-- ============================================================
-- For `rec_traced` (CERTIFIED) listings, store donor traceability:
--   { donor_vin: string, donor_km: number, dismantler: string,
--     dismantler_cert: string, removed_at: iso date, notes: string }
-- Non-REC listings keep the default empty object.
-- Kept as JSONB to leave room for extra provenance fields later
-- (lot number, batch, expiry) without new migrations.
-- ============================================================

ALTER TABLE listings
  ADD COLUMN provenance jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN listings.provenance IS
  'Traceability metadata. Populated for rec_traced listings with donor VIN, km, dismantler, cert.';
