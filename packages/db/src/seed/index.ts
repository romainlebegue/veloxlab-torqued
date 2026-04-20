import { config as loadEnv } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { categories } from "./categories";
import { vehicles } from "./vehicles";
import { sellers } from "./sellers";
import { demoPlates } from "./demo-plates";
import { parts } from "./parts";
import { listings } from "./listings";
import type {
  SeedCategory,
  SeedDemoPlate,
  SeedPart,
  SeedSeller,
  SeedVehicle,
} from "./types";

// Load .env.local from repo root (two levels up from packages/db)
import { resolve } from "path";
loadEnv({ path: [resolve(__dirname, "../../../../.env.local"), resolve(__dirname, "../../../../.env")] });

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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ============================================================
// categories — upsert on slug
// ============================================================
async function seedCategories(sb: Supabase, rows: SeedCategory[]) {
  if (rows.length === 0) return;
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
  console.log(`[seed] categories: ${ordered.length}`);
}

// ============================================================
// vehicles — upsert on slug (batched)
// ============================================================
async function seedVehicles(sb: Supabase, rows: SeedVehicle[]) {
  if (rows.length === 0) return;

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
    display_name:
      v.display_name ?? `${v.make} ${v.model}${v.variant ? " " + v.variant : ""}`,
    primary_markets: v.primary_markets ?? ["fr"],
    data_source: v.data_source ?? "manual",
  }));

  for (const batch of chunk(payload, 250)) {
    const { error } = await sb.from("vehicles").upsert(batch, { onConflict: "slug" });
    if (error) throw error;
  }
  console.log(`[seed] vehicles:   ${rows.length}`);
}

// ============================================================
// sellers — wipe is_demo, then insert
// ============================================================
async function seedSellers(sb: Supabase, rows: SeedSeller[]) {
  if (rows.length === 0) return new Map<string, string>();

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
    const hit = data?.find((d: { display_name: string }) => d.display_name === r.display_name);
    if (hit) slugToId.set(r.slug, hit.id);
  });
  console.log(`[seed] sellers:    ${rows.length}`);
  return slugToId;
}

// ============================================================
// parts — upsert on slug (batched), resolve category_slug → category_id
// ============================================================
async function seedParts(sb: Supabase, rows: SeedPart[]) {
  if (rows.length === 0) return new Map<string, string>();

  // Resolve categories
  const catSlugs = Array.from(new Set(rows.map((p) => p.category_slug)));
  const { data: catRows, error: catErr } = await sb
    .from("categories")
    .select("id, slug")
    .in("slug", catSlugs);
  if (catErr) throw catErr;

  const catMap = new Map<string, string>((catRows ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id]));
  const missingCat = catSlugs.filter((s) => !catMap.has(s));
  if (missingCat.length > 0) {
    throw new Error(`parts: missing categories in DB: ${missingCat.join(", ")}`);
  }

  const payload = rows.map((p) => ({
    slug: p.slug,
    display_name: p.display_name,
    display_name_i18n: p.display_name_i18n ?? {},
    oe_numbers: p.oe_numbers,
    iam_numbers: p.iam_numbers,
    category_id: catMap.get(p.category_slug)!,
    subcategory: p.subcategory ?? null,
    technical_attributes: p.technical_attributes ?? {},
    primary_image_url: p.primary_image_url ?? null,
  }));

  for (const batch of chunk(payload, 200)) {
    const { error } = await sb.from("parts").upsert(batch, { onConflict: "slug" });
    if (error) throw error;
  }

  const { data: partRows, error: fetchErr } = await sb
    .from("parts")
    .select("id, slug")
    .in("slug", rows.map((r) => r.slug));
  if (fetchErr) throw fetchErr;

  const slugToId = new Map<string, string>(
    (partRows ?? []).map((p: { id: string; slug: string }) => [p.slug, p.id]),
  );
  console.log(`[seed] parts:      ${rows.length}`);
  return slugToId;
}

