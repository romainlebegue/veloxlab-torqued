export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          depth: number
          id: string
          name: string
          name_i18n: Json
          parent_id: string | null
          path: string[]
          slug: string
        }
        Insert: {
          created_at?: string
          depth?: number
          id?: string
          name: string
          name_i18n?: Json
          parent_id?: string | null
          path?: string[]
          slug: string
        }
        Update: {
          created_at?: string
          depth?: number
          id?: string
          name?: string
          name_i18n?: Json
          parent_id?: string | null
          path?: string[]
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_plates: {
        Row: {
          country_code: string
          created_at: string
          notes: string | null
          plate: string
          vehicle_id: string
        }
        Insert: {
          country_code?: string
          created_at?: string
          notes?: string | null
          plate: string
          vehicle_id: string
        }
        Update: {
          country_code?: string
          created_at?: string
          notes?: string | null
          plate?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_plates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fitment_edges: {
        Row: {
          active: boolean
          confidence: number
          created_at: string
          evidence: Json
          governance_level: Database["public"]["Enums"]["governance_level"]
          id: string
          part_id: string
          source: Database["public"]["Enums"]["fitment_source"]
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          vehicle_id: string
        }
        Insert: {
          active?: boolean
          confidence: number
          created_at?: string
          evidence?: Json
          governance_level: Database["public"]["Enums"]["governance_level"]
          id?: string
          part_id: string
          source: Database["public"]["Enums"]["fitment_source"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          vehicle_id: string
        }
        Update: {
          active?: boolean
          confidence?: number
          created_at?: string
          evidence?: Json
          governance_level?: Database["public"]["Enums"]["governance_level"]
          id?: string
          part_id?: string
          source?: Database["public"]["Enums"]["fitment_source"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitment_edges_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitment_edges_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_vehicle_applicability: {
        Row: {
          aggregated_confidence: number
          display_tier: Database["public"]["Enums"]["governance_level"]
          id: string
          listing_id: string
          vehicle_id: string
        }
        Insert: {
          aggregated_confidence: number
          display_tier: Database["public"]["Enums"]["governance_level"]
          id?: string
          listing_id: string
          vehicle_id: string
        }
        Update: {
          aggregated_confidence?: number
          display_tier?: Database["public"]["Enums"]["governance_level"]
          id?: string
          listing_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_vehicle_applicability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_vehicle_applicability_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          affiliate_deep_link: string | null
          checkout_path: string
          condition: Database["public"]["Enums"]["part_condition"]
          created_at: string
          delivery_lead_days_max: number | null
          delivery_lead_days_min: number | null
          description: string | null
          description_i18n: Json
          fitment_resolved: boolean
          free_shipping_threshold: number | null
          id: string
          ingestion_source: Database["public"]["Enums"]["ingestion_source"]
          is_demo: boolean
          media: Json
          part_id: string | null
          price_amount: number
          price_currency: string
          provenance: Json
          seller_id: string
          shipping_fee: number | null
          source_external_id: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["listing_status"]
          stock_quantity: number
          stock_status: string
          title: string
          title_i18n: Json
          updated_at: string
        }
        Insert: {
          affiliate_deep_link?: string | null
          checkout_path?: string
          condition: Database["public"]["Enums"]["part_condition"]
          created_at?: string
          delivery_lead_days_max?: number | null
          delivery_lead_days_min?: number | null
          description?: string | null
          description_i18n?: Json
          fitment_resolved?: boolean
          free_shipping_threshold?: number | null
          id?: string
          ingestion_source: Database["public"]["Enums"]["ingestion_source"]
          is_demo?: boolean
          media?: Json
          part_id?: string | null
          price_amount: number
          price_currency?: string
          provenance?: Json
          seller_id: string
          shipping_fee?: number | null
          source_external_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          stock_quantity?: number
          stock_status?: string
          title: string
          title_i18n?: Json
          updated_at?: string
        }
        Update: {
          affiliate_deep_link?: string | null
          checkout_path?: string
          condition?: Database["public"]["Enums"]["part_condition"]
          created_at?: string
          delivery_lead_days_max?: number | null
          delivery_lead_days_min?: number | null
          description?: string | null
          description_i18n?: Json
          fitment_resolved?: boolean
          free_shipping_threshold?: number | null
          id?: string
          ingestion_source?: Database["public"]["Enums"]["ingestion_source"]
          is_demo?: boolean
          media?: Json
          part_id?: string | null
          price_amount?: number
          price_currency?: string
          provenance?: Json
          seller_id?: string
          shipping_fee?: number | null
          source_external_id?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          stock_quantity?: number
          stock_status?: string
          title?: string
          title_i18n?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      oe_cross_references: {
        Row: {
          created_at: string
          distance: number
          equivalent_oe_number: string
          id: string
          oe_number: string
          source: Database["public"]["Enums"]["fitment_source"]
        }
        Insert: {
          created_at?: string
          distance?: number
          equivalent_oe_number: string
          id?: string
          oe_number: string
          source: Database["public"]["Enums"]["fitment_source"]
        }
        Update: {
          created_at?: string
          distance?: number
          equivalent_oe_number?: string
          id?: string
          oe_number?: string
          source?: Database["public"]["Enums"]["fitment_source"]
        }
        Relationships: []
      }
      parts: {
        Row: {
          category_id: string | null
          created_at: string
          display_name: string
          display_name_i18n: Json
          iam_numbers: string[]
          id: string
          oe_numbers: string[]
          primary_image_url: string | null
          slug: string
          subcategory: string | null
          technical_attributes: Json
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          display_name: string
          display_name_i18n?: Json
          iam_numbers?: string[]
          id?: string
          oe_numbers?: string[]
          primary_image_url?: string | null
          slug: string
          subcategory?: string | null
          technical_attributes?: Json
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          display_name?: string
          display_name_i18n?: Json
          iam_numbers?: string[]
          id?: string
          oe_numbers?: string[]
          primary_image_url?: string | null
          slug?: string
          subcategory?: string | null
          technical_attributes?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_inferences: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          listing_id: string | null
          matched_part_id: string | null
          model: string
          parsed: Json
          photo_checksum: string | null
          photo_url: string
          prompt_version: string
          raw_response: Json
          seller_id: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          listing_id?: string | null
          matched_part_id?: string | null
          model: string
          parsed: Json
          photo_checksum?: string | null
          photo_url: string
          prompt_version?: string
          raw_response: Json
          seller_id?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          listing_id?: string | null
          matched_part_id?: string | null
          model?: string
          parsed?: Json
          photo_checksum?: string | null
          photo_url?: string
          prompt_version?: string
          raw_response?: Json
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_inferences_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_inferences_matched_part_id_fkey"
            columns: ["matched_part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_inferences_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      plate_lookups: {
        Row: {
          country_code: string
          expires_at: string
          id: string
          match_confidence: number | null
          plate_hash: string
          resolved_at: string
          vehicle_id: string | null
        }
        Insert: {
          country_code: string
          expires_at?: string
          id?: string
          match_confidence?: number | null
          plate_hash: string
          resolved_at?: string
          vehicle_id?: string | null
        }
        Update: {
          country_code?: string
          expires_at?: string
          id?: string
          match_confidence?: number | null
          plate_hash?: string
          resolved_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plate_lookups_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          country_code: string
          created_at: string
          display_name: string
          ebay_connected: boolean
          ebay_connection_meta: Json | null
          ebay_user_id: string | null
          fitment_accuracy_rate: number | null
          id: string
          is_demo: boolean
          legal_name: string | null
          linnworks_connected: boolean
          mor_activated_at: string | null
          mor_eligible: boolean
          onboarded_at: string | null
          response_time_hours: number | null
          return_rate: number | null
          status: Database["public"]["Enums"]["seller_status"]
          tier: Database["public"]["Enums"]["seller_tier"]
          transaction_count: number
          updated_at: string
          user_id: string | null
          vat_number: string | null
        }
        Insert: {
          country_code: string
          created_at?: string
          display_name: string
          ebay_connected?: boolean
          ebay_connection_meta?: Json | null
          ebay_user_id?: string | null
          fitment_accuracy_rate?: number | null
          id?: string
          is_demo?: boolean
          legal_name?: string | null
          linnworks_connected?: boolean
          mor_activated_at?: string | null
          mor_eligible?: boolean
          onboarded_at?: string | null
          response_time_hours?: number | null
          return_rate?: number | null
          status?: Database["public"]["Enums"]["seller_status"]
          tier?: Database["public"]["Enums"]["seller_tier"]
          transaction_count?: number
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string
          display_name?: string
          ebay_connected?: boolean
          ebay_connection_meta?: Json | null
          ebay_user_id?: string | null
          fitment_accuracy_rate?: number | null
          id?: string
          is_demo?: boolean
          legal_name?: string | null
          linnworks_connected?: boolean
          mor_activated_at?: string | null
          mor_eligible?: boolean
          onboarded_at?: string | null
          response_time_hours?: number | null
          return_rate?: number | null
          status?: Database["public"]["Enums"]["seller_status"]
          tier?: Database["public"]["Enums"]["seller_tier"]
          transaction_count?: number
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          body_type: string | null
          confidence: number
          created_at: string
          data_source: string | null
          display_name: string | null
          engine_cc: number | null
          engine_code: string | null
          engine_hp: number | null
          engine_kw: number | null
          fuel_type: string | null
          id: string
          ktype_nr: number | null
          make: string
          manufacturer_code: string | null
          model: string
          primary_markets: string[]
          slug: string
          updated_at: string
          variant: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          body_type?: string | null
          confidence?: number
          created_at?: string
          data_source?: string | null
          display_name?: string | null
          engine_cc?: number | null
          engine_code?: string | null
          engine_hp?: number | null
          engine_kw?: number | null
          fuel_type?: string | null
          id?: string
          ktype_nr?: number | null
          make: string
          manufacturer_code?: string | null
          model: string
          primary_markets?: string[]
          slug: string
          updated_at?: string
          variant?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          body_type?: string | null
          confidence?: number
          created_at?: string
          data_source?: string | null
          display_name?: string | null
          engine_cc?: number | null
          engine_code?: string | null
          engine_hp?: number | null
          engine_kw?: number | null
          fuel_type?: string | null
          id?: string
          ktype_nr?: number | null
          make?: string
          manufacturer_code?: string | null
          model?: string
          primary_markets?: string[]
          slug?: string
          updated_at?: string
          variant?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      fitment_source:
        | "tecdoc_direct"
        | "ebay_epid"
        | "oe_cross_reference"
        | "ai_photo_inference"
        | "human_validated"
        | "seller_declared"
        | "community_reported"
      governance_level: "L1_auto" | "L2_ai" | "L3_human" | "L4_community"
      ingestion_source:
        | "ebay_connector"
        | "linnworks"
        | "native_import"
        | "external_affiliate_feed"
        | "dms_connector"
      listing_status:
        | "draft"
        | "pending_review"
        | "active"
        | "paused"
        | "archived"
      part_condition:
        | "new_oe"
        | "new_oes"
        | "new_iam"
        | "reman"
        | "rec_traced"
        | "used_untraced"
      seller_status: "pending" | "active" | "suspended" | "archived"
      seller_tier: "A" | "B" | "C" | "D" | "unranked"
      vehicle_type:
        | "car"
        | "light_commercial"
        | "motorcycle"
        | "truck"
        | "boat"
        | "agricultural"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      fitment_source: [
        "tecdoc_direct",
        "ebay_epid",
        "oe_cross_reference",
        "ai_photo_inference",
        "human_validated",
        "seller_declared",
        "community_reported",
      ],
      governance_level: ["L1_auto", "L2_ai", "L3_human", "L4_community"],
      ingestion_source: [
        "ebay_connector",
        "linnworks",
        "native_import",
        "external_affiliate_feed",
        "dms_connector",
      ],
      listing_status: [
        "draft",
        "pending_review",
        "active",
        "paused",
        "archived",
      ],
      part_condition: [
        "new_oe",
        "new_oes",
        "new_iam",
        "reman",
        "rec_traced",
        "used_untraced",
      ],
      seller_status: ["pending", "active", "suspended", "archived"],
      seller_tier: ["A", "B", "C", "D", "unranked"],
      vehicle_type: [
        "car",
        "light_commercial",
        "motorcycle",
        "truck",
        "boat",
        "agricultural",
        "other",
      ],
    },
  },
} as const
