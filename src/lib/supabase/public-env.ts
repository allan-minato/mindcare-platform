export type PublicSupabaseEnv = {
  url: string | null;
  hasPublishableKey: boolean;
};

export function publicSupabaseEnv(): PublicSupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  return {
    url: url.length > 0 ? url : null,
    hasPublishableKey: publishableKey.length > 0,
  };
}
