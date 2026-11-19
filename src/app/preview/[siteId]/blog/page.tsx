import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPreviewDocument } from "@/lib/sites/preview";
import { BlogListRenderer } from "@/templates/blog/render";

export const instant = false;

export const metadata: Metadata = {
  title: "Prévia do blog · MindCare",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ siteId: string }>;
};

export default async function PreviewBlogPage({ params }: PageProps) {
  const { siteId } = await params;
  const document = await getPreviewDocument(siteId);
  if (!document) {
    notFound();
  }

  return (
    <BlogListRenderer
      document={document}
      mode="preview"
      basePath={`/preview/${siteId}`}
    />
  );
}
