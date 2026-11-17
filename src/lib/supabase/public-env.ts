export type PublicSupabaseEnv = {
  url: string | null;
  hasPublishableKey: boolean;
};

export type SupabaseCredentials = {
  url: string;
  publishableKey: string;
};

function readPublicSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "",
  };
}

export function publicSupabaseEnv(): PublicSupabaseEnv {
  const { url, publishableKey } = readPublicSupabaseEnv();

  return {
    url: url.length > 0 ? url : null,
    hasPublishableKey: publishableKey.length > 0,
  };
}

export function supabaseCredentials(): SupabaseCredentials {
  const { url, publishableKey } = readPublicSupabaseEnv();

  if (url.length === 0 || publishableKey.length === 0) {
    throw new Error(
      "Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}
