import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { publicSiteOrigin } from "@/lib/sites/host";
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
  return {
    title: published.document.blog.title,
    description: published.document.blog.intro || undefined,
    alternates: {
      canonical: `${canonicalBase(host)}/blog`,
    },
  };
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

function canonicalBase(host: string): string {
  const normalized = host.trim().toLowerCase();
  if (normalized.endsWith(".localhost") || normalized === "localhost") {
    return `http://${normalized}:3000`;
  }
  return publicSiteOrigin(normalized);
}
