import type { MetadataRoute } from "next";

import { buildPublishedRobots } from "@/lib/sites/sitemap";
import { getPublishedByHost } from "@/lib/tenant";

type RouteProps = {
  params: Promise<{ host: string }>;
};

export default async function robots({
  params,
}: RouteProps): Promise<MetadataRoute.Robots> {
  const { host } = await params;
  const published = await getPublishedByHost(host);
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
