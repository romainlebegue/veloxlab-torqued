/**
 * /api/sitemap-parts?page=1
 * Dynamic sitemap for part pages, generated from Supabase.
 * Max 50k URLs per response (SEO rule).
 * Called by Vercel Edge to serve /sitemap-parts-[n].xml
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

const PAGE_SIZE = 50_000;

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  // Fetch active listings grouped to generate URLs
  // Using vehicles + fitment + parts_catalog for canonical URLs
  type SitemapRow = {
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_years: string | null;
    last_seen_at: string | null;
  };

  const { data, error } = await supabase
    .from("listings")
    .select("vehicle_make, vehicle_model, vehicle_years, last_seen_at")
    .eq("is_active", true)
    .not("vehicle_make", "is", null)
    .not("vehicle_model", "is", null)
    .range(offset, offset + PAGE_SIZE - 1)
    .order("last_seen_at", { ascending: false })
    .returns<SitemapRow[]>();

  if (error) {
    return new Response("Internal error", { status: 500 });
  }

  const base = "https://torqued.veloxlab.co";
  const urls = (data ?? [])
    .map((row) => {
      const make = row.vehicle_make?.toLowerCase().replace(/\s+/g, "-");
      const model = row.vehicle_model?.toLowerCase().replace(/\s+/g, "-");
      const year = row.vehicle_years?.split("-")[0] ?? null;
      if (!make || !model || !year) return null;
      return `<url><loc>${base}/pieces/${make}/${model}/${year}</loc><lastmod>${
        row.last_seen_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
      }</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400", // 24h cache
    },
  });
}
