import type { Metadata } from "next";
import Link from "next/link";

import { createSite } from "@/app/(admin)/admin/sites/actions";
import { SiteForm } from "@/app/(admin)/admin/sites/site-form";
import { requireAdminRole } from "@/lib/auth/admin";
import {
  listActiveTemplates,
  listEligibleProfessionals,
} from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Novo site · MindCare",
};

type PageProps = {
  searchParams: Promise<{ professionalId?: string }>;
};

export default async function NewSitePage({ searchParams }: PageProps) {
  await requireAdminRole("admin");
  const params = await searchParams;
  const [professionals, templates] = await Promise.all([
    listEligibleProfessionals(),
    listActiveTemplates(),
  ]);

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      <SiteForm
        action={createSite}
        professionals={professionals}
        templates={templates}
        initialProfessionalId={params.professionalId}
        header={
          <div className="grid gap-2">
            <Link
              href="/admin/sites"
              className="text-sm text-zinc-500 underline-offset-4 hover:underline"
            >
              Voltar
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Novo site</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Escolha o profissional e o template. A prévia mostra o visual
              antes de criar; as seções padrão vêm na sequência.
            </p>
          </div>
        }
      />
    </main>
  );
}
