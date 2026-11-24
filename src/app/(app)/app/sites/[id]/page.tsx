import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateSiteSeo } from "@/app/(admin)/admin/sites/seo-actions";
import { SiteSectionsEditor } from "@/app/(admin)/admin/sites/site-sections-editor";
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
import { templateLabel } from "@/lib/templates/registry";

export const instant = false;

export const metadata: Metadata = {
  title: "Site · MindCare",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PortalSitePage({ params }: PageProps) {
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
  const previewHref = `/preview/${site.id}`;
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

  const header = (
    <PortalPageHeader
      backHref="/app"
      backLabel="Voltar ao início"
      kicker="Editor"
      title={site.name}
      lead={`${site.slug} · ${templateLabel(site.template_key)}`}
      actions={
        <>
          <StatusChip
            live={live}
            label={
              live ? `No ar · v${site.published_version ?? "—"}` : "Rascunho"
            }
          />
          <Link
            href={`/app/sites/${site.id}/blog`}
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
      <section className="grid gap-1">
        <p className="portal-hint" style={{ margin: 0, fontSize: "0.9rem" }}>
          Edite textos, ordem e visibilidade com prévia ao vivo. Para colocar no
          ar, a equipe MindCare publica o site.
        </p>
      </section>
      <PortalSection
        title="SEO"
        description="Como o site aparece no Google e ao compartilhar o link."
      >
        <SiteSeoForm action={saveSeo} initial={seoFields} />
      </PortalSection>
      <PortalSection title="Checklist SEO">
        <SeoChecklist items={seoChecklist} />
      </PortalSection>
    </>
  );

  if (!site.home_page) {
    return (
      <PortalPage>
        {header}
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
