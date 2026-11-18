import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteSectionsEditor } from "@/app/(admin)/admin/sites/site-sections-editor";
import { requireProfessionalProfile } from "@/lib/auth/professional";
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
  const site = await getSite(id);

  if (!site || site.professional_id !== profile.professionalId) {
    notFound();
  }

  const sections = site.home_page?.sections ?? [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href="/app"
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{site.name}</h1>
            <p className="text-sm text-zinc-500">
              {site.slug}
              {" · "}
              {templateLabel(site.template_key)}
              {" · "}
              {site.live_publication_id
                ? `No ar · v${site.published_version ?? "—"}`
                : "Rascunho"}
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
        <div className="grid gap-1">
          <h2 className="text-lg font-medium">Seções</h2>
          <p className="text-sm text-zinc-500">
            Edite textos, ordem e visibilidade. Para colocar no ar, a equipe
            MindCare publica o site.
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
