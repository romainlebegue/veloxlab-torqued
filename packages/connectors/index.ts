/**
 * Torqued Catalog Connectors.
 *
 * Each ingestion source is a separate adapter implementing the `Connector` contract.
 * At prototype: only `csv-import` is active. eBay OAuth is wired for MVP Alpha.
 *
 * See docs/03_TORQUED_MVP_BRIEF.md §5.
 */

export type IngestionSource =
  | "ebay_connector"
  | "linnworks"
  | "native_import"
  | "external_affiliate_feed"
  | "dms_connector";

export interface ConnectorRunResult {
  listingsSeen: number;
  listingsUpserted: number;
  fitmentEdgesCreated: number;
  errors: string[];
}

export interface Connector {
  source: IngestionSource;
  run(input: unknown): Promise<ConnectorRunResult>;
}
