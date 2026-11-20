import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  deleteSitePost,
  updateSitePost,
} from "@/app/(admin)/admin/sites/blog-actions";
import { BlogPostForm } from "@/app/(admin)/admin/sites/blog-post-form";
import { PortalPageHeader } from "@/components/portal";
import { requireProfessionalProfile } from "@/lib/auth/professional";
import { getSitePost } from "@/lib/sites/post-queries";
import { getPreviewDocument } from "@/lib/sites/preview";
import { getSite } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Editar post · Blog",
};

type PageProps = {
  params: Promise<{ id: string; postId: string }>;
};

export default async function AppEditBlogPostPage({ params }: PageProps) {
  const profile = await requireProfessionalProfile();
  const { id, postId } = await params;
  const [site, post, previewDocument] = await Promise.all([
    getSite(id),
    getSitePost(id, postId),
    getPreviewDocument(id),
  ]);

  if (
    !site ||
    site.professional_id !== profile.professionalId ||
    !post ||
    !previewDocument
  ) {
    notFound();
  }

  const action = updateSitePost.bind(null, id, postId, "app");
  const remove = deleteSitePost.bind(null, id, postId, "app");
  const previewBasePath = `/preview/${id}`;

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      <BlogPostForm
        action={action}
        post={post}
        deleteAction={remove}
        cancelHref={`/app/sites/${id}/blog`}
        previewDocument={previewDocument}
        previewBasePath={previewBasePath}
        fullPreviewHref={`${previewBasePath}/blog/${post.slug}`}
        header={
          <PortalPageHeader
            backHref={`/app/sites/${id}/blog`}
            backLabel="Voltar ao blog"
            kicker="Blog"
            title={post.title}
            lead={`/blog/${post.slug}`}
          />
        }
      />
    </main>
  );
}
