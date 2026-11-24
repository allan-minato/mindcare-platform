import { permanentRedirect } from "next/navigation";
import { NextResponse } from "next/server";

import { normalizeHost } from "@/lib/sites/host";
import { publishedCanonicalUrl } from "@/lib/sites/seo";

type PublishedCanonicalInput = {
  slug: string;
  primary_domain: string | null;
};

/**
 * Redireciona para o domínio principal verificado quando o pedido
 * chega pela URL da plataforma (ou por outro host).
 * `currentHost` null = rota path-based `/s/[slug]` (sempre plataforma).
 */
export function shouldRedirectToPrimaryDomain(
  published: PublishedCanonicalInput,
  currentHost: string | null,
): boolean {
  const primary = published.primary_domain?.trim().toLowerCase();
  if (!primary) {
    return false;
  }
  if (!currentHost) {
    return true;
  }
  return normalizeHost(currentHost) !== normalizeHost(primary);
}

/** Em Server Components / pages — 308 permanente. */
export function redirectToPrimaryDomainIfNeeded(
  published: PublishedCanonicalInput,
  publicPath: string,
  currentHost: string | null = null,
): void {
  if (!shouldRedirectToPrimaryDomain(published, currentHost)) {
    return;
  }
  permanentRedirect(publishedCanonicalUrl(published, publicPath));
}

/** Em Route Handlers — 301 permanente. */
export function primaryDomainRedirectResponse(
  published: PublishedCanonicalInput,
  publicPath: string,
  currentHost: string | null = null,
): NextResponse | null {
  if (!shouldRedirectToPrimaryDomain(published, currentHost)) {
    return null;
  }
  return NextResponse.redirect(
    publishedCanonicalUrl(published, publicPath),
    301,
  );
}
