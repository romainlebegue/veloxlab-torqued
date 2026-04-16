/**
 * /go/[source]/[id] — affiliate redirect with tracking.
 * SSR: never cache — each click must be tracked.
 *
 * Logs the click, then 302-redirects to the seller URL.
 * The `id` is the listing ID (sha1 of source:external_id).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Params {
  source: string;
  id: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { source, id } = params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("listings")
    .select("url, is_active")
    .eq("id", id)
    .eq("source", source)
    .returns<{ url: string; is_active: boolean }[]>()
    .maybeSingle();

  if (!data?.url || !data.is_active) {
    return NextResponse.redirect("https://torqued.veloxlab.co", { status: 302 });
  }

  // TODO: log click event to PostHog / price_history

  return NextResponse.redirect(data.url, { status: 302 });
}
