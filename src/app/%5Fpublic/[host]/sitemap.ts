import type { MetadataRoute } from "next";

import { buildPublishedSitemap } from "@/lib/sites/sitemap";
import { getPublishedByHost } from "@/lib/tenant";

type RouteProps = {
  params: Promise<{ host: string }>;
};

export default async function sitemap({
  params,
}: RouteProps): Promise<MetadataRoute.Sitemap> {
  const { host } = await params;
  const published = await getPublishedByHost(host);
  if (!published) {
    return [];
  }
  return buildPublishedSitemap(published);
}