// ============================================================
// fitment_edges — expand parts.fits_vehicle_slugs
// ============================================================
async function seedFitmentEdges(
  sb: Supabase,
  partSlugToId: Map<string, string>,
): Promise<void> {
  if (parts.length === 0) return;

  const allVehicleSlugs = Array.from(
    new Set(parts.flatMap((p) => p.fits_vehicle_slugs)),
  );
  const { data: vehicleRows, error: vErr } = await sb
    .from("vehicles")
    .select("id, slug")
    .in("slug", allVehicleSlugs);
  if (vErr) throw vErr;

  const vehicleMap = new Map<string, string>(
    (vehicleRows ?? []).map((v: { id: string; slug: string }) => [v.slug, v.id]),
  );

  const missing: string[] = [];
  const edges: Array<{
    part_id: string;
    vehicle_id: string;
    source: string;
    governance_level: string;
    confidence: number;
    evidence: Record<string, unknown>;
    active: boolean;
  }> = [];

  for (const part of parts) {
    const part_id = partSlugToId.get(part.slug);
    if (!part_id) continue;
    for (const vSlug of part.fits_vehicle_slugs) {
      const vehicle_id = vehicleMap.get(vSlug);
      if (!vehicle_id) {
        missing.push(`${part.slug} → ${vSlug}`);
        continue;
      }
      edges.push({
        part_id,
        vehicle_id,
        source: "human_validated",
        governance_level: "L3_human",
        confidence: 0.9,
        evidence: { seeded_by: "torqued-prototype-seed", version: 1 },
        active: true,
      });
    }
  }

  if (missing.length > 0) {
    console.warn(`[seed] fitment: ${missing.length} missing vehicle slugs (ignored):`);
    missing.slice(0, 20).forEach((m) => console.warn(`  - ${m}`));
    if (missing.length > 20) console.warn(`  … and ${missing.length - 20} more`);
  }

  for (const batch of chunk(edges, 500)) {
    const { error } = await sb
      .from("fitment_edges")
      .upsert(batch, { onConflict: "part_id,vehicle_id,source" });
    if (error) throw error;
  }
  console.log(`[seed] fitment:    ${edges.length} edges`);
}

// ============================================================
// listings — wipe is_demo, then insert (cascades LVA)
// ============================================================
async function seedListings(
  sb: Supabase,
  sellerSlugToId: Map<string, string>,
  partSlugToId: Map<string, string>,
): Promise<Map<string, string>> {
  if (listings.length === 0) return new Map();

  const { error: delErr } = await sb.from("listings").delete().eq("is_demo", true);
  if (delErr) throw delErr;

  const payload: Array<Record<string, unknown>> = [];
  const keys: string[] = []; // parallel array: same index = same row key

  for (const l of listings) {
    const seller_id = sellerSlugToId.get(l.seller_slug);
    const part_id = partSlugToId.get(l.part_slug);
    if (!seller_id || !part_id) continue;

    payload.push({
      seller_id,
      part_id,
      ingestion_source: "native_import",
      source_external_id: l.source_external_id,
      condition: l.condition,
      price_amount: l.price_amount,
      price_currency: l.price_currency ?? "EUR",
      shipping_fee: l.shipping_fee ?? null,
      free_shipping_threshold: l.free_shipping_threshold ?? null,
      delivery_lead_days_min: l.delivery_lead_days_min ?? null,
      delivery_lead_days_max: l.delivery_lead_days_max ?? null,
      stock_quantity: l.stock_quantity ?? 1,
      stock_status: "in_stock",
      title: l.title,
      description: l.description ?? null,
      status: "active",
      fitment_resolved: true,
      checkout_path: "affiliate",
      provenance: l.provenance ?? {},
      is_demo: true,
    });
    keys.push(`${l.seller_slug}::${l.source_external_id}`);
  }

  const idByKey = new Map<string, string>();

  for (let i = 0; i < payload.length; i += 500) {
    const batch = payload.slice(i, i + 500);
    const batchKeys = keys.slice(i, i + 500);
    const { data, error } = await sb
      .from("listings")
      .insert(batch)
      .select("id, seller_id, source_external_id");
    if (error) throw error;

    // Map id back to our key
    (data ?? []).forEach((row: { id: string; seller_id: string; source_external_id: string }) => {
      // Reverse-lookup: find the seller slug from id
      const sellerSlug = [...sellerSlugToId.entries()].find(
        ([, id]) => id === row.seller_id,
      )?.[0];
      if (sellerSlug) {
        idByKey.set(`${sellerSlug}::${row.source_external_id}`, row.id);
      }
    });

    void batchKeys;
  }

  console.log(`[seed] listings:   ${payload.length}`);
  return idByKey;
}

