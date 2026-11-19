import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findBlogPost } from "@/lib/sites/document";
import { publicSiteOrigin } from "@/lib/sites/host";
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
      canonical: `${canonicalBase(host)}/blog/${post.slug}`,
    },
  };
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

  return (
    <BlogPostRenderer
      document={published.document}
      post={post}
      mode="public"
    />
  );
}

function canonicalBase(host: string): string {
  const normalized = host.trim().toLowerCase();
  if (normalized.endsWith(".localhost") || normalized === "localhost") {
    return `http://${normalized}:3000`;
  }
  return publicSiteOrigin(normalized);
}
