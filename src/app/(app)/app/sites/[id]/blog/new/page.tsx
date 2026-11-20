import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createSitePost } from "@/app/(admin)/admin/sites/blog-actions";
import { BlogPostForm } from "@/app/(admin)/admin/sites/blog-post-form";
import { PortalPageHeader } from "@/components/portal";
import { requireProfessionalProfile } from "@/lib/auth/professional";
import { getPreviewDocument } from "@/lib/sites/preview";
import { getSite } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Novo post · Blog",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AppNewBlogPostPage({ params }: PageProps) {
  const profile = await requireProfessionalProfile();
  const { id } = await params;
  const [site, previewDocument] = await Promise.all([
    getSite(id),
    getPreviewDocument(id),
  ]);

  if (
    !site ||
    site.professional_id !== profile.professionalId ||
    !previewDocument
  ) {
    notFound();
  }

  const action = createSitePost.bind(null, id, "app");
  const previewBasePath = `/preview/${id}`;

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      <BlogPostForm
        action={action}
        cancelHref={`/app/sites/${id}/blog`}
        previewDocument={previewDocument}
        previewBasePath={previewBasePath}
        fullPreviewHref={`${previewBasePath}/blog`}
        header={
          <PortalPageHeader
            backHref={`/app/sites/${id}/blog`}
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
