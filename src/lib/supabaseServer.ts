import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _serviceSupabase: SupabaseClient | null = null;

/**
 * Returns a lazily-initialised Supabase service-role client shared across
 * all server-side routes. Returns null if the required env vars are absent.
 */
export function getServiceSupabase(): SupabaseClient | null {
  if (_serviceSupabase) return _serviceSupabase;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  _serviceSupabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _serviceSupabase;
}
