/**
 * GET /api/admin/ranking — list all ranking rules
 * POST /api/admin/ranking — create a new rule
 *
 * Uses service_role key — admin app must never be public.
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@partfinder/db";

function adminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("ranking_rules")
    .select(
      "id, source, checkout_type, weight_checkout, weight_boost, " +
      "weight_quality, weight_eco, weight_price, weight_shipping, " +
      "is_active, valid_from, valid_to, notes"
    )
    .order("source")
    .order("checkout_type");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = adminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("ranking_rules")
    .insert({
      source:          body.source ?? "*",
      checkout_type:   body.checkout_type,
      weight_checkout: body.weight_checkout ?? 4,
      weight_boost:    body.weight_boost ?? 1,
      weight_quality:  body.weight_quality ?? 1,
      weight_eco:      body.weight_eco ?? 2,
      weight_price:    body.weight_price ?? 3,
      weight_shipping: body.weight_shipping ?? 1,
      is_active:       body.is_active ?? true,
      notes:           body.notes ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json(data, { status: 201 });
}
