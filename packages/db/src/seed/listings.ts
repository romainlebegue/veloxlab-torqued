import type { PartCondition } from "../../index";
import { parts } from "./parts";
import { sellers } from "./sellers";
import type { SeedListing } from "./types";

/**
 * Listing generator.
 * Produces ~8 sellers × ~30 parts × ~2 conditions avg ≈ 400-500 deterministic
 * listings. Pricing is category × condition × seller-tier biased. REC listings
 * carry real-shape provenance (VIN + km + dismantler + cert).
 */

type SellerProfile = {
  slug: string;
  conditions: PartCondition[];
  priceBias: number;              // 1.0 = baseline
  freeShipAbove: number | null;   // EUR threshold for free shipping
  shipFlat: number;               // default shipping fee when below threshold
  leadMin: number;
  leadMax: number;
};

const SELLER_PROFILES: SellerProfile[] = [
  { slug: "autoparts-paris",     conditions: ["new_oe", "new_iam"],              priceBias: 1.00, freeShipAbove: 50,  shipFlat: 5.90, leadMin: 1, leadMax: 2 },
  { slug: "teileprofi-berlin",   conditions: ["new_oe", "new_oes", "new_iam"],   priceBias: 0.92, freeShipAbove: 60,  shipFlat: 6.90, leadMin: 2, leadMax: 4 },
  { slug: "motorspares-uk",      conditions: ["new_iam", "used_untraced"],        priceBias: 0.85, freeShipAbove: null, shipFlat: 9.90, leadMin: 3, leadMax: 5 },
  { slug: "recambios-madrid",    conditions: ["new_iam", "reman"],                priceBias: 0.90, freeShipAbove: null, shipFlat: 7.50, leadMin: 3, leadMax: 6 },
  { slug: "autoczesci-poznan",   conditions: ["new_iam", "reman"],                priceBias: 0.78, freeShipAbove: null, shipFlat: 12.90, leadMin: 4, leadMax: 7 },
  { slug: "recyclauto-lyon",     conditions: ["rec_traced", "reman"],             priceBias: 1.00, freeShipAbove: 80,  shipFlat: 9.90, leadMin: 2, leadMax: 4 },
  { slug: "ovoko-dismantler",    conditions: ["used_untraced", "rec_traced"],     priceBias: 0.85, freeShipAbove: null, shipFlat: 14.90, leadMin: 5, leadMax: 9 },
  { slug: "ricambi-milano",      conditions: ["new_iam", "used_untraced"],        priceBias: 0.88, freeShipAbove: null, shipFlat: 8.90, leadMin: 3, leadMax: 6 },
];

const CATEGORY_BASE: Record<string, { min: number; max: number }> = {
  "brake-discs": { min: 35, max: 90 },
  "alternators": { min: 180, max: 450 },
  "headlights": { min: 120, max: 380 },
};

const CONDITION_MULT: Record<PartCondition, number> = {
  new_oe: 1.35,
  new_oes: 1.12,
  new_iam: 1.00,
  reman: 0.60,
  rec_traced: 0.48,
  used_untraced: 0.30,
};

const CONDITION_LABEL: Record<PartCondition, string> = {
  new_oe: "NEUF OE",
  new_oes: "NEUF OES",
  new_iam: "NEUF IAM",
  reman: "Reconditionné",
  rec_traced: "Recyclé certifié",
  used_untraced: "Occasion",
};

// ============================================================
// Deterministic pseudo-random from string key (FNV-1a-ish)
// ============================================================
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function pick<T>(arr: T[], key: string): T {
  return arr[Math.floor(hashStr(key) * arr.length) % arr.length];
}

// ============================================================
// Provenance generator (rec_traced only)
// ============================================================
const DISMANTLERS = [
  { name: "RecyclAuto Lyon",    cert: "VHU-FR-044-2019", country: "FR" },
  { name: "Casse Delage 93",    cert: "VHU-FR-093-2020", country: "FR" },
  { name: "Dismantler Berlin",  cert: "VHU-DE-011-2018", country: "DE" },
  { name: "UAB Ovoko Partner",  cert: "VHU-LT-027-2021", country: "LT" },
  { name: "Desguace Málaga",    cert: "VHU-ES-029-2019", country: "ES" },
];

