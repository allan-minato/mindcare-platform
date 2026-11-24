import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteSectionsEditor } from "@/app/(admin)/admin/sites/site-sections-editor";
import {
  PortalPage,
  PortalPageHeader,
  StatusChip,
} from "@/components/portal";
import { requireProfessionalProfile } from "@/lib/auth/professional";
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
  const hasPendingChanges = site.has_pending_changes;

  const header = (
    <PortalPageHeader
      backHref="/app"
      backLabel="Voltar ao início"
      kicker="Editor"
      title={site.name}
      lead={`${site.slug} · ${templateLabel(site.template_key)}`}
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
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="portal-btn portal-btn-primary"
        >
          Ver prévia
        </Link>
      }
    />
  );

  const aside = (
    <section className="grid gap-1">
      <p className="portal-hint" style={{ margin: 0, fontSize: "0.9rem" }}>
        Edite textos, ordem e visibilidade com prévia ao vivo. Para colocar no
        ar, a equipe MindCare publica o site.
      </p>
    </section>
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
