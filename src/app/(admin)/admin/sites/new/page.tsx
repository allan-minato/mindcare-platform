import type { Metadata } from "next";
import Link from "next/link";

import { createSite } from "@/app/(admin)/admin/sites/actions";
import { SiteForm } from "@/app/(admin)/admin/sites/site-form";
import { requireAdminRole } from "@/lib/auth/admin";
import {
  listActiveTemplates,
  listEligibleProfessionals,
} from "@/lib/sites/queries";

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href="/admin/sites"
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Novo site</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Escolha o profissional e o template. A página inicial e as seções
          padrão são geradas na criação.
        </p>
      </div>
      <SiteForm
        action={createSite}
        professionals={professionals}
        templates={templates}
        initialProfessionalId={params.professionalId}
      />
    </main>
  );
}