const VIN_WMIS = ["VF1", "VF3", "VF7", "WVW", "WAU", "WBA", "W1K", "ZFA", "VNE", "SB1"];

function genVin(key: string): string {
  // 17 chars: WMI (3) + VDS (6) + VIS (8). Deterministic from key.
  const wmi = pick(VIN_WMIS, key + "-wmi");
  const chars = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ";
  let rest = "";
  for (let i = 0; i < 14; i++) {
    rest += chars[Math.floor(hashStr(key + "-vin-" + i) * chars.length)];
  }
  return wmi + rest;
}

function genProvenance(partSlug: string, sellerSlug: string) {
  const key = `${partSlug}-${sellerSlug}-prov`;
  const dismantler = pick(DISMANTLERS, key);
  const donor_km = 40000 + Math.floor(hashStr(key + "-km") * 120000); // 40k-160k
  const year = 2016 + Math.floor(hashStr(key + "-yr") * 7);           // 2016-2022
  return {
    donor_vin: genVin(key),
    donor_km,
    dismantler: dismantler.name,
    dismantler_cert: dismantler.cert,
    removed_at: `${year}-${String(1 + Math.floor(hashStr(key + "-m") * 12)).padStart(2, "0")}-15`,
    notes: donor_km < 80000 ? "Faible kilométrage, état A" : "Kilométrage moyen, état B",
  };
}

// ============================================================
// Main generator
// ============================================================
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function basePriceFor(partSlug: string, categorySlug: string): number {
  const range = CATEGORY_BASE[categorySlug] ?? { min: 50, max: 150 };
  const r = hashStr(partSlug + "-base");
  return range.min + r * (range.max - range.min);
}

export function generateListings(): SeedListing[] {
  const profileBySlug = new Map(SELLER_PROFILES.map((p) => [p.slug, p]));
  const partsBySlug = new Map(parts.map((p) => [p.slug, p]));
  const sellerSlugs = new Set(sellers.map((s) => s.slug));

  const out: SeedListing[] = [];

  for (const part of parts) {
    const base = basePriceFor(part.slug, part.category_slug);

    for (const profile of SELLER_PROFILES) {
      if (!sellerSlugs.has(profile.slug)) continue;

      for (const condition of profile.conditions) {
        // Skip expensive conditions if base is very low (keeps demo sane)
        if (condition === "new_oe" && base < 80 && part.category_slug === "brake-discs") {
          // Fine for brake discs
        }

        const key = `${part.slug}-${profile.slug}-${condition}`;
        // Jitter ±10%
        const jitter = 0.9 + hashStr(key + "-j") * 0.2;
        const raw = base * CONDITION_MULT[condition] * profile.priceBias * jitter;
        const price_amount = Math.round(raw * 100) / 100;

        const shipping_fee = profile.freeShipAbove != null && price_amount >= profile.freeShipAbove
          ? 0
          : profile.shipFlat;

        const stock_quantity = condition === "rec_traced" || condition === "used_untraced"
          ? 1 + Math.floor(hashStr(key + "-s") * 3)
          : 3 + Math.floor(hashStr(key + "-s") * 18);

        const title = `${part.display_name} — ${CONDITION_LABEL[condition]}`;

        const listing: SeedListing = {
          part_slug: part.slug,
          seller_slug: profile.slug,
          condition,
          title,
          price_amount,
          price_currency: "EUR",
          shipping_fee,
          free_shipping_threshold: profile.freeShipAbove,
          delivery_lead_days_min: profile.leadMin,
          delivery_lead_days_max: profile.leadMax,
          stock_quantity: clamp(stock_quantity, 1, 25),
          source_external_id: `demo-${part.slug}-${condition}`,
        };

        if (condition === "rec_traced") {
          listing.provenance = genProvenance(part.slug, profile.slug);
        }

        out.push(listing);
      }
    }

    // Silence unused-var warning if part never matched
    void profileBySlug;
    void partsBySlug;
  }

  return out;
}

export const listings = generateListings();
