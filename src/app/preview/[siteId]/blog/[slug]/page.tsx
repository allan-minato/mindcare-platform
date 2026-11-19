import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { findBlogPost } from "@/lib/sites/document";
import { getPreviewDocument } from "@/lib/sites/preview";
import { BlogPostRenderer } from "@/templates/blog/render";

export const instant = false;

export const metadata: Metadata = {
  title: "Prévia do artigo · MindCare",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ siteId: string; slug: string }>;
};

export default async function PreviewBlogPostPage({ params }: PageProps) {
  const { siteId, slug } = await params;
  const document = await getPreviewDocument(siteId);
  if (!document) {
    notFound();
  }
  const post = findBlogPost(document, slug);
  if (!post) {
    notFound();
  }

  return (
    <BlogPostRenderer
      document={document}
      post={post}
      mode="preview"
      basePath={`/preview/${siteId}`}
    />
  );
}
