/**
 * search.ts — client for the search-parts Edge Function.
 * Used in Server Components only (never call from browser).
 */

const EDGE_FN_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/search-parts`;
const EDGE_FN_AUTH = `Bearer ${process.env.SUPABASE_SERVICE_KEY}`;

export interface PartGroup {
  part_number_normalized: string;
  part_name: string;
  brand_name: string | null;
  category_slug: string | null;
  low_price_eur: number;
  offer_count: number;
  has_rec: boolean;
  image_url: string | null;
  offers: RankedOffer[];
}

export interface RankedOffer {
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
  score: number;
  checkout_type: "direct" | "affiliate" | "cpc" | "organic";
  commercial_boost: number;
  is_sponsored: boolean;
}

export interface SearchResponse {
  total: number;
  page: number;
  results: PartGroup[];
}

export async function searchByFitment(params: {
  make: string;
  model: string;
  year: string;
  category: string;
  sort?: string;
  page?: number;
}): Promise<SearchResponse | null> {
  const qs = new URLSearchParams({
    make: params.make,
    model: params.model,
    year: params.year,
    category: params.category,
    sort: params.sort ?? "smart",
    page: String(params.page ?? 1),
  });

  try {
    const res = await fetch(`${EDGE_FN_URL}?${qs}`, {
      headers: { Authorization: EDGE_FN_AUTH },
      next: { revalidate: 14400 }, // ISR 4h
    });
    if (!res.ok) return null;
    return (await res.json()) as SearchResponse;
  } catch {
    return null;
  }
}

export async function searchByPartNumber(
  partNumber: string
): Promise<SearchResponse | null> {
  const qs = new URLSearchParams({ part_number: partNumber });
  try {
    const res = await fetch(`${EDGE_FN_URL}?${qs}`, {
      headers: { Authorization: EDGE_FN_AUTH },
      next: { revalidate: 14400 },
    });
    if (!res.ok) return null;
    return (await res.json()) as SearchResponse;
  } catch {
    return null;
  }
}
