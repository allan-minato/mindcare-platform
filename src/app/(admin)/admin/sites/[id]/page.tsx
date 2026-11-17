import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteSectionsEditor } from "@/app/(admin)/admin/sites/site-sections-editor";
import { requireAdminProfile } from "@/lib/auth/admin";
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
  await requireAdminProfile();
  const { id } = await params;
  const site = await getSite(id);

  if (!site) {
    notFound();
  }

  const sections = site.home_page?.sections ?? [];

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
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Ver prévia
          </Link>
        </div>
      </div>

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
          <h2 className="text-lg font-medium">Seções</h2>
          <p className="text-sm text-zinc-500">
            Edite textos, ordem e visibilidade. Salvar recarrega o mesmo
            conteúdo.
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
