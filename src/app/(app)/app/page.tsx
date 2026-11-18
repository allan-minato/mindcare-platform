import type { Metadata } from "next";
import Link from "next/link";

import { requireProfessionalProfile } from "@/lib/auth/professional";
import { listMySites } from "@/lib/sites/queries";
import { templateLabel } from "@/lib/templates/registry";

export const instant = false;

export const metadata: Metadata = {
  title: "Portal · MindCare",
};

export default async function PortalHomePage() {
  const profile = await requireProfessionalProfile();
  const sites = await listMySites(profile.professionalId);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Olá, {profile.fullName}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Edite seu perfil e o conteúdo dos seus sites. Publicação e domínio
          ficam com a equipe MindCare.
        </p>
      </div>

      <section className="grid gap-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-medium">Seus sites</h2>
          <Link
            href="/app/profile"
            className="text-sm underline-offset-4 hover:underline"
          >
            Editar perfil
          </Link>
        </div>
        {sites.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nenhum site vinculado ainda. A equipe cria o site para você.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {sites.map((site) => (
              <li
                key={site.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="grid gap-1">
                  <Link
                    href={`/app/sites/${site.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {site.name}
                  </Link>
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
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
                >
                  Prévia
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
