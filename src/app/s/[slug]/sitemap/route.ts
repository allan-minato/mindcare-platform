import { notFound } from "next/navigation";

import { primaryDomainRedirectResponse } from "@/lib/sites/canonical-redirect";
import {
  renderSitemapXml,
  sitemapResponse,
} from "@/lib/sites/sitemap";
import { getPublishedBySlug } from "@/lib/tenant";

export const instant = false;

type RouteProps = {
  params: Promise<{ slug: string }>;
};

/** Alias legado: preferir `/sitemap.xml`. */
export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);
  if (!published) {
    notFound();
  }
  const redirect = primaryDomainRedirectResponse(published, "/sitemap.xml");
  if (redirect) {
    return redirect;
  }
  return sitemapResponse(renderSitemapXml(published));
}