// ============================================================
// listing_vehicle_applicability — denormalize fitment × listings
// ============================================================
async function seedApplicability(
  sb: Supabase,
  listingIdByKey: Map<string, string>,
  partSlugToId: Map<string, string>,
): Promise<void> {
  // Pull the authoritative set of (part_id, vehicle_id, confidence, level)
  const partIds = Array.from(partSlugToId.values());
  if (partIds.length === 0) return;

  const { data: edges, error } = await sb
    .from("fitment_edges")
    .select("part_id, vehicle_id, confidence, governance_level")
    .in("part_id", partIds)
    .eq("active", true);
  if (error) throw error;

  // Aggregate max confidence per (part, vehicle)
  const agg = new Map<string, { confidence: number; level: string }>();
  for (const e of edges ?? []) {
    const key = `${e.part_id}::${e.vehicle_id}`;
    const prev = agg.get(key);
    if (!prev || e.confidence > prev.confidence) {
      agg.set(key, { confidence: e.confidence, level: e.governance_level });
    }
  }

  // For each listing (which has a part_id), emit one LVA row per vehicle
  const partIdBySlug = new Map<string, string>(
    Array.from(partSlugToId.entries()).map(([slug, id]) => [id, slug]),
  );
  void partIdBySlug;

  const rows: Array<Record<string, unknown>> = [];
  for (const l of listings) {
    const key = `${l.seller_slug}::${l.source_external_id}`;
    const listing_id = listingIdByKey.get(key);
    if (!listing_id) continue;

    const part_id = partSlugToId.get(l.part_slug);
    if (!part_id) continue;

    for (const [aggKey, agg_entry] of agg.entries()) {
      const [edgePart, edgeVehicle] = aggKey.split("::");
      if (edgePart !== part_id) continue;
      rows.push({
        listing_id,
        vehicle_id: edgeVehicle,
        aggregated_confidence: agg_entry.confidence,
        display_tier: agg_entry.level,
      });
    }
  }

  for (const batch of chunk(rows, 500)) {
    const { error: upErr } = await sb
      .from("listing_vehicle_applicability")
      .upsert(batch, { onConflict: "listing_id,vehicle_id" });
    if (upErr) throw upErr;
  }
  console.log(`[seed] lva:        ${rows.length}`);
}

// ============================================================
// demo plates — upsert on plate
// ============================================================
async function seedDemoPlates(sb: Supabase, rows: SeedDemoPlate[]) {
  if (rows.length === 0) return;

  const slugs = Array.from(new Set(rows.map((r) => r.vehicle_slug)));
  const { data: vehicleRows, error: vErr } = await sb
    .from("vehicles")
    .select("id, slug")
    .in("slug", slugs);
  if (vErr) throw vErr;

  const slugToId = new Map((vehicleRows ?? []).map((v: { id: string; slug: string }) => [v.slug, v.id]));
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
  console.log(`[seed] plates:     ${rows.length}`);
}

// ============================================================
// Runner
// ============================================================
export async function seed() {
  const sb = createSeedClient();
  console.log("[seed] starting…");

  await seedCategories(sb, categories);
  await seedVehicles(sb, vehicles);
  const sellerSlugToId = await seedSellers(sb, sellers);
  const partSlugToId = await seedParts(sb, parts);
  await seedFitmentEdges(sb, partSlugToId);
  const listingIdByKey = await seedListings(sb, sellerSlugToId, partSlugToId);
  await seedApplicability(sb, listingIdByKey, partSlugToId);
  await seedDemoPlates(sb, demoPlates);

  console.log("[seed] done.");
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
