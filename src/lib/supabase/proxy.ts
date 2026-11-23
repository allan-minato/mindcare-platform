import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isPublicSiteHost, normalizeHost } from "@/lib/sites/host";
import { supabaseCredentials } from "@/lib/supabase/public-env";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostHeader = request.headers.get("host") ?? request.nextUrl.host;
  // Server Actions POSTam na rota atual. Um redirect HTTP aqui devolve
  // text/html e o cliente quebra com "unexpected response was received".
  const isServerAction =
    request.method === "POST" && request.headers.has("next-action");

  if (shouldRewriteToPublicSite(path, hostHeader)) {
    const rewriteUrl = request.nextUrl.clone();
    const siteHost = normalizeHost(hostHeader);
    const suffix = path === "/" ? "" : path;
    rewriteUrl.pathname = `/_public/${siteHost}${suffix}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, publishableKey } = supabaseCredentials();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isServerAction) {
    return supabaseResponse;
  }

  if ((path.startsWith("/admin") || path.startsWith("/app")) && !user) {
    return redirectKeepingSession(request, "/login", supabaseResponse);
  }

  if (path === "/login" && user) {
    const destination = await resolveProxyHome(supabase, user.id);
    return redirectKeepingSession(request, destination, supabaseResponse);
  }

  return supabaseResponse;
}

async function resolveProxyHome(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
) {
  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (admin) {
    return "/admin";
  }

  const { data: professional } = await supabase
    .from("professional_users")
    .select("auth_user_id")
    .eq("auth_user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (professional) {
    return "/app";
  }

  return "/login";
}

function shouldRewriteToPublicSite(path: string, hostHeader: string): boolean {
  if (
    path.startsWith("/_public") ||
    path.startsWith("/admin") ||
    path.startsWith("/app") ||
    path.startsWith("/login") ||
    path.startsWith("/preview") ||
    path.startsWith("/s/") ||
    path === "/s" ||
    path.startsWith("/_next") ||
    path.startsWith("/api")
  ) {
    return false;
  }

  return isPublicSiteHost(hostHeader);
}

function redirectKeepingSession(
  request: NextRequest,
  pathname: string,
  sessionResponse: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirectResponse = NextResponse.redirect(url);

  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = sessionResponse.headers.get(header);
    if (value) {
      redirectResponse.headers.set(header, value);
    }
  }

  return redirectResponse;
}
