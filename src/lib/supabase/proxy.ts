import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isPublicSiteHost, normalizeHost } from "@/lib/sites/host";
import { supabaseCredentials } from "@/lib/supabase/public-env";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hostHeader = request.headers.get("host") ?? request.nextUrl.host;

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

  if (path.startsWith("/admin") && !user) {
    return redirectKeepingSession(request, "/login", supabaseResponse);
  }

  if (path === "/login" && user) {
    return redirectKeepingSession(request, "/admin", supabaseResponse);
  }

  return supabaseResponse;
}

function shouldRewriteToPublicSite(path: string, hostHeader: string): boolean {
  if (
    path.startsWith("/_public") ||
    path.startsWith("/admin") ||
    path.startsWith("/login") ||
    path.startsWith("/preview") ||
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
