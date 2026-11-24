import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteJsonLd } from "@/components/seo/json-ld";
import { publicSiteBasePath } from "@/lib/sites/host";
import {
  buildPageMetadata,
  publishedCanonicalUrl,
  seoFromDocument,
} from "@/lib/sites/seo";
import { getPublishedBySlug } from "@/lib/tenant";
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

  const seo = seoFromDocument(published.document);
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    canonical: publishedCanonicalUrl(published, "/"),
    ogImage: seo.ogImage,
    googleSiteVerification: seo.googleSiteVerification,
  });
}

export default async function PathPublicSitePage({ params }: PageProps) {
  const { slug } = await params;
  const published = await getPublishedBySlug(slug);

  if (!published) {
    notFound();
  }

  const canonical = publishedCanonicalUrl(published, "/");

  return (
    <>
      <SiteJsonLd document={published.document} url={canonical} />
      <TemplateRenderer
        document={published.document}
        mode="public"
        basePath={publicSiteBasePath(published.slug)}
      />
    </>
  );
}
