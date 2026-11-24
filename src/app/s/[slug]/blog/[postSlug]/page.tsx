import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleJsonLd } from "@/components/seo/json-ld";
import { findBlogPost } from "@/lib/sites/document";
import { redirectToPrimaryDomainIfNeeded } from "@/lib/sites/canonical-redirect";
import { publicSiteBasePath } from "@/lib/sites/host";
import {
  buildPageMetadata,
  postSeoMetadata,
  publishedCanonicalUrl,
  seoFromDocument,
} from "@/lib/sites/seo";
import { getPublishedBySlug } from "@/lib/tenant";
import { BlogPostRenderer } from "@/templates/blog/render";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string; postSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const published = await getPublishedBySlug(slug);
  if (!published) {
    return { title: "Artigo" };
  }
  const post = findBlogPost(published.document, postSlug);
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

export default async function PathPublicBlogPostPage({ params }: PageProps) {
  const { slug, postSlug } = await params;
  const published = await getPublishedBySlug(slug);
  if (!published) {
    notFound();
  }
  const post = findBlogPost(published.document, postSlug);
  if (!post) {
    notFound();
  }

  redirectToPrimaryDomainIfNeeded(published, `/blog/${post.slug}`);

  const canonical = publishedCanonicalUrl(published, `/blog/${post.slug}`);
  const homeUrl = publishedCanonicalUrl(published, "/");
  const blogUrl = publishedCanonicalUrl(published, "/blog");

  return (
    <>
      <ArticleJsonLd
        document={published.document}
        post={post}
        url={canonical}
        homeUrl={homeUrl}
        blogUrl={blogUrl}
      />
      <BlogPostRenderer
        document={published.document}
        post={post}
        mode="public"
        basePath={publicSiteBasePath(published.slug)}
      />
    </>
  );
}
