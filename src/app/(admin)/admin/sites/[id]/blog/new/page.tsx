import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createSitePost } from "@/app/(admin)/admin/sites/blog-actions";
import { BlogPostForm } from "@/app/(admin)/admin/sites/blog-post-form";
import { requireAdminProfile } from "@/lib/auth/admin";
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
  const site = await getSite(id);
  if (!site) {
    notFound();
  }

  const action = createSitePost.bind(null, id, "admin");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href={`/admin/sites/${id}/blog`}
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar ao blog
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Novo post</h1>
        <p className="text-sm text-zinc-500">{site.name}</p>
      </div>
      <BlogPostForm
        action={action}
        cancelHref={`/admin/sites/${id}/blog`}
      />
    </main>
  );
}
