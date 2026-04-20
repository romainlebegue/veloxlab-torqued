/**
 * Torqued Supabase types — hand-crafted to match the migration at:
 *   supabase/migrations/20260420000000_torqued_schema.sql
 *
 * Once the Supabase project is live, regenerate with:
 *   supabase gen types typescript --local > packages/db/types.ts
 *
 * Keep this file and the migration in sync until then.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================
// Enums
// ============================================================

export type VehicleType =
  | "car"
  | "light_commercial"
  | "motorcycle"
  | "truck"
  | "boat"
  | "agricultural"
  | "other";

export type PartCondition =
  | "new_oe"
  | "new_oes"
  | "new_iam"
  | "reman"
  | "rec_traced"
  | "used_untraced";

export type FitmentSource =
  | "tecdoc_direct"
  | "ebay_epid"
  | "oe_cross_reference"
  | "ai_photo_inference"
  | "human_validated"
  | "seller_declared"
  | "community_reported";

export type GovernanceLevel = "L1_auto" | "L2_ai" | "L3_human" | "L4_community";

export type SellerTier = "A" | "B" | "C" | "D" | "unranked";
export type SellerStatus = "pending" | "active" | "suspended" | "archived";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "archived";

export type IngestionSource =
  | "ebay_connector"
  | "linnworks"
  | "native_import"
  | "external_affiliate_feed"
  | "dms_connector";

export type CheckoutPath = "affiliate" | "mor";

// ============================================================
// Row types
// ============================================================

export interface CategoryRow {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  name_i18n: Json;
  depth: number;
  path: string[];
  created_at: string;
}

export interface VehicleRow {
  id: string;
  vehicle_type: VehicleType;
  make: string;
  model: string;
  variant: string | null;
  engine_code: string | null;
  engine_cc: number | null;
  engine_kw: number | null;
  engine_hp: number | null;
  fuel_type: string | null;
  body_type: string | null;
  year_from: number | null;
  year_to: number | null;
  ktype_nr: number | null;
  manufacturer_code: string | null;
  slug: string;
  display_name: string | null;
  primary_markets: string[];
  data_source: string | null;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface PartRow {
  id: string;
  oe_numbers: string[];
  iam_numbers: string[];
  category_id: string | null;
  subcategory: string | null;
  display_name: string;
  display_name_i18n: Json;
  technical_attributes: Json;
  primary_image_url: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface SellerRow {
  id: string;
  user_id: string | null;
  display_name: string;
  legal_name: string | null;
  country_code: string;
  vat_number: string | null;
  tier: SellerTier;
  fitment_accuracy_rate: number | null;
  return_rate: number | null;
  response_time_hours: number | null;
  transaction_count: number;
  mor_eligible: boolean;
  mor_activated_at: string | null;
  status: SellerStatus;
  onboarded_at: string | null;
  ebay_connected: boolean;
  ebay_user_id: string | null;
  ebay_connection_meta: Json | null;
  linnworks_connected: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingMedia {
  url: string;
  alt?: string;
  order?: number;
}

export interface ListingRow {
  id: string;
  seller_id: string;
  part_id: string | null;
  ingestion_source: IngestionSource;
  source_external_id: string | null;
  source_url: string | null;
  condition: PartCondition;
  price_amount: number;
  price_currency: string;
  shipping_fee: number | null;
  free_shipping_threshold: number | null;
  delivery_lead_days_min: number | null;
  delivery_lead_days_max: number | null;
  stock_quantity: number;
  stock_status: string;
  title: string;
  title_i18n: Json;
  description: string | null;
  description_i18n: Json;
  media: ListingMedia[];
  status: ListingStatus;
  fitment_resolved: boolean;
  checkout_path: CheckoutPath;
  affiliate_deep_link: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FitmentEdgeRow {
  id: string;
  part_id: string;
  vehicle_id: string;
  source: FitmentSource;
  governance_level: GovernanceLevel;
  confidence: number;
  evidence: Json;
  validated_by: string | null;
  validated_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingVehicleApplicabilityRow {
  id: string;
  listing_id: string;
  vehicle_id: string;
  aggregated_confidence: number;
  display_tier: GovernanceLevel;
}

export interface OeCrossReferenceRow {
  id: string;
  oe_number: string;
  equivalent_oe_number: string;
  distance: number;
  source: FitmentSource;
  created_at: string;
}

export interface PhotoInferenceRow {
  id: string;
  seller_id: string | null;
  photo_url: string;
  photo_checksum: string | null;
  model: string;
  prompt_version: string;
  raw_response: Json;
  parsed: Json;
  confidence: number | null;
  matched_part_id: string | null;
  listing_id: string | null;
  created_at: string;
}

export interface DemoPlateRow {
  plate: string;
  country_code: string;
  vehicle_id: string;
  notes: string | null;
  created_at: string;
}

export interface PlateLookupRow {
  id: string;
  plate_hash: string;
  country_code: string;
  vehicle_id: string | null;
  match_confidence: number | null;
  resolved_at: string;
  expires_at: string;
}

// ============================================================
// Supabase Database shape
// ============================================================

type InsertOf<T> = Omit<T, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

type UpdateOf<T> = Partial<InsertOf<T>>;

export type Database = {
  // Marker expected by @supabase/postgrest-js >= 2.x. See GenericDatabase type.
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: InsertOf<CategoryRow>;
        Update: UpdateOf<CategoryRow>;
        Relationships: [];
      };
      vehicles: {
        Row: VehicleRow;
        Insert: InsertOf<VehicleRow>;
        Update: UpdateOf<VehicleRow>;
        Relationships: [];
      };
      parts: {
        Row: PartRow;
        Insert: InsertOf<PartRow>;
        Update: UpdateOf<PartRow>;
        Relationships: [];
      };
      sellers: {
        Row: SellerRow;
        Insert: InsertOf<SellerRow>;
        Update: UpdateOf<SellerRow>;
        Relationships: [];
      };
      listings: {
        Row: ListingRow;
        Insert: InsertOf<ListingRow>;
        Update: UpdateOf<ListingRow>;
        Relationships: [];
      };
      fitment_edges: {
        Row: FitmentEdgeRow;
        Insert: InsertOf<FitmentEdgeRow>;
        Update: UpdateOf<FitmentEdgeRow>;
        Relationships: [];
      };
      listing_vehicle_applicability: {
        Row: ListingVehicleApplicabilityRow;
        Insert: Omit<ListingVehicleApplicabilityRow, "id"> & { id?: string };
        Update: Partial<ListingVehicleApplicabilityRow>;
        Relationships: [];
      };
      oe_cross_references: {
        Row: OeCrossReferenceRow;
        Insert: Omit<OeCrossReferenceRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<OeCrossReferenceRow>;
        Relationships: [];
      };
      photo_inferences: {
        Row: PhotoInferenceRow;
        Insert: Omit<PhotoInferenceRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<PhotoInferenceRow>;
        Relationships: [];
      };
      demo_plates: {
        Row: DemoPlateRow;
        Insert: Omit<DemoPlateRow, "created_at"> & { created_at?: string };
        Update: Partial<DemoPlateRow>;
        Relationships: [];
      };
      plate_lookups: {
        Row: PlateLookupRow;
        Insert: Omit<PlateLookupRow, "id" | "resolved_at" | "expires_at"> & {
          id?: string;
          resolved_at?: string;
          expires_at?: string;
        };
        Update: Partial<PlateLookupRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      vehicle_type: VehicleType;
      part_condition: PartCondition;
      fitment_source: FitmentSource;
      governance_level: GovernanceLevel;
      seller_tier: SellerTier;
      seller_status: SellerStatus;
      listing_status: ListingStatus;
      ingestion_source: IngestionSource;
    };
    CompositeTypes: Record<string, never>;
  };
};
