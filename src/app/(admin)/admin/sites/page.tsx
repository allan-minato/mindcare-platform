import type { Metadata } from "next";
import Link from "next/link";

import { hasMinRole, requireAdminProfile } from "@/lib/auth/admin";
import { listSites } from "@/lib/sites/queries";
import { templateLabel } from "@/lib/templates/registry";

export const instant = false;

export const metadata: Metadata = {
  title: "Sites · MindCare",
};

export default async function SitesPage() {
  const admin = await requireAdminProfile();
  const canWrite = hasMinRole(admin.role, "admin");
  const sites = await listSites();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Sites</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Rascunhos ligados a um profissional e a um template.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/admin/sites/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Novo site
          </Link>
        ) : null}
      </div>

      {sites.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum site criado.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {sites.map((site) => (
            <li
              key={site.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="grid gap-1">
                <Link
                  href={`/admin/sites/${site.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {site.name}
                </Link>
                <p className="text-sm text-zinc-500">
                  {site.slug}
                  {" · "}
                  {templateLabel(site.template_key)}
                  {" · "}
                  {site.professional_name}
                </p>
              </div>
              <Link
                href={`/admin/sites/${site.id}`}
                className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
              >
                Ver
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
