import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { publicSiteOrigin } from "@/lib/sites/host";
import {
  getPublishedByHost,
  seoFromDocument,
} from "@/lib/tenant";
import { TemplateRenderer } from "@/templates/render";

export const instant = false;

type PageProps = {
  params: Promise<{ host: string }>;
};

function canonicalForHost(host: string): string {
  const normalized = host.trim().toLowerCase();
  if (normalized.endsWith(".localhost") || normalized === "localhost") {
    return `http://${normalized}:3000/`;
  }
  return `${publicSiteOrigin(normalized)}/`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { host } = await params;
  const published = await getPublishedByHost(host);
  if (!published) {
    return { title: "Site não encontrado" };
  }

  const { title, description } = seoFromDocument(published.document);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalForHost(host),
    },
  };
}

export default async function PublicSitePage({ params }: PageProps) {
  const { host } = await params;
  const published = await getPublishedByHost(host);

  if (!published) {
    notFound();
  }

  return (
    <TemplateRenderer document={published.document} mode="public" />
  );
}
