import "server-only";

import { cacheTag } from "next/cache";
import { z } from "zod";

import {
  parseSiteDocument,
  type SiteDocument,
} from "@/lib/sites/document";
import {
  extractSlugFromHost,
  isPlatformHost,
  normalizeHost,
} from "@/lib/sites/host";
import { createAnonClient } from "@/lib/supabase/anon";

const publishedPayloadSchema = z.object({
  version: z.number().int().positive(),
  published_at: z.string(),
  primary_domain: z.string().nullable().optional(),
  document: z.unknown(),
});

export type PublishedSite = {
  version: number;
  published_at: string;
  primary_domain: string | null;
  document: SiteDocument;
  slug: string;
};

export async function getPublishedByHost(
  host: string,
): Promise<PublishedSite | null> {
  "use cache";
  const hostname = normalizeHost(host);
  if (!hostname || isPlatformHost(hostname)) {
    return null;
  }

  const slug = extractSlugFromHost(hostname);
  const supabase = createAnonClient();

  const { data, error } = slug
    ? await supabase.rpc("get_published_site_by_slug", { p_slug: slug })
    : await supabase.rpc("get_published_site_by_domain", {
        p_domain: hostname,
      });

  if (error || data == null) {
    return null;
  }

  const payload = publishedPayloadSchema.safeParse(data);
  if (!payload.success) {
    return null;
  }

  const document = parseSiteDocument(payload.data.document);
  if (!document) {
    return null;
  }

  const resolvedSlug = slug ?? document.site.slug;
  cacheTag(`site:${resolvedSlug}`);

  return {
    version: payload.data.version,
    published_at: payload.data.published_at,
    primary_domain: payload.data.primary_domain ?? null,
    document,
    slug: resolvedSlug,
  };
}

export function seoFromDocument(document: SiteDocument): {
  title: string;
  description: string;
} {
  const seo = document.site.seo ?? {};
  const name =
    document.professional.professional_name?.trim() ||
    document.professional.full_name?.trim() ||
    "Profissional";

  const title =
    typeof seo.title === "string" && seo.title.trim().length > 0
      ? seo.title.trim()
      : name;

  const description =
    typeof seo.description === "string" && seo.description.trim().length > 0
      ? seo.description.trim()
      : `Atendimento clínico com ${name}.`;

  return { title, description };
}

export {
  extractSlugFromHost,
  isPlatformHost,
  normalizeHost,
  publicSiteOrigin,
  resolvePlatformRoot,
} from "@/lib/sites/host";
