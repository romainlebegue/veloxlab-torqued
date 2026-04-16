/**
 * Shared TypeScript types used across apps/web and packages/db.
 * These are domain types, not DB row types.
 */

// ------------------------------------------------------------------
// Part types
// ------------------------------------------------------------------

export type PartType =
  | "NEW_OEM"
  | "NEW_OES"
  | "NEW_IAM"
  | "USED"
  | "REMAN"
  | "REC"
  | "MOTO";

export type ConditionGrade = "A" | "B" | "C";

// ------------------------------------------------------------------
// Checkout / ranking
// ------------------------------------------------------------------

export type CheckoutType = "direct" | "affiliate" | "cpc" | "organic";

export type SortMode = "smart" | "price" | "eco" | "rating" | "delivery";

// ------------------------------------------------------------------
// Listing (enriched, used in UI)
// ------------------------------------------------------------------

export interface PartListing {
  id: string;
  source: string;
  url: string;
  title: string;
  partNumber: string | null;
  brand: string | null;
  condition: string;
  partType: PartType;
  priceEur: number;
  shippingCostEur: number | null;
  shippingTo: string[];
  sellerName: string | null;
  sellerCountry: string | null;
  imageUrls: string[];
  stockQty: number | null;
  warrantyMonths: number | null;
  // REC fields
  isRec: boolean;
  recGrade: ConditionGrade | null;
  recDonorVin: string | null;
  recDonorKm: number | null;
  recDismantler: string | null;
  recDismantlerCert: string | null;
  recRecallCheck: boolean | null;
  // Ranking (added by rank-offers Edge Function)
  score?: number;
  checkoutType?: CheckoutType;
  commercialBoost?: number;
  isSponsored?: boolean;
}

// ------------------------------------------------------------------
// Vehicle fitment
// ------------------------------------------------------------------

export interface VehicleFitment {
  id: string;
  make: string;
  model: string;
  variant: string | null;
  yearFrom: number;
  yearTo: number | null;
  engineCode: string | null;
  engineCc: number | null;
  fuelType: string | null;
  kw: number | null;
  ktypeId: number | null;
}

// ------------------------------------------------------------------
// Search params (used in URL + API)
// ------------------------------------------------------------------

export interface FitmentSearchParams {
  make: string;
  model: string;
  year: number;
  category: string;
  sortMode?: SortMode;
  page?: number;
}

// ------------------------------------------------------------------
// REC certification
// ------------------------------------------------------------------

export interface RecCertification {
  grade: "A" | "B";
  donorVin: string;
  donorKm: number;
  dismantler: string;
  dismantlerCert: string;
  recallCheck: boolean;
}

// ------------------------------------------------------------------
// Ranking
// ------------------------------------------------------------------

export interface RankingWeights {
  checkout: Record<CheckoutType, number>;
  boost: number;
  quality: number;
  eco: number;
  price: number;
  shipping: number;
}
