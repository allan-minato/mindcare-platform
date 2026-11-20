import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createSitePost } from "@/app/(admin)/admin/sites/blog-actions";
import { BlogPostForm } from "@/app/(admin)/admin/sites/blog-post-form";
import { PortalPageHeader } from "@/components/portal";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getPreviewDocument } from "@/lib/sites/preview";
import { getSite } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Novo post · Blog · MindCare",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminNewBlogPostPage({ params }: PageProps) {
  await requireAdminProfile();
  const { id } = await params;
  const [site, previewDocument] = await Promise.all([
    getSite(id),
    getPreviewDocument(id),
  ]);

  if (!site || !previewDocument) {
    notFound();
  }

  const action = createSitePost.bind(null, id, "admin");
  const previewBasePath = `/preview/${id}`;

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      <BlogPostForm
        action={action}
        cancelHref={`/admin/sites/${id}/blog`}
        previewDocument={previewDocument}
        previewBasePath={previewBasePath}
        fullPreviewHref={`${previewBasePath}/blog`}
        header={
          <PortalPageHeader
            backHref={`/admin/sites/${id}/blog`}
            backLabel="Voltar ao blog"
            kicker="Blog"
            title="Novo post"
            lead={site.name}
          />
        }
      />
    </main>
  );
}
