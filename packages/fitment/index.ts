/**
 * Torqued Fitment Engine — public interface.
 *
 * Answers "does this part fit this vehicle?" with a confidence score.
 * See docs/03_TORQUED_MVP_BRIEF.md §4 for the business rules.
 *
 * At prototype stage, the implementation is a thin SQL wrapper:
 * fitment edges are seeded, confidence threshold hardcoded to 0.7.
 * The interface below is the shape we grow into at MVP Alpha and beyond.
 */

export type FitmentSource =
  | "tecdoc_direct"
  | "ebay_epid"
  | "oe_cross_reference"
  | "ai_photo_inference"
  | "human_validated"
  | "seller_declared"
  | "community_reported";

export type GovernanceLevel = "L1_auto" | "L2_ai" | "L3_human" | "L4_community";

export interface FitmentQueryOptions {
  minConfidence?: number;
  allowedSources?: FitmentSource[];
  allowedGovernanceLevels?: GovernanceLevel[];
}

export interface FitmentMatch {
  partId: string;
  vehicleId: string;
  aggregatedConfidence: number;
  displayTier: GovernanceLevel;
}

export interface FitmentEngine {
  partsFittingVehicle(
    vehicleId: string,
    options?: FitmentQueryOptions,
  ): Promise<FitmentMatch[]>;

  vehiclesFittingPart(
    partId: string,
    options?: FitmentQueryOptions,
  ): Promise<FitmentMatch[]>;

  aggregateConfidence(
    partId: string,
    vehicleId: string,
  ): Promise<{ confidence: number; level: GovernanceLevel } | null>;
}

export { createSqlFitmentEngine } from "./src/engine";
