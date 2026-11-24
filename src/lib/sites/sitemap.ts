import type { MetadataRoute } from "next";

import { publishedCanonicalUrl } from "@/lib/sites/seo";
import type { PublishedSite } from "@/lib/tenant";

export function buildPublishedSitemap(
  published: PublishedSite,
): MetadataRoute.Sitemap {
  const lastMod = new Date(published.published_at);
  const entries: MetadataRoute.Sitemap = [
    {
      url: publishedCanonicalUrl(published, "/"),
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const blog = published.document.blog;
  if (!blog.enabled) {
    return entries;
  }

  entries.push({
    url: publishedCanonicalUrl(published, "/blog"),
    lastModified: lastMod,
    changeFrequency: "weekly",
    priority: 0.8,
  });

  for (const post of blog.posts) {
    entries.push({
      url: publishedCanonicalUrl(published, `/blog/${post.slug}`),
      lastModified: post.published_at
        ? new Date(post.published_at)
        : lastMod,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}

export function buildPublishedRobots(
  published: PublishedSite,
): MetadataRoute.Robots {
  const sitemap = publishedCanonicalUrl(published, "/sitemap.xml");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap,
  };
}
