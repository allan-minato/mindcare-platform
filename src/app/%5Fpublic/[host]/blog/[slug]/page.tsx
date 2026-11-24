import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleJsonLd } from "@/components/seo/json-ld";
import { findBlogPost } from "@/lib/sites/document";
import {
  buildPageMetadata,
  postSeoMetadata,
  publishedCanonicalUrl,
  seoFromDocument,
} from "@/lib/sites/seo";
import { getPublishedByHost } from "@/lib/tenant";
import { BlogPostRenderer } from "@/templates/blog/render";

export const instant = false;

type PageProps = {
  params: Promise<{ host: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { host, slug } = await params;
  const published = await getPublishedByHost(host);
  if (!published) {
    return { title: "Artigo" };
  }
  const post = findBlogPost(published.document, slug);
  if (!post) {
    return { title: "Artigo não encontrado" };
  }
  const siteSeo = seoFromDocument(published.document);
  const meta = postSeoMetadata(published.document, post);

  return buildPageMetadata({
    title: meta.title,
    description: meta.description,
    canonical: publishedCanonicalUrl(published, `/blog/${post.slug}`),
    ogImage: meta.ogImage,
    googleSiteVerification: siteSeo.googleSiteVerification,
    type: "article",
  });
}

export default async function PublicBlogPostPage({ params }: PageProps) {
  const { host, slug } = await params;
  const published = await getPublishedByHost(host);
  if (!published) {
    notFound();
  }
  const post = findBlogPost(published.document, slug);
  if (!post) {
    notFound();
  }

  const canonical = publishedCanonicalUrl(published, `/blog/${post.slug}`);

  return (
    <>
      <ArticleJsonLd
        document={published.document}
        post={post}
        url={canonical}
      />
      <BlogPostRenderer
        document={published.document}
        post={post}
        mode="public"
      />
    </>
  );
}
