import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateBlogSettings } from "@/app/(admin)/admin/sites/blog-actions";
import { BlogSettingsForm } from "@/app/(admin)/admin/sites/blog-settings-form";
import {
  PortalPage,
  PortalPageHeader,
  PortalSection,
  StatusChip,
} from "@/components/portal";
import { requireAdminProfile } from "@/lib/auth/admin";
import {
  blogSettingsFromSiteSeo,
  listSitePosts,
} from "@/lib/sites/post-queries";
import { getSite } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Blog · Site · MindCare",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSiteBlogPage({ params }: PageProps) {
  await requireAdminProfile();
  const { id } = await params;
  const [site, posts] = await Promise.all([getSite(id), listSitePosts(id)]);

  if (!site) {
    notFound();
  }

  const settings = blogSettingsFromSiteSeo(site.seo);
  const saveSettings = updateBlogSettings.bind(null, id, "admin");

  return (
    <PortalPage>
      <PortalPageHeader
        backHref={`/admin/sites/${id}`}
        backLabel="Voltar ao editor"
        kicker="Blog"
        title="Blog"
        lead={`${site.name} · artigos separados da home`}
        actions={
          <>
            <Link
              href={`/preview/${id}/blog`}
              target="_blank"
              rel="noreferrer"
              className="portal-btn portal-btn-ghost"
            >
              Prévia do blog
            </Link>
            <Link
              href={`/admin/sites/${id}/blog/new`}
              className="portal-btn portal-btn-primary"
            >
              Novo post
            </Link>
          </>
        }
      />

      <PortalSection
        title="Página /blog"
        description="Título e introdução da listagem pública."
      >
        <BlogSettingsForm
          action={saveSettings}
          initialTitle={settings.title}
          initialIntro={settings.intro}
        />
      </PortalSection>

      <PortalSection
        title={`Posts (${posts.length})`}
        description="Rascunhos e artigos prontos para o snapshot."
      >
        {posts.length === 0 ? (
          <p className="portal-hint">
            Nenhum post ainda. Crie o primeiro artigo.
          </p>
        ) : (
          <div className="portal-list">
            {posts.map((post) => (
              <div key={post.id} className="portal-list-item">
                <div className="grid gap-1">
                  <Link
                    href={`/admin/sites/${id}/blog/${post.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="portal-hint" style={{ margin: 0 }}>
                    /blog/{post.slug}
                  </p>
                  {post.excerpt ? (
                    <p className="portal-hint" style={{ margin: 0, maxWidth: "36rem" }}>
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip
                    live={post.status === "published"}
                    label={post.status === "published" ? "Pronto" : "Rascunho"}
                  />
                  <Link
                    href={`/admin/sites/${id}/blog/${post.id}`}
                    className="portal-btn portal-btn-ghost"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </PortalSection>
    </PortalPage>
  );
}
