import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteDomainsPanel } from "@/app/(admin)/admin/sites/site-domains-panel";
import { SitePublishControls } from "@/app/(admin)/admin/sites/site-publish-controls";
import { SiteSectionsEditor } from "@/app/(admin)/admin/sites/site-sections-editor";
import {
  PortalPage,
  PortalPageHeader,
  PortalSection,
  StatusChip,
} from "@/components/portal";
import { hasMinRole, requireAdminProfile } from "@/lib/auth/admin";
import { publicSiteUrl } from "@/lib/sites/host";
import { getPreviewDocument } from "@/lib/sites/preview";
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
  const [site, baseDocument] = await Promise.all([
    getSite(id),
    getPreviewDocument(id),
  ]);

  if (!site || !baseDocument) {
    notFound();
  }

  const sections = site.home_page?.sections ?? [];
  const isLive = Boolean(site.live_publication_id);
  const statusLabel = isLive
    ? `No ar · v${site.published_version ?? "—"} · ${formatPublishedAt(site.published_at)}`
    : "Rascunho — ainda não está no ar";
  const previewHref = `/preview/${site.id}`;

  const header = (
    <PortalPageHeader
      backHref="/admin/sites"
      backLabel="Voltar"
      kicker="Editor"
      title={site.name}
      lead={
        <>
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
        </>
      }
      actions={
        <>
          <StatusChip
            live={isLive}
            label={
              isLive ? `No ar · v${site.published_version ?? "—"}` : "Rascunho"
            }
          />
          <Link
            href={`/admin/sites/${site.id}/blog`}
            className="portal-btn portal-btn-ghost"
          >
            Blog
          </Link>
          <Link
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="portal-btn portal-btn-primary"
          >
            Ver prévia
          </Link>
        </>
      }
    />
  );

  const aside = (
    <>
      <PortalSection title="Publicação" description={statusLabel}>
        {canPublish ? (
          <SitePublishControls
            siteId={site.id}
            isLive={isLive}
            publicUrl={publicSiteUrl(site.slug)}
            statusLabel={statusLabel}
          />
        ) : (
          <p className="portal-hint" style={{ margin: 0 }}>
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
      </PortalSection>

      <PortalSection title="Página inicial">
        {site.home_page ? (
          <p className="portal-hint" style={{ margin: 0 }}>
            {site.home_page.path} — {site.home_page.title} · {sections.length}{" "}
            seções
          </p>
        ) : (
          <p className="portal-error">Página `/` não encontrada.</p>
        )}
      </PortalSection>

      <PortalSection
        title="Domínios"
        description="Cadastre o host do cliente e marque como verificado para o snapshot público resolver pelo domínio personalizado."
      >
        <SiteDomainsPanel
          siteId={site.id}
          domains={site.domains}
          canManage={canPublish}
          platformUrl={publicSiteUrl(site.slug)}
          isLive={isLive}
        />
      </PortalSection>
    </>
  );

  if (!site.home_page) {
    return (
      <PortalPage>
        {header}
        {aside}
        <p className="portal-hint">Nenhuma seção para editar.</p>
      </PortalPage>
    );
  }

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      <SiteSectionsEditor
        siteId={site.id}
        sections={sections}
        baseDocument={baseDocument}
        fullPreviewHref={previewHref}
        header={header}
        aside={aside}
      />
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
