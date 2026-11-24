import type { MetadataRoute } from "next";

import { buildPublishedSitemap } from "@/lib/sites/sitemap";
import { getPublishedBySlug } from "@/lib/tenant";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function sitemap({
  params,
}: RouteProps): Promise<MetadataRoute.Sitemap> {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);
  if (!published) {
    return [];
  }
  return buildPublishedSitemap(published);
}
