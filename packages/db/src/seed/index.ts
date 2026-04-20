import { config as loadEnv } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { categories } from "./categories";
import { vehicles } from "./vehicles";
import { sellers } from "./sellers";
import { demoPlates } from "./demo-plates";
import type {
  SeedCategory,
  SeedDemoPlate,
  SeedSeller,
  SeedVehicle,
} from "./types";

// Load .env.local if present (SUPABASE_URL, SUPABASE_SERVICE_KEY)
loadEnv({ path: [".env.local", ".env"] });

/**
 * Seed uses an untyped SupabaseClient — the generated Database type
 * adds friction here with no upside (inserts are hand-rolled and
 * mistakes are caught at runtime). When we move to live gen types,
 * revisit.
 */
type Supabase = SupabaseClient;

function createSeedClient(): Supabase {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and/or SUPABASE_SERVICE_KEY env var",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function seedCategories(sb: Supabase, rows: SeedCategory[]) {
  if (rows.length === 0) return { inserted: 0 };

  // Sort by depth so parents exist before children
  const ordered = [...rows].sort((a, b) => a.depth - b.depth);
  const slugToId = new Map<string, string>();

  for (const row of ordered) {
    const parent_id = row.parent_slug ? slugToId.get(row.parent_slug) ?? null : null;
    const { data, error } = await sb
      .from("categories")
      .upsert(
        {
          slug: row.slug,
          name: row.name,
          name_i18n: row.name_i18n ?? {},
          depth: row.depth,
          path: row.path ?? [row.slug],
          parent_id,
        },
        { onConflict: "slug" },
      )
      .select("id, slug")
      .single();
    if (error) throw error;
    slugToId.set(data.slug, data.id);
  }

  return { inserted: ordered.length };
}

async function seedVehicles(sb: Supabase, rows: SeedVehicle[]) {
  if (rows.length === 0) return { inserted: 0 };

  const payload = rows.map((v) => ({
    vehicle_type: v.vehicle_type,
    make: v.make,
    model: v.model,
    slug: v.slug,
    variant: v.variant ?? null,
    engine_code: v.engine_code ?? null,
    engine_cc: v.engine_cc ?? null,
    engine_kw: v.engine_kw ?? null,
    engine_hp: v.engine_hp ?? null,
    fuel_type: v.fuel_type ?? null,
    body_type: v.body_type ?? null,
    year_from: v.year_from ?? null,
    year_to: v.year_to ?? null,
    ktype_nr: v.ktype_nr ?? null,
    display_name: v.display_name ?? `${v.make} ${v.model}${v.variant ? " " + v.variant : ""}`,
    primary_markets: v.primary_markets ?? ["fr"],
    data_source: v.data_source ?? "manual",
  }));

  const { error } = await sb.from("vehicles").upsert(payload, { onConflict: "slug" });
  if (error) throw error;
  return { inserted: rows.length };
}

async function seedSellers(sb: Supabase, rows: SeedSeller[]) {
  if (rows.length === 0) return { inserted: 0, slugToId: new Map<string, string>() };

  // sellers has no natural unique key in the schema, so for idempotent
  // re-runs we wipe demo sellers first then insert. Safe because is_demo
  // is filtered out in production builds anyway.
  const { error: delErr } = await sb.from("sellers").delete().eq("is_demo", true);
  if (delErr) throw delErr;

  const payload = rows.map((s) => ({
    display_name: s.display_name,
    legal_name: s.legal_name ?? null,
    country_code: s.country_code,
    tier: s.tier,
    status: s.status,
    mor_eligible: s.mor_eligible ?? false,
    onboarded_at: s.onboarded_at ?? new Date().toISOString(),
    is_demo: true,
  }));

  const { data, error } = await sb.from("sellers").insert(payload).select("id, display_name");
  if (error) throw error;

  const slugToId = new Map<string, string>();
  rows.forEach((r) => {
    const hit = data?.find((d) => d.display_name === r.display_name);
    if (hit) slugToId.set(r.slug, hit.id);
  });
  return { inserted: rows.length, slugToId };
}

async function seedDemoPlates(sb: Supabase, rows: SeedDemoPlate[]) {
  if (rows.length === 0) return { inserted: 0 };

  const slugs = Array.from(new Set(rows.map((r) => r.vehicle_slug)));
  const { data: vehicleRows, error: vErr } = await sb
    .from("vehicles")
    .select("id, slug")
    .in("slug", slugs);
  if (vErr) throw vErr;

  const slugToId = new Map(vehicleRows?.map((v) => [v.slug, v.id]));
  const missing = slugs.filter((s) => !slugToId.has(s));
  if (missing.length > 0) {
    throw new Error(
      `demo_plates: referenced vehicle slugs not found in DB: ${missing.join(", ")}`,
    );
  }

  const payload = rows.map((r) => ({
    plate: r.plate,
    country_code: r.country_code ?? "FR",
    vehicle_id: slugToId.get(r.vehicle_slug)!,
    notes: r.notes ?? null,
  }));

  const { error } = await sb.from("demo_plates").upsert(payload, { onConflict: "plate" });
  if (error) throw error;
  return { inserted: rows.length };
}

export async function seed() {
  const sb = createSeedClient();
  console.log("[seed] starting…");

  const c = await seedCategories(sb, categories);
  console.log(`[seed] categories: ${c.inserted}`);

  const v = await seedVehicles(sb, vehicles);
  console.log(`[seed] vehicles:   ${v.inserted}`);

  const s = await seedSellers(sb, sellers);
  console.log(`[seed] sellers:    ${s.inserted}`);

  const p = await seedDemoPlates(sb, demoPlates);
  console.log(`[seed] plates:     ${p.inserted}`);

  console.log("[seed] done.");
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
