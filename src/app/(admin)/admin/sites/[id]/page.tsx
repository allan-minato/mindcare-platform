import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteDomainsPanel } from "@/app/(admin)/admin/sites/site-domains-panel";
import { SitePublishControls } from "@/app/(admin)/admin/sites/site-publish-controls";
import { SiteSectionsEditor } from "@/app/(admin)/admin/sites/site-sections-editor";
import { hasMinRole, requireAdminProfile } from "@/lib/auth/admin";
import { publicSiteUrl } from "@/lib/sites/host";
import { getSite } from "@/lib/sites/queries";
import { templateLabel } from "@/lib/templates/registry";

export const instant = false;

export const metadata: Metadata = {
  title: "Site · MindCare",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SiteDetailPage({ params }: PageProps) {
  const admin = await requireAdminProfile();
  const canPublish = hasMinRole(admin.role, "admin");
  const { id } = await params;
  const site = await getSite(id);

  if (!site) {
    notFound();
  }

  const sections = site.home_page?.sections ?? [];
  const isLive = Boolean(site.live_publication_id);
  const statusLabel = isLive
    ? `No ar · v${site.published_version ?? "—"} · ${formatPublishedAt(site.published_at)}`
    : "Rascunho — ainda não está no ar";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href="/admin/sites"
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {site.name}
            </h1>
            <p className="text-sm text-zinc-500">
              {site.slug}
              {" · "}
              {templateLabel(site.template_key)}
              {" · "}
              <Link
                href={`/admin/professionals/${site.professional_id}`}
                className="underline-offset-4 hover:underline"
              >
                {site.professional_name}
              </Link>
            </p>
          </div>
          <Link
            href={`/preview/${site.id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Ver prévia
          </Link>
        </div>
      </div>

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Publicação</h2>
        {canPublish ? (
          <SitePublishControls
            siteId={site.id}
            isLive={isLive}
            publicUrl={publicSiteUrl(site.slug)}
            statusLabel={statusLabel}
          />
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {statusLabel}
            {isLive ? (
              <>
                {" · "}
                <a
                  href={publicSiteUrl(site.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  Abrir site público
                </a>
              </>
            ) : null}
            . Sua conta pode ver, mas não publicar.
          </p>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Página inicial</h2>
        {site.home_page ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {site.home_page.path} — {site.home_page.title} · {sections.length}{" "}
            seções
          </p>
        ) : (
          <p className="text-sm text-red-700 dark:text-red-400">
            Página `/` não encontrada.
          </p>
        )}
      </section>

      <section className="grid gap-3">
        <div className="grid gap-1">
          <h2 className="text-lg font-medium">Domínios</h2>
          <p className="text-sm text-zinc-500">
            Cadastre o host do cliente e marque como verificado para o
            snapshot público resolver pelo domínio personalizado.
          </p>
        </div>
        <SiteDomainsPanel
          siteId={site.id}
          domains={site.domains}
          canManage={canPublish}
        />
      </section>

      <section className="grid gap-3">
        <div className="grid gap-1">
          <h2 className="text-lg font-medium">Seções</h2>
          <p className="text-sm text-zinc-500">
            Edite textos, ordem e visibilidade. Salvar recarrega o mesmo
            conteúdo. Alterações só entram no ar ao publicar de novo.
          </p>
        </div>
        {site.home_page ? (
          <SiteSectionsEditor siteId={site.id} sections={sections} />
        ) : (
          <p className="text-sm text-zinc-500">Nenhuma seção para editar.</p>
        )}
      </section>
    </main>
  );
}

function formatPublishedAt(value: string | null): string {
  if (!value) {
    return "sem data";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
