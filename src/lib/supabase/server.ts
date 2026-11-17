import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseCredentials } from "@/lib/supabase/public-env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = supabaseCredentials();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component não grava cookie. O proxy renova a sessão.
        }
      },
    },
  });
}
