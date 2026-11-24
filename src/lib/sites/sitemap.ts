import { publishedCanonicalUrl } from "@/lib/sites/seo";
import type { PublishedSite } from "@/lib/tenant";

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export function buildPublishedSitemapEntries(
  published: PublishedSite,
): SitemapEntry[] {
  const lastMod = new Date(published.published_at);
  const entries: SitemapEntry[] = [
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

/** Sitemap em XML. Preferir rota pública `/sitemap.xml` (alias `/sitemap` mantido). */
export function renderSitemapXml(published: PublishedSite): string {
  const entries = buildPublishedSitemapEntries(published);
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastModified.toISOString();
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function renderRobotsTxt(published: PublishedSite): string {
  const sitemap = publishedCanonicalUrl(published, "/sitemap.xml");
  return `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
}

export function sitemapResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export function robotsResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
