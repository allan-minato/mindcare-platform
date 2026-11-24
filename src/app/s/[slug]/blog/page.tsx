import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { publicSiteBasePath } from "@/lib/sites/host";
import {
  buildPageMetadata,
  publishedCanonicalUrl,
  seoFromDocument,
} from "@/lib/sites/seo";
import { getPublishedBySlug } from "@/lib/tenant";
import { BlogListRenderer } from "@/templates/blog/render";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);
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

export default async function PathPublicBlogPage({ params }: PageProps) {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);

  if (!published || !published.document.blog.enabled) {
    notFound();
  }

  return (
    <BlogListRenderer
      document={published.document}
      mode="public"
      basePath={publicSiteBasePath(published.slug)}
    />
  );
}
