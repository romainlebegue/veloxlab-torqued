import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FitmentEngine,
  FitmentMatch,
  FitmentQueryOptions,
  GovernanceLevel,
} from "../index";

/**
 * Prototype-grade fitment engine: reads directly from `listing_vehicle_applicability`.
 * No transitive OE expansion, no photo inference, no feedback loop yet.
 * TODO(mvp): aggregate from `fitment_edges` per §4.2 of MVP brief.
 */
export function createSqlFitmentEngine(
  supabase: SupabaseClient,
): FitmentEngine {
  return {
    async partsFittingVehicle(vehicleId, options) {
      const min = options?.minConfidence ?? 0.7;
      const { data, error } = await supabase
        .from("listing_vehicle_applicability")
        .select("listing_id, vehicle_id, aggregated_confidence, display_tier")
        .eq("vehicle_id", vehicleId)
        .gte("aggregated_confidence", min)
        .order("aggregated_confidence", { ascending: false });

      if (error) throw error;
      return (data ?? []).map(toMatch);
    },

    async vehiclesFittingPart(partId, options) {
      const min = options?.minConfidence ?? 0.7;
      const { data, error } = await supabase
        .from("fitment_edges")
        .select("part_id, vehicle_id, confidence, governance_level")
        .eq("part_id", partId)
        .eq("active", true)
        .gte("confidence", min);

      if (error) throw error;
      return (data ?? []).map((row) => ({
        partId: row.part_id as string,
        vehicleId: row.vehicle_id as string,
        aggregatedConfidence: Number(row.confidence),
        displayTier: row.governance_level as GovernanceLevel,
      }));
    },

    async aggregateConfidence(partId, vehicleId) {
      const { data, error } = await supabase
        .from("fitment_edges")
        .select("confidence, governance_level")
        .eq("part_id", partId)
        .eq("vehicle_id", vehicleId)
        .eq("active", true)
        .order("confidence", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return {
        confidence: Number(data.confidence),
        level: data.governance_level as GovernanceLevel,
      };
    },
  };
}

function toMatch(row: {
  listing_id?: string;
  part_id?: string;
  vehicle_id: string;
  aggregated_confidence: number;
  display_tier: string;
}): FitmentMatch {
  return {
    partId: (row.part_id ?? row.listing_id ?? "") as string,
    vehicleId: row.vehicle_id,
    aggregatedConfidence: Number(row.aggregated_confidence),
    displayTier: row.display_tier as GovernanceLevel,
  };
}
