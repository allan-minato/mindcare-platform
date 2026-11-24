import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateSiteSeo } from "@/app/(admin)/admin/sites/seo-actions";
import { SiteSeoForm } from "@/app/(admin)/admin/sites/site-seo-form";
import {
  PortalPage,
  PortalPageHeader,
  PortalSection,
  StatusChip,
} from "@/components/portal";
import { SeoChecklist } from "@/components/seo/seo-checklist";
import { SeoCrawlLinks } from "@/components/seo/seo-crawl-links";
import { SeoPageIntro } from "@/components/seo/seo-page-intro";
import { requireAdminProfile } from "@/lib/auth/admin";
import { professionalDisplayName } from "@/lib/sites/document";
import { publicSiteUrl } from "@/lib/sites/host";
import { getPreviewDocument } from "@/lib/sites/preview";
import { getSite } from "@/lib/sites/queries";
import {
  buildSeoChecklist,
  publishedCanonicalUrl,
  seoFromDocument,
  siteSeoFromRecord,
} from "@/lib/sites/seo";

export const instant = false;

export const metadata: Metadata = {
  title: "SEO · Site · MindCare",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSiteSeoPage({ params }: PageProps) {
  await requireAdminProfile();
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
  const hasPendingChanges = site.has_pending_changes;
  const hasVerifiedDomain = site.domains.some(
    (domain) => domain.verification_status === "verified",
  );
  const seoFields = siteSeoFromRecord(site.seo);
  const derived = seoFromDocument(baseDocument);
  const primaryDomain = site.domains.find(
    (domain) => domain.is_primary && domain.verification_status === "verified",
  );
  const hostLabel =
    primaryDomain?.domain ??
    publicSiteUrl(site.slug).replace(/^https?:\/\//, "").replace(/\/$/, "");
  const publicOrigin = publishedCanonicalUrl(
    {
      slug: site.slug,
      primary_domain: primaryDomain?.domain ?? null,
    },
    "/",
  ).replace(/\/$/, "");

  const seoChecklist = buildSeoChecklist({
    seo: site.seo,
    document: baseDocument,
    sections: sections.map((section) => ({
      module_key: section.module_key,
      is_visible: section.is_visible,
      content: section.content,
    })),
    hasVerifiedDomain,
    isLive,
    hasPendingChanges,
    resolve: {
      editor: `/admin/sites/${id}`,
      blog: `/admin/sites/${id}/blog`,
      domains: `/admin/sites/${id}/domains`,
      professional: `/admin/professionals/${site.professional_id}`,
    },
  });
  const saveSeo = updateSiteSeo.bind(null, site.id, "admin");

  return (
    <PortalPage wide className="seo-page">
      <PortalPageHeader
        backHref={`/admin/sites/${id}`}
        backLabel="Voltar ao editor"
        kicker="SEO"
        title="SEO e descoberta"
        lead={`${site.name} · busca, compartilhamento e sinais locais`}
        meta={
          <StatusChip
            live={isLive}
            pending={hasPendingChanges}
            label={
              hasPendingChanges
                ? `No ar · v${site.published_version ?? "—"} · republicar`
                : isLive
                  ? `No ar · v${site.published_version ?? "—"} · atualizado`
                  : "Rascunho"
            }
          />
        }
        actions={
          <>
            {hasPendingChanges ? (
              <Link
                href={`/admin/sites/${id}`}
                className="portal-btn portal-btn-attention"
              >
                Republicar
              </Link>
            ) : null}
            <Link
              href={`/preview/${id}`}
              target="_blank"
              rel="noreferrer"
              className="portal-btn portal-btn-primary"
            >
              Ver prévia
            </Link>
          </>
        }
      />

      <SeoPageIntro publishNote="as mudanças só vão ao ar na próxima publicação." />

      {hasPendingChanges ? (
        <div className="publish-pending-banner" role="status">
          <strong>Há mudanças ainda não publicadas.</strong>
          <span>
            {" "}
            Volte ao editor e clique em{" "}
            <Link href={`/admin/sites/${id}`} className="underline-offset-4 hover:underline">
              Republicar agora
            </Link>{" "}
            para o SEO ir ao ar.
          </span>
        </div>
      ) : isLive ? (
        <div className="publish-pending-banner publish-pending-banner-ok" role="status">
          <strong>SEO alinhado com o site no ar.</strong>
          <span>
            {" "}
            Depois de editar e salvar, será preciso republicar de novo.
          </span>
        </div>
      ) : null}

      <PortalSection
        title="Metadados e prévia"
        description="Edite à esquerda e acompanhe como o resultado pode aparecer na busca e ao compartilhar o link."
      >
        <SiteSeoForm
          action={saveSeo}
          initial={seoFields}
          fallbackTitle={professionalDisplayName(baseDocument.professional)}
          fallbackDescription={derived.description}
          fallbackImageUrl={
            baseDocument.professional.photo_url?.trim() || null
          }
          siteHostLabel={hostLabel}
          attendanceModes={baseDocument.professional.attendance_modes}
        />
      </PortalSection>

      <PortalSection
        title="Checklist de descoberta"
        description="Um mapa do que já está ok e do que ainda falta — incluindo FAQ, redes e domínio."
      >
        <SeoChecklist items={seoChecklist} />
      </PortalSection>

      <SeoCrawlLinks publicOrigin={publicOrigin} isLive={isLive} />
    </PortalPage>
  );
}
