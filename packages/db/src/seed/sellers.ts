import type { SeedSeller } from "./types";

/**
 * Demo sellers (prototype brief §3.3). Target: 5 sellers minimum,
 * at least one per condition type (new_iam, reman, rec_traced, used_untraced).
 *
 * `is_demo` is forced to true by the seed runner for every entry here.
 *
 * SPRINT 1 TODO: populate. Slug is used by downstream listing seeds as
 * a stable handle — keep it kebab-case and stable.
 */
export const sellers: SeedSeller[] = [];
