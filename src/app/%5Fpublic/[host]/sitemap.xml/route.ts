import { notFound } from "next/navigation";

import { primaryDomainRedirectResponse } from "@/lib/sites/canonical-redirect";
import {
  renderSitemapXml,
  sitemapResponse,
} from "@/lib/sites/sitemap";
import { getPublishedByHost } from "@/lib/tenant";

export const instant = false;

type RouteProps = {
  params: Promise<{ host: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { host } = await params;
  const published = await getPublishedByHost(host);
  if (!published) {
    notFound();
  }
  const redirect = primaryDomainRedirectResponse(
    published,
    "/sitemap.xml",
    host,
  );
  if (redirect) {
    return redirect;
  }
  return sitemapResponse(renderSitemapXml(published));
}
