import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@partfinder/db";

/**
 * Server Component / Route Handler Supabase client.
 * Uses anon key + RLS. For service-role operations use createAdminClient().
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookie writes are ignored (read-only context)
          }
        },
      },
    }
  );
}
