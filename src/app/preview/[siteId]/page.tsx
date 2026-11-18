import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireSiteEditor } from "@/lib/auth/site-access";
import { getPreviewDocument } from "@/lib/sites/preview";
import { TemplateRenderer } from "@/templates/render";

export const instant = false;

export const metadata: Metadata = {
  title: "Prévia · MindCare",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

type PageProps = {
  params: Promise<{ siteId: string }>;
};

export default async function PreviewSitePage({ params }: PageProps) {
  const { siteId } = await params;
  await requireSiteEditor(siteId);
  const document = await getPreviewDocument(siteId);

  if (!document) {
    notFound();
  }

  return <TemplateRenderer document={document} mode="preview" />;
}
