import { reservedSlugs } from "@/lib/sites/schema";

export function resolvePlatformRoot(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_PLATFORM_ROOT?.trim();
  return (raw && raw.length > 0 ? raw : "localhost").toLowerCase();
}

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().split(":")[0] ?? "";
}

export function isPlatformHost(host: string): boolean {
  const hostname = normalizeHost(host);
  const root = resolvePlatformRoot();
  if (hostname === root) {
    return true;
  }
  const firstLabel = hostname.split(".")[0] ?? "";
  return (reservedSlugs as readonly string[]).includes(firstLabel);
}

/** True when this request host should be rewritten to /_public/[host]. */
export function isPublicSiteHost(host: string): boolean {
  const hostname = normalizeHost(host);
  if (!hostname || isPlatformHost(hostname)) {
    return false;
  }
  const slug = extractSlugFromHost(hostname);
  return slug !== null || hostname.includes(".");
}

export function extractSlugFromHost(host: string): string | null {
  const hostname = normalizeHost(host);
  const root = resolvePlatformRoot();
  const suffix = `.${root}`;
  if (!hostname.endsWith(suffix)) {
    return null;
  }
  const slug = hostname.slice(0, -suffix.length);
  if (
    !slug ||
    slug.includes(".") ||
    (reservedSlugs as readonly string[]).includes(slug)
  ) {
    return null;
  }
  return slug;
}

export function publicSiteOrigin(host: string): string {
  const hostname = normalizeHost(host);
  const isLocal =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1";
  const protocol = isLocal ? "http" : "https";
  return `${protocol}://${host.trim().toLowerCase()}`;
}

/**
 * Railway `*.up.railway.app` não emite certificado nem DNS para
 * `{slug}.servico.up.railway.app` — nesses hosts usamos caminho `/s/{slug}`.
 */
export function usesPathBasedPublicSites(root = resolvePlatformRoot()): boolean {
  return root.endsWith(".up.railway.app");
}

/** Base path interno quando o site público vive em /s/{slug}. */
export function publicSiteBasePath(slug: string): string {
  return `/s/${slug}`;
}

/** URL pública do site no host interno da plataforma. */
export function publicSiteUrl(slug: string): string {
  const root = resolvePlatformRoot();
  if (usesPathBasedPublicSites(root)) {
    return `https://${root}${publicSiteBasePath(slug)}/`;
  }
  const host = `${slug}.${root}`;
  if (root === "localhost" || root.endsWith(".localhost")) {
    return `http://${host}:3000/`;
  }
  return `${publicSiteOrigin(host)}/`;
}
