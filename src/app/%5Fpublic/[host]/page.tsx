import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteJsonLd } from "@/components/seo/json-ld";
import { redirectToPrimaryDomainIfNeeded } from "@/lib/sites/canonical-redirect";
import {
  buildPageMetadata,
  publishedCanonicalUrl,
  seoFromDocument,
} from "@/lib/sites/seo";
import { getPublishedByHost } from "@/lib/tenant";
import { TemplateRenderer } from "@/templates/render";

export const instant = false;

type PageProps = {
  params: Promise<{ host: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { host } = await params;
  const published = await getPublishedByHost(host);
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

export default async function PublicSitePage({ params }: PageProps) {
  const { host } = await params;
  const published = await getPublishedByHost(host);

  if (!published) {
    notFound();
  }

  redirectToPrimaryDomainIfNeeded(published, "/", host);

  const canonical = publishedCanonicalUrl(published, "/");

  return (
    <>
      <SiteJsonLd document={published.document} url={canonical} />
      <TemplateRenderer document={published.document} mode="public" />
    </>
  );
}
