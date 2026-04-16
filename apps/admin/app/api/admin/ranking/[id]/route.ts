/**
 * PATCH /api/admin/ranking/[id] — update a ranking rule
 * DELETE /api/admin/ranking/[id] — delete a ranking rule
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

const EDITABLE_FIELDS = new Set([
  "weight_checkout", "weight_boost", "weight_quality",
  "weight_eco", "weight_price", "weight_shipping",
  "is_active", "valid_from", "valid_to", "notes",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const supabase = adminClient();

  // Whitelist editable fields — never allow source or checkout_type changes
  const patch: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(body)) {
    if (EDITABLE_FIELDS.has(key)) patch[key] = val;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("ranking_rules")
    .update(patch)
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("ranking_rules")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
