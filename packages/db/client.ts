import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Server-side Supabase client (uses service role key — NEVER use in client components).
 * Import via: import { supabaseAdmin } from "@partfinder/db/client"
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY env var"
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Public anon client — safe for server components and API routes with RLS.
 */
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env var"
    );
  }

  return createClient<Database>(url, key);
}
