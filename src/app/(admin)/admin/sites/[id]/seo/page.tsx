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
import { requireAdminProfile } from "@/lib/auth/admin";
import { getPreviewDocument } from "@/lib/sites/preview";
import { getSite } from "@/lib/sites/queries";
import {
  buildSeoChecklist,
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
    isLive,
  });
  const saveSeo = updateSiteSeo.bind(null, site.id, "admin");

  return (
    <PortalPage>
      <PortalPageHeader
        backHref={`/admin/sites/${id}`}
        backLabel="Voltar à página inicial"
        kicker="SEO"
        title="SEO e descoberta"
        lead={`${site.name} · Google, compartilhamento e recomendações`}
        actions={
          <>
            <StatusChip
              live={isLive}
              label={
                isLive ? `No ar · v${site.published_version ?? "—"}` : "Rascunho"
              }
            />
            <Link
              href={`/admin/sites/${id}/blog`}
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
        description="Título, descrição, local e imagem. Entram no ar na próxima publicação."
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
