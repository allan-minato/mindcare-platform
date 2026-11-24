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
import { requireProfessionalProfile } from "@/lib/auth/professional";
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
  title: "SEO · Meu site",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AppSiteSeoPage({ params }: PageProps) {
  const profile = await requireProfessionalProfile();
  const { id } = await params;
  const [site, baseDocument] = await Promise.all([
    getSite(id),
    getPreviewDocument(id),
  ]);

  if (!site || site.professional_id !== profile.professionalId || !baseDocument) {
    notFound();
  }

  const sections = site.home_page?.sections ?? [];
  const live = Boolean(site.live_publication_id);
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
    isLive: live,
    hasPendingChanges,
  });
  const saveSeo = updateSiteSeo.bind(null, site.id, "app");

  return (
    <PortalPage wide className="seo-page">
      <PortalPageHeader
        backHref={`/app/sites/${id}`}
        backLabel="Voltar ao editor"
        kicker="SEO"
        title="SEO e descoberta"
        lead={`${site.name} · como o site aparece na busca e ao compartilhar`}
        meta={
          <StatusChip
            live={live}
            pending={hasPendingChanges}
            label={
              hasPendingChanges
                ? `No ar · v${site.published_version ?? "—"} · aguardando publicação`
                : live
                  ? `No ar · v${site.published_version ?? "—"} · atualizado`
                  : "Rascunho"
            }
          />
        }
        actions={
          <Link
            href={`/preview/${id}`}
            target="_blank"
            rel="noreferrer"
            className="portal-btn portal-btn-primary"
          >
            Ver prévia
          </Link>
        }
      />

      <SeoPageIntro publishNote="a equipe MindCare precisa publicar de novo para ir ao ar." />

      {hasPendingChanges ? (
        <div className="publish-pending-banner" role="status">
          <strong>Há mudanças ainda não publicadas.</strong>
          <span>
            {" "}
            A equipe MindCare precisa republicar o site para o SEO novo ir ao
            ar.
          </span>
        </div>
      ) : live ? (
        <div className="publish-pending-banner publish-pending-banner-ok" role="status">
          <strong>Tudo atualizado no ar.</strong>
          <span>
            {" "}
            O que está salvo no rascunho já foi publicado. Novas edições pedem
            republicação.
          </span>
        </div>
      ) : null}

      <PortalSection
        title="Metadados e prévia"
        description="Edite e acompanhe na hora como o resultado pode aparecer na busca e no compartilhamento."
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
        description="Veja o que já está ok e o que ainda falta para o site ser encontrado."
      >
        <SeoChecklist items={seoChecklist} />
      </PortalSection>

      <PortalSection
        title="Conferir no Google"
        description="Só para validar o site publicado: abrir robots/sitemap e atalhos oficiais. A edição do SEO continua nos metadados acima."
      >
        <SeoCrawlLinks publicOrigin={publicOrigin} isLive={live} />
      </PortalSection>
    </PortalPage>
  );
}
