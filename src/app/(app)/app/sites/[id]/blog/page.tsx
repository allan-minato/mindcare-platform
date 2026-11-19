import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateBlogSettings } from "@/app/(admin)/admin/sites/blog-actions";
import { BlogSettingsForm } from "@/app/(admin)/admin/sites/blog-settings-form";
import { requireProfessionalProfile } from "@/lib/auth/professional";
import {
  blogSettingsFromSiteSeo,
  listSitePosts,
} from "@/lib/sites/post-queries";
import { getSite } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Blog · Meu site",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AppSiteBlogPage({ params }: PageProps) {
  const profile = await requireProfessionalProfile();
  const { id } = await params;
  const [site, posts] = await Promise.all([getSite(id), listSitePosts(id)]);

  if (!site || site.professional_id !== profile.professionalId) {
    notFound();
  }

  const settings = blogSettingsFromSiteSeo(site.seo);
  const saveSettings = updateBlogSettings.bind(null, id, "app");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href={`/app/sites/${id}`}
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar à página inicial
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
            <p className="text-sm text-zinc-500">{site.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/preview/${id}/blog`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Prévia
            </Link>
            <Link
              href={`/app/sites/${id}/blog/new`}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Novo post
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Página /blog</h2>
        <BlogSettingsForm
          action={saveSettings}
          initialTitle={settings.title}
          initialIntro={settings.intro}
        />
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum post ainda.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-start justify-between gap-3 py-4"
              >
                <div className="grid gap-1">
                  <Link
                    href={`/app/sites/${id}/blog/${post.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-zinc-500">
                    /blog/{post.slug}
                    {" · "}
                    {post.status === "published" ? "Pronto" : "Rascunho"}
                  </p>
                </div>
                <Link
                  href={`/app/sites/${id}/blog/${post.id}`}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
                >
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
