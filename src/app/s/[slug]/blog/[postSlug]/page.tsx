import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findBlogPost } from "@/lib/sites/document";
import { publicSiteBasePath, publicSiteUrl } from "@/lib/sites/host";
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
  const seoTitle =
    typeof post.seo.title === "string" && post.seo.title.trim()
      ? post.seo.title
      : post.title;
  const seoDescription =
    typeof post.seo.description === "string" && post.seo.description.trim()
      ? post.seo.description
      : post.excerpt || undefined;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: `${publicSiteUrl(published.slug).replace(/\/$/, "")}/blog/${post.slug}`,
    },
  };
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

  return (
    <BlogPostRenderer
      document={published.document}
      post={post}
      mode="public"
      basePath={publicSiteBasePath(published.slug)}
    />
  );
}
