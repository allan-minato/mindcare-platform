import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteSitePost,
  updateSitePost,
} from "@/app/(admin)/admin/sites/blog-actions";
import { BlogPostForm } from "@/app/(admin)/admin/sites/blog-post-form";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getSitePost } from "@/lib/sites/post-queries";
import { getSite } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Editar post · Blog · MindCare",
};

type PageProps = {
  params: Promise<{ id: string; postId: string }>;
};

export default async function AdminEditBlogPostPage({ params }: PageProps) {
  await requireAdminProfile();
  const { id, postId } = await params;
  const [site, post] = await Promise.all([
    getSite(id),
    getSitePost(id, postId),
  ]);

  if (!site || !post) {
    notFound();
  }

  const action = updateSitePost.bind(null, id, postId, "admin");
  const remove = deleteSitePost.bind(null, id, postId, "admin");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href={`/admin/sites/${id}/blog`}
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar ao blog
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <p className="text-sm text-zinc-500">
          {site.name} · /blog/{post.slug}
        </p>
      </div>
      <BlogPostForm
        action={action}
        post={post}
        deleteAction={remove}
        cancelHref={`/admin/sites/${id}/blog`}
      />
    </main>
  );
}
