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
    <PortalPage>
      <PortalPageHeader
        backHref={`/app/sites/${id}`}
        backLabel="Voltar à página inicial"
        kicker="Blog"
        title="Blog"
        lead={site.name}
        actions={
          <>
            <Link
              href={`/preview/${id}/blog`}
              target="_blank"
              rel="noreferrer"
              className="portal-btn portal-btn-ghost"
            >
              Prévia
            </Link>
            <Link
              href={`/app/sites/${id}/blog/new`}
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
        description="Rascunhos e artigos prontos para a equipe publicar no snapshot."
      >
        {posts.length === 0 ? (
          <p className="portal-hint">Nenhum post ainda.</p>
        ) : (
          <div className="portal-list">
            {posts.map((post) => (
              <div key={post.id} className="portal-list-item">
                <div className="grid gap-1">
                  <Link
                    href={`/app/sites/${id}/blog/${post.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="portal-hint" style={{ margin: 0 }}>
                    /blog/{post.slug}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip
                    live={post.status === "published"}
                    label={post.status === "published" ? "Pronto" : "Rascunho"}
                  />
                  <Link
                    href={`/app/sites/${id}/blog/${post.id}`}
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
