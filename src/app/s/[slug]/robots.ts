import type { MetadataRoute } from "next";

import { buildPublishedRobots } from "@/lib/sites/sitemap";
import { getPublishedBySlug } from "@/lib/tenant";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function robots({
  params,
}: RouteProps): Promise<MetadataRoute.Robots> {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);
  if (!published) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }
  return buildPublishedRobots(published);
}
