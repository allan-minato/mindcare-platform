import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  buildPageMetadata,
  publishedCanonicalUrl,
  seoFromDocument,
} from "@/lib/sites/seo";
import { getPublishedByHost } from "@/lib/tenant";
import { BlogListRenderer } from "@/templates/blog/render";

export const instant = false;

type PageProps = {
  params: Promise<{ host: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { host } = await params;
  const published = await getPublishedByHost(host);
  if (!published?.document.blog.enabled) {
    return { title: "Blog" };
  }
  const siteSeo = seoFromDocument(published.document);
  const title = published.document.blog.title;
  const description =
    published.document.blog.intro.trim() || siteSeo.description;

  return buildPageMetadata({
    title,
    description,
    canonical: publishedCanonicalUrl(published, "/blog"),
    ogImage: siteSeo.ogImage,
    googleSiteVerification: siteSeo.googleSiteVerification,
  });
}

export default async function PublicBlogPage({ params }: PageProps) {
  const { host } = await params;
  const published = await getPublishedByHost(host);

  if (!published || !published.document.blog.enabled) {
    notFound();
  }

  return (
    <BlogListRenderer document={published.document} mode="public" />
  );
}
