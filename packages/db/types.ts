/**
 * Auto-generated Supabase types — DO NOT edit manually.
 * Regenerate with: supabase gen types typescript --local > packages/db/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          make: string;
          model: string;
          variant: string | null;
          year_from: number;
          year_to: number | null;
          engine_code: string | null;
          engine_cc: number | null;
          fuel_type: string | null;
          kw: number | null;
          ktype_id: number | null;
          vin_prefix: string[] | null;
          region: string[] | null;
        };
        Insert: Omit<Database["public"]["Tables"]["vehicles"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vehicles"]["Row"]>;
      };
      parts_catalog: {
        Row: {
          id: string;
          part_number: string;
          part_number_normalized: string;
          name: string;
          category_id: string | null;
          part_type: string;
          brand_id: string | null;
          is_moto: boolean;
          tecdoc_article_id: string | null;
          ean: string[] | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["parts_catalog"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["parts_catalog"]["Row"]>;
      };
      listings: {
        Row: {
          id: string;
          source: string;
          external_id: string;
          url: string;
          title: string;
          part_number: string | null;
          brand: string | null;
          condition: string;
          condition_grade: string | null;
          part_type: string;
          price: number;
          currency: string;
          price_eur: number;
          shipping_cost_eur: number | null;
          shipping_to: string[] | null;
          seller_name: string | null;
          seller_country: string | null;
          location_country: string | null;
          location_city: string | null;
          fitment_raw: string | null;
          vehicle_make: string | null;
          vehicle_model: string | null;
          vehicle_years: string | null;
          image_urls: string[] | null;
          stock_qty: number | null;
          warranty_months: number | null;
          is_rec: boolean;
          rec_grade: string | null;
          rec_donor_vin: string | null;
          rec_donor_km: number | null;
          rec_dismantler: string | null;
          rec_dismantler_cert: string | null;
          rec_recall_check: boolean | null;
          is_active: boolean;
          scraped_at: string | null;
          last_seen_at: string | null;
        };
        Insert: Database["public"]["Tables"]["listings"]["Row"];
        Update: Partial<Database["public"]["Tables"]["listings"]["Row"]>;
      };
      fitment: {
        Row: {
          id: string;
          part_id: string;
          vehicle_id: string;
          position: string | null;
          fitment_notes: string | null;
          fitment_attributes: Json | null;
          source: string;
          confidence_score: number;
          verified_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["fitment"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fitment"]["Row"]>;
      };
      cross_references: {
        Row: {
          id: string;
          part_id: string;
          ref_number: string;
          ref_number_normalized: string;
          brand_id: string | null;
          ref_type: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["cross_references"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["cross_references"]["Row"]>;
      };
      sellers: {
        Row: {
          id: string;
          name: string;
          seller_type: string;
          country: string;
          verified: boolean;
          b2b_eligible: boolean;
          scraper_config: Json | null;
          last_crawled_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["sellers"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sellers"]["Row"]>;
      };
      ranking_rules: {
        Row: {
          id: string;
          source: string;
          checkout_type: string;
          weight_checkout: number;
          weight_boost: number;
          weight_quality: number;
          weight_eco: number;
          weight_price: number;
          weight_shipping: number;
          is_active: boolean;
          valid_from: string | null;
          valid_to: string | null;
          notes: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["ranking_rules"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["ranking_rules"]["Row"]>;
      };
      price_history: {
        Row: {
          listing_id: string;
          price_eur: number;
          stock_qty: number | null;
          recorded_at: string;
        };
        Insert: Database["public"]["Tables"]["price_history"]["Row"];
        Update: Partial<Database["public"]["Tables"]["price_history"]["Row"]>;
      };
      scraper_jobs: {
        Row: {
          id: string;
          seller_id: string | null;
          job_type: string;
          status: string;
          listings_found: number | null;
          listings_new: number | null;
          error_log: Json | null;
          started_at: string | null;
          completed_at: string | null;
          next_run_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["scraper_jobs"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["scraper_jobs"]["Row"]>;
      };
    };
  };
};
