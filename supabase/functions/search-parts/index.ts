/**
 * search-parts — Supabase Edge Function
 *
 * Fitment-based part search. Two modes:
 *   1. Fitment search: ?make=volkswagen&model=golf-7&year=2016&category=disques-de-frein
 *   2. Part number search: ?part_number=34116792217
 *
 * Returns: array of PartGroup (one per unique part ref, with offers inside)
 * Ranking is delegated to the rank-offers Edge Function.
 *
 * Deploy: supabase functions deploy search-parts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchParams {
  make?: string;
  model?: string;
  year?: number;
  category?: string;
  part_number?: string;
  sort?: "smart" | "price" | "eco" | "rating" | "delivery";
  page?: number;
  limit?: number;
}

interface Listing {
  id: string;
  source: string;
  url: string;
  title: string;
  part_number: string | null;
  brand: string | null;
  condition: string;
  part_type: string;
  price_eur: number;
  shipping_cost_eur: number | null;
  shipping_to: string[] | null;
  seller_name: string | null;
  seller_country: string | null;
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
}

interface PartGroup {
  part_number_normalized: string;
  part_name: string;
  brand_name: string | null;
  category_slug: string | null;
  low_price_eur: number;
  offer_count: number;
  has_rec: boolean;
  image_url: string | null;
  offers: Listing[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const params: SearchParams = {
      make: url.searchParams.get("make") ?? undefined,
      model: url.searchParams.get("model") ?? undefined,
      year: url.searchParams.get("year")
        ? parseInt(url.searchParams.get("year")!, 10)
        : undefined,
      category: url.searchParams.get("category") ?? undefined,
      part_number: url.searchParams.get("part_number") ?? undefined,
      sort: (url.searchParams.get("sort") as SearchParams["sort"]) ?? "smart",
      page: parseInt(url.searchParams.get("page") ?? "1", 10),
      limit: Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 50),
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let listings: Listing[] = [];

    if (params.part_number) {
      listings = await searchByPartNumber(supabase, params.part_number, params.limit!);
    } else if (params.make && params.model && params.year && params.category) {
      listings = await searchByFitment(supabase, params as Required<SearchParams>);
    } else {
      return new Response(
        JSON.stringify({
          error: "Provide either part_number or make+model+year+category",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groups = groupByPartNumber(listings);

    // Call rank-offers for smart sort
    if (params.sort === "smart") {
      await rankGroups(supabase, groups);
    } else {
      sortGroups(groups, params.sort!);
    }

    const offset = ((params.page ?? 1) - 1) * (params.limit ?? 20);
    const page = groups.slice(offset, offset + (params.limit ?? 20));

    return new Response(
      JSON.stringify({ total: groups.length, page: params.page, results: page }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("search-parts error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ------------------------------------------------------------------
// Query: fitment-based search
// ------------------------------------------------------------------
async function searchByFitment(
  supabase: ReturnType<typeof createClient>,
  params: { make: string; model: string; year: number; category: string; limit: number }
): Promise<Listing[]> {
  // Step 1: resolve vehicle IDs matching make/model/year
  const { data: vehicles, error: vErr } = await supabase
    .from("vehicles")
    .select("id")
    .ilike("make", params.make.replace(/-/g, " "))
    .ilike("model", params.model.replace(/-/g, " "))
    .lte("year_from", params.year)
    .or(`year_to.is.null,year_to.gte.${params.year}`);

  if (vErr) throw vErr;
  if (!vehicles?.length) return [];

  const vehicleIds = vehicles.map((v: { id: string }) => v.id);

  // Step 2: find part IDs via fitment, filtered by category slug
  const { data: fitments, error: fErr } = await supabase
    .from("fitment")
    .select(
      "part_id, confidence_score, parts_catalog!inner(id, part_number_normalized, name, categories(slug), brands(name))"
    )
    .in("vehicle_id", vehicleIds)
    .gte("confidence_score", 0.5)   // exclude low-confidence scraped fitment
    .order("confidence_score", { ascending: false })
    .limit(200);

  if (fErr) throw fErr;
  if (!fitments?.length) return [];

  const partIds = [...new Set(fitments.map((f: { part_id: string }) => f.part_id))];

  // Step 3: fetch active listings for those parts
  const { data: listings, error: lErr } = await supabase
    .from("listings")
    .select(
      "id, source, url, title, part_number, brand, condition, part_type, price_eur, " +
        "shipping_cost_eur, shipping_to, seller_name, seller_country, image_urls, " +
        "stock_qty, warranty_months, is_rec, rec_grade, rec_donor_vin, rec_donor_km, " +
        "rec_dismantler, rec_dismantler_cert, rec_recall_check"
    )
    .in("part_number", partIds.slice(0, 100))   // guard against huge IN clauses
    .eq("is_active", true)
    .not("rec_recall_check", "eq", false);       // exclude failed recall check

  if (lErr) throw lErr;
  return (listings ?? []) as Listing[];
}

// ------------------------------------------------------------------
// Query: part number lookup
// ------------------------------------------------------------------
async function searchByPartNumber(
  supabase: ReturnType<typeof createClient>,
  rawPartNumber: string,
  limit: number
): Promise<Listing[]> {
  // Normalize client-side (mirrors normalize_part_number in Python)
  const normalized = rawPartNumber.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Find cross-references
  const { data: xrefs, error: xErr } = await supabase
    .from("cross_references")
    .select("part_id")
    .eq("ref_number_normalized", normalized);

  if (xErr) throw xErr;

  // Also try direct part_number_normalized lookup
  const { data: directParts, error: pErr } = await supabase
    .from("parts_catalog")
    .select("id")
    .eq("part_number_normalized", normalized);

  if (pErr) throw pErr;

  const partIds = [
    ...new Set([
      ...(xrefs ?? []).map((x: { part_id: string }) => x.part_id),
      ...(directParts ?? []).map((p: { id: string }) => p.id),
    ]),
  ];

  if (!partIds.length) return [];

  const { data: listings, error: lErr } = await supabase
    .from("listings")
    .select(
      "id, source, url, title, part_number, brand, condition, part_type, price_eur, " +
        "shipping_cost_eur, shipping_to, seller_name, seller_country, image_urls, " +
        "stock_qty, warranty_months, is_rec, rec_grade, rec_donor_vin, rec_donor_km, " +
        "rec_dismantler, rec_dismantler_cert, rec_recall_check"
    )
    .in("part_number", partIds.slice(0, 50))
    .eq("is_active", true)
    .not("rec_recall_check", "eq", false)
    .limit(limit);

  if (lErr) throw lErr;
  return (listings ?? []) as Listing[];
}

// ------------------------------------------------------------------
// Group listings by normalized part number (ADR-002: Kayak model)
// ------------------------------------------------------------------
function groupByPartNumber(listings: Listing[]): PartGroup[] {
  const map = new Map<string, PartGroup>();

  for (const listing of listings) {
    const key = listing.part_number ?? listing.title.slice(0, 40);
    if (!map.has(key)) {
      map.set(key, {
        part_number_normalized: key,
        part_name: listing.title,
        brand_name: listing.brand,
        category_slug: null,
        low_price_eur: listing.price_eur,
        offer_count: 0,
        has_rec: false,
        image_url: listing.image_urls?.[0] ?? null,
        offers: [],
      });
    }
    const group = map.get(key)!;
    group.offers.push(listing);
    group.offer_count++;
    if (listing.price_eur < group.low_price_eur) {
      group.low_price_eur = listing.price_eur;
    }
    if (listing.is_rec) group.has_rec = true;
  }

  return Array.from(map.values());
}

// ------------------------------------------------------------------
// Sort modes
// ------------------------------------------------------------------
function sortGroups(
  groups: PartGroup[],
  mode: "price" | "eco" | "rating" | "delivery"
): void {
  if (mode === "price") {
    groups.sort((a, b) => a.low_price_eur - b.low_price_eur);
    groups.forEach((g) =>
      g.offers.sort((a, b) => a.price_eur - b.price_eur)
    );
  } else if (mode === "eco") {
    groups.sort((a, b) => Number(b.has_rec) - Number(a.has_rec));
    groups.forEach((g) =>
      g.offers.sort((a, b) => Number(b.is_rec) - Number(a.is_rec))
    );
  }
  // rating + delivery: requires seller rating / shipping_days fields (future)
}

// ------------------------------------------------------------------
// Delegate smart ranking to rank-offers Edge Function
// ------------------------------------------------------------------
async function rankGroups(
  supabase: ReturnType<typeof createClient>,
  groups: PartGroup[]
): Promise<void> {
  for (const group of groups) {
    try {
      const resp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/rank-offers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ offers: group.offers }),
        }
      );
      if (resp.ok) {
        const { ranked } = await resp.json();
        group.offers = ranked;
      }
    } catch {
      // Fallback to price sort if rank-offers is unavailable
      group.offers.sort((a, b) => a.price_eur - b.price_eur);
    }
  }

  // Sort groups by best offer score (first offer in ranked list)
  groups.sort((a, b) => {
    const aScore = (a.offers[0] as unknown as { score?: number }).score ?? 0;
    const bScore = (b.offers[0] as unknown as { score?: number }).score ?? 0;
    return bScore - aScore;
  });
}
