/**
 * /api/decode-vin?vin=WVWZZZ1KZG1234567
 *
 * Two-step decode:
 *   1. Local WMI lookup (instant)
 *   2. Supabase vehicles table lookup by vin_prefix (when connected)
 *
 * Returns redirect slug or vehicle data for the UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { decodeVinLocal } from "@/lib/vin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const vin = req.nextUrl.searchParams.get("vin")?.toUpperCase().trim();

  if (!vin) {
    return NextResponse.json({ error: "VIN manquant" }, { status: 400 });
  }

  // Step 1: local decode (always fast)
  const local = decodeVinLocal(vin);

  if (!local.isValid) {
    return NextResponse.json({ error: local.error, vin }, { status: 422 });
  }

  // Step 2: Supabase vehicles lookup (when connected)
  let dbVehicle: {
    id: string;
    make: string;
    model: string;
    year_from: number;
    year_to: number | null;
    fuel_type: string | null;
    kw: number | null;
  } | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      type VehicleRow = {
        id: string;
        make: string;
        model: string;
        year_from: number;
        year_to: number | null;
        fuel_type: string | null;
        kw: number | null;
      };

      const { data } = await supabase
        .from("vehicles")
        .select("id, make, model, year_from, year_to, fuel_type, kw")
        .contains("vin_prefix", [vin.slice(0, 3)])
        .order("year_from", { ascending: false })
        .limit(1)
        .returns<VehicleRow[]>()
        .maybeSingle();

      dbVehicle = data;
    } catch {
      // Supabase not available — use local decode only
    }
  }

  const make  = dbVehicle?.make  ?? local.make;
  const model = dbVehicle?.model ?? null;
  const year  = dbVehicle?.year_from ?? local.modelYear;

  // Build redirect slug if we have enough data
  const makeSlug  = make?.toLowerCase().replace(/\s+/g, "-");
  const modelSlug = model?.toLowerCase().replace(/[\s/]+/g, "-");
  const redirectTo =
    makeSlug && modelSlug && year
      ? `/pieces/${makeSlug}/${modelSlug}/${year}`
      : makeSlug
      ? `/marques/${makeSlug}`
      : null;

  return NextResponse.json({
    vin,
    make,
    model,
    year,
    country: local.country,
    wmi: local.wmi,
    fuelType: dbVehicle?.fuel_type ?? null,
    kw: dbVehicle?.kw ?? null,
    redirectTo,
    source: dbVehicle ? "supabase" : "local_wmi",
  });
}
