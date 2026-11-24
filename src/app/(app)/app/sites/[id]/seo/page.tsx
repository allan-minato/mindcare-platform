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
import { requireProfessionalProfile } from "@/lib/auth/professional";
import { getPreviewDocument } from "@/lib/sites/preview";
import { getSite } from "@/lib/sites/queries";
import {
  buildSeoChecklist,
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
  const hasVerifiedDomain = site.domains.some(
    (domain) => domain.verification_status === "verified",
  );
  const seoFields = siteSeoFromRecord(site.seo);
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
  });
  const saveSeo = updateSiteSeo.bind(null, site.id, "app");

  return (
    <PortalPage>
      <PortalPageHeader
        backHref={`/app/sites/${id}`}
        backLabel="Voltar à página inicial"
        kicker="SEO"
        title="SEO e descoberta"
        lead={`${site.name} · como o site aparece no Google e ao compartilhar`}
        actions={
          <>
            <StatusChip
              live={live}
              label={
                live ? `No ar · v${site.published_version ?? "—"}` : "Rascunho"
              }
            />
            <Link
              href={`/app/sites/${id}/blog`}
              className="portal-btn portal-btn-ghost"
            >
              Blog
            </Link>
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

      <PortalSection
        title="Metadados do site"
        description="Título, descrição, local e imagem. Entram no ar quando a equipe publicar de novo."
      >
        <SiteSeoForm action={saveSeo} initial={seoFields} />
      </PortalSection>

      <PortalSection
        title="Checklist"
        description="O que falta para o site aparecer bem em busca e em respostas com web."
      >
        <SeoChecklist items={seoChecklist} />
      </PortalSection>
    </PortalPage>
  );
}
