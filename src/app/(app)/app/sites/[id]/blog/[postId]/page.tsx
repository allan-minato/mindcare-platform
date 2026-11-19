import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteSitePost,
  updateSitePost,
} from "@/app/(admin)/admin/sites/blog-actions";
import { BlogPostForm } from "@/app/(admin)/admin/sites/blog-post-form";
import { requireProfessionalProfile } from "@/lib/auth/professional";
import { getSitePost } from "@/lib/sites/post-queries";
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
  const [site, post] = await Promise.all([
    getSite(id),
    getSitePost(id, postId),
  ]);

  if (
    !site ||
    site.professional_id !== profile.professionalId ||
    !post
  ) {
    notFound();
  }

  const action = updateSitePost.bind(null, id, postId, "app");
  const remove = deleteSitePost.bind(null, id, postId, "app");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href={`/app/sites/${id}/blog`}
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar ao blog
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
      </div>
      <BlogPostForm
        action={action}
        post={post}
        deleteAction={remove}
        cancelHref={`/app/sites/${id}/blog`}
      />
    </main>
  );
}
