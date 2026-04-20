import type {
  CategoryRow,
  DemoPlateRow,
  PartCondition,
  PartRow,
  SellerRow,
  VehicleRow,
} from "../../index";

/**
 * Seed data shapes — what we author by hand, before idempotent upsert.
 * Each `SeedX` type is a subset of the row type: only the fields we need
 * to specify, with server-generated fields omitted.
 */

export type SeedCategory = Pick<
  CategoryRow,
  "slug" | "name" | "depth"
> & {
  parent_slug?: string;           // resolved to parent_id at seed time
  name_i18n?: CategoryRow["name_i18n"];
  path?: CategoryRow["path"];
};

export type SeedVehicle = Pick<
  VehicleRow,
  "vehicle_type" | "make" | "model" | "slug"
> & {
  variant?: string | null;
  engine_code?: string | null;
  engine_cc?: number | null;
  engine_kw?: number | null;
  engine_hp?: number | null;
  fuel_type?: string | null;
  body_type?: string | null;
  year_from?: number | null;
  year_to?: number | null;
  ktype_nr?: number | null;
  display_name?: string | null;
  primary_markets?: string[];
  data_source?: string | null;
};

export type SeedSeller = Pick<
  SellerRow,
  "display_name" | "country_code" | "tier" | "status"
> & {
  slug: string;                   // stable local key used by listing seeds
  legal_name?: string | null;
  mor_eligible?: boolean;
  onboarded_at?: string | null;
};

export type SeedDemoPlate = Pick<DemoPlateRow, "plate" | "country_code"> & {
  vehicle_slug: string;           // resolved to vehicle_id at seed time
  notes?: string | null;
};

export type SeedPart = Pick<
  PartRow,
  "slug" | "display_name" | "oe_numbers" | "iam_numbers"
> & {
  category_slug: string;          // resolved to category_id at seed time
  subcategory?: string | null;
  brand?: string | null;          // primary IAM brand for display
  display_name_i18n?: PartRow["display_name_i18n"];
  technical_attributes?: PartRow["technical_attributes"];
  primary_image_url?: string | null;
  fits_vehicle_slugs: string[];   // list of vehicle slugs this part fits
};

export type SeedListingCondition = {
  condition: PartCondition;
  seller_slug: string;
  price_eur: number;
  shipping_eur?: number | null;   // null or omitted = shipping included
  lead_days_min?: number;
  lead_days_max?: number;
  stock?: number;
  /** For rec_traced only */
  provenance?: {
    donor_vin: string;
    donor_km: number;
    dismantler: string;
    dismantler_cert: string;
    removed_at?: string;
    notes?: string;
  };
};

export type SeedListing = {
  part_slug: string;
  seller_slug: string;
  condition: PartCondition;
  title: string;
  description?: string;
  price_amount: number;
  price_currency?: string;        // default 'EUR'
  shipping_fee?: number | null;
  free_shipping_threshold?: number | null;
  delivery_lead_days_min?: number;
  delivery_lead_days_max?: number;
  stock_quantity?: number;
  provenance?: SeedListingCondition["provenance"];
  source_external_id: string;     // stable unique id for idempotence
};
