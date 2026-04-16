/**
 * rank-offers — Supabase Edge Function
 *
 * Applies the scoring formula from CLAUDE.md to a list of offers.
 * Reads weights from ranking_rules table (editable without redeploy — ADR-005).
 *
 * POST body: { offers: Listing[] }
 * Response:  { ranked: RankedOffer[] }
 *
 * SECURITY: weights are never exposed to the client.
 * Sponsored tag is added when commercial_boost > 0 (EU DSA / Omnibus Directive — ADR-003).
 *
 * Deploy: supabase functions deploy rank-offers
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Listing {
  id: string;
  source: string;
  price_eur: number;
  shipping_cost_eur: number | null;
  is_rec: boolean;
  stock_qty: number | null;
  warranty_months: number | null;
  seller_name: string | null;
  [key: string]: unknown;
}

interface RankingRule {
  source: string;
  checkout_type: string;
  weight_checkout: number;
  weight_boost: number;
  weight_quality: number;
  weight_eco: number;
  weight_price: number;
  weight_shipping: number;
  is_active: boolean;
  valid_from: string | null;
  valid_to: string | null;
}

interface SellerMeta {
  source: string;
  checkout_type: "direct" | "affiliate" | "cpc" | "organic";
  commercial_boost: number;   // 0–5, from commercial agreements
  rating: number;             // 0–5 seller rating
  ship_days: number;          // estimated shipping days
}

interface RankedOffer extends Listing {
  score: number;
  checkout_type: "direct" | "affiliate" | "cpc" | "organic";
  commercial_boost: number;
  is_sponsored: boolean;      // true when commercial_boost > 0 (must display tag)
}

// Seller metadata: commercial agreements + checkout types.
// This is the ONLY place checkout_type and commercial_boost are defined.
// Never expose this to the client.
const SELLER_META: Record<string, Partial<SellerMeta>> = {
  ebay_fr:    { checkout_type: "affiliate", commercial_boost: 0, rating: 4.0, ship_days: 4 },
  ebay_de:    { checkout_type: "affiliate", commercial_boost: 0, rating: 4.0, ship_days: 5 },
  ebay_uk:    { checkout_type: "affiliate", commercial_boost: 0, rating: 4.0, ship_days: 6 },
  ebay_es:    { checkout_type: "affiliate", commercial_boost: 0, rating: 4.0, ship_days: 5 },
  autodoc:    { checkout_type: "affiliate", commercial_boost: 0, rating: 4.2, ship_days: 3 },
  rockauto:   { checkout_type: "affiliate", commercial_boost: 0, rating: 3.8, ship_days: 7 },
  mister_auto:{ checkout_type: "affiliate", commercial_boost: 0, rating: 4.3, ship_days: 2 },
  oscaro:     { checkout_type: "affiliate", commercial_boost: 0, rating: 4.1, ship_days: 2 },
  ovoko:      { checkout_type: "affiliate", commercial_boost: 0, rating: 3.5, ship_days: 5 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { offers } = (await req.json()) as { offers: Listing[] };

    if (!Array.isArray(offers) || offers.length === 0) {
      return new Response(JSON.stringify({ ranked: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load active ranking rules from DB (business-editable without redeploy)
    const weights = await loadWeights(supabase, offers.map((o) => o.source));

    const ranked = scoreOffers(offers, weights);

    return new Response(JSON.stringify({ ranked }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("rank-offers error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ------------------------------------------------------------------
// Load weights from ranking_rules (source-specific > wildcard fallback)
// ------------------------------------------------------------------
async function loadWeights(
  supabase: ReturnType<typeof createClient>,
  sources: string[]
): Promise<Map<string, RankingRule>> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("ranking_rules")
    .select(
      "source, checkout_type, weight_checkout, weight_boost, weight_quality, " +
        "weight_eco, weight_price, weight_shipping, is_active, valid_from, valid_to"
    )
    .eq("is_active", true)
    .or(`valid_from.is.null,valid_from.lte.${now}`)
    .or(`valid_to.is.null,valid_to.gte.${now}`)
    .in("source", [...sources, "*"]);

  if (error) throw error;

  const map = new Map<string, RankingRule>();
  for (const rule of data ?? []) {
    const key = `${rule.source}:${rule.checkout_type}`;
    // Source-specific rules take precedence over wildcard
    if (!map.has(key) || rule.source !== "*") {
      map.set(key, rule as RankingRule);
    }
  }
  return map;
}

// ------------------------------------------------------------------
// Scoring formula (from CLAUDE.md)
//
// score =
//   weights.checkout[checkout_type]           // direct=10, affiliate=4, cpc=2
//   + commercial_boost * weight_boost         // sponsored partner
//   + (rating / 5) * weight_quality * 5
//   + (is_rec ? weight_eco : 0)
//   + priceScore * weight_price               // cheapest = +3
//   + shippingPenalty * weight_shipping
//   + deliveryBonus                           // ≤2d=+2, ≤4d=+1
// ------------------------------------------------------------------
function scoreOffers(
  offers: Listing[],
  weights: Map<string, RankingRule>
): RankedOffer[] {
  const prices = offers.map((o) => o.price_eur + (o.shipping_cost_eur ?? 0));
  const minTotal = Math.min(...prices);
  const maxTotal = Math.max(...prices);
  const priceRange = maxTotal - minTotal || 1;

  return offers
    .map((offer): RankedOffer => {
      const meta: SellerMeta = {
        source: offer.source,
        checkout_type: "affiliate",
        commercial_boost: 0,
        rating: 4.0,
        ship_days: 5,
        ...SELLER_META[offer.source],
      };

      // Resolve weights: source-specific first, then wildcard
      const ruleKey = `${offer.source}:${meta.checkout_type}`;
      const wildcardKey = `*:${meta.checkout_type}`;
      const rule = weights.get(ruleKey) ?? weights.get(wildcardKey);

      const w = rule ?? {
        weight_checkout: meta.checkout_type === "direct" ? 10 :
                         meta.checkout_type === "affiliate" ? 4 :
                         meta.checkout_type === "cpc" ? 2 : 0,
        weight_boost: 1,
        weight_quality: 1,
        weight_eco: 2,
        weight_price: 3,
        weight_shipping: 1,
      };

      const checkoutScore  = w.weight_checkout;
      const boostScore     = meta.commercial_boost * w.weight_boost;
      const qualityScore   = (meta.rating / 5) * w.weight_quality * 5;
      const ecoScore       = offer.is_rec ? w.weight_eco : 0;

      const totalPrice     = offer.price_eur + (offer.shipping_cost_eur ?? 0);
      const priceScore     = ((maxTotal - totalPrice) / priceRange) * w.weight_price * 3;

      const shippingPenalty =
        (offer.shipping_cost_eur ?? 0) > 15 ? -w.weight_shipping : 0;

      const deliveryBonus  = meta.ship_days <= 2 ? 2 : meta.ship_days <= 4 ? 1 : 0;

      const score =
        checkoutScore +
        boostScore +
        qualityScore +
        ecoScore +
        priceScore +
        shippingPenalty +
        deliveryBonus;

      return {
        ...offer,
        score: Math.round(score * 100) / 100,
        checkout_type: meta.checkout_type,
        commercial_boost: meta.commercial_boost,
        // ADR-003: Sponsored tag MUST be shown when commercial_boost > 0
        is_sponsored: meta.commercial_boost > 0,
      };
    })
    .sort((a, b) => b.score - a.score);
}
