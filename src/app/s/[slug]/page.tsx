import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { publicSiteBasePath, publicSiteUrl } from "@/lib/sites/host";
import { getPublishedBySlug, seoFromDocument } from "@/lib/tenant";
import { TemplateRenderer } from "@/templates/render";

export const instant = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);
  if (!published) {
    return { title: "Site não encontrado" };
  }

  const { title, description } = seoFromDocument(published.document);

  return {
    title,
    description,
    alternates: {
      canonical: publicSiteUrl(published.slug),
    },
  };
}

export default async function PathPublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);

  if (!published) {
    notFound();
  }

  return (
    <TemplateRenderer
      document={published.document}
      mode="public"
      basePath={publicSiteBasePath(published.slug)}
    />
  );
}
