import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { publicSiteBasePath, publicSiteUrl } from "@/lib/sites/host";
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
  return {
    title: published.document.blog.title,
    description: published.document.blog.intro || undefined,
    alternates: {
      canonical: `${publicSiteUrl(published.slug).replace(/\/$/, "")}/blog`,
    },
  };
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
