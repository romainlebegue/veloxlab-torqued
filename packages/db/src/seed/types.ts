import type {
  CategoryRow,
  DemoPlateRow,
  SellerRow,
  VehicleRow,
} from "../../types";

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
