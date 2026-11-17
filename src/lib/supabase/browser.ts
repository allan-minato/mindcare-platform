import { createBrowserClient } from "@supabase/ssr";

import { supabaseCredentials } from "@/lib/supabase/public-env";

export function createClient() {
  const { url, publishableKey } = supabaseCredentials();

  return createBrowserClient(url, publishableKey);
}
