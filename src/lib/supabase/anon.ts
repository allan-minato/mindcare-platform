import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseCredentials } from "@/lib/supabase/public-env";

/** Cliente anon sem cookies — leitura pública de publicações. */
export function createAnonClient() {
  const { url, publishableKey } = supabaseCredentials();
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
