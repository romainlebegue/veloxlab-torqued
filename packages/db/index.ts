import type { Database } from "./types";

export type { Database, Json } from "./types";
export { createAdminClient, createAnonClient } from "./client";

// ============================================================
// Row / Insert / Update aliases
// Ergonomic re-exports of the auto-generated Supabase types.
// Regenerate `types.ts` via `supabase gen types typescript --linked`
// whenever the migration changes.
// ============================================================

type T = Database["public"]["Tables"];
type E = Database["public"]["Enums"];

export type CategoryRow = T["categories"]["Row"];
export type VehicleRow = T["vehicles"]["Row"];
export type PartRow = T["parts"]["Row"];
export type SellerRow = T["sellers"]["Row"];
export type ListingRow = T["listings"]["Row"];
export type FitmentEdgeRow = T["fitment_edges"]["Row"];
export type ListingVehicleApplicabilityRow = T["listing_vehicle_applicability"]["Row"];
export type OeCrossReferenceRow = T["oe_cross_references"]["Row"];
export type PhotoInferenceRow = T["photo_inferences"]["Row"];
export type DemoPlateRow = T["demo_plates"]["Row"];
export type PlateLookupRow = T["plate_lookups"]["Row"];

export type CategoryInsert = T["categories"]["Insert"];
export type VehicleInsert = T["vehicles"]["Insert"];
export type PartInsert = T["parts"]["Insert"];
export type SellerInsert = T["sellers"]["Insert"];
export type ListingInsert = T["listings"]["Insert"];
export type FitmentEdgeInsert = T["fitment_edges"]["Insert"];
export type ListingVehicleApplicabilityInsert = T["listing_vehicle_applicability"]["Insert"];
export type OeCrossReferenceInsert = T["oe_cross_references"]["Insert"];
export type PhotoInferenceInsert = T["photo_inferences"]["Insert"];
export type DemoPlateInsert = T["demo_plates"]["Insert"];
export type PlateLookupInsert = T["plate_lookups"]["Insert"];

export type VehicleType = E["vehicle_type"];
export type PartCondition = E["part_condition"];
export type FitmentSource = E["fitment_source"];
export type GovernanceLevel = E["governance_level"];
export type SellerTier = E["seller_tier"];
export type SellerStatus = E["seller_status"];
export type ListingStatus = E["listing_status"];
export type IngestionSource = E["ingestion_source"];
