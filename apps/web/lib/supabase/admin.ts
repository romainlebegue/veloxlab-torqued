import { createClient } from "@supabase/supabase-js";
import type { Database } from "@torqued/db";

/**
 * Service-role client — ONLY for server-side API routes and Edge Functions.
 * NEVER import this in Client Components or pass to the browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}
