import type { SeedVehicle } from "./types";

/**
 * Top-20 FR makes/models (prototype brief §3.1).
 * Target: 500 vehicle rows covering the variants users will hit.
 *
 * SPRINT 1 TODO: populate this array. Source candidates:
 *   - TecAlliance open dataset (KType nrs)
 *   - Scrape SIV registration-volume leaderboards
 *   - Hand-curate from manufacturer catalogues
 *
 * Until then, the seed runner will upsert 0 vehicles and the runner
 * logs "vehicles: 0" — which is the signal to populate this file.
 */
export const vehicles: SeedVehicle[] = [];
