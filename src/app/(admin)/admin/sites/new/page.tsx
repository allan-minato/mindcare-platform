import type { Metadata } from "next";

import { createSite } from "@/app/(admin)/admin/sites/actions";
import { SiteForm } from "@/app/(admin)/admin/sites/site-form";
import { PortalPageHeader } from "@/components/portal";
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
          <PortalPageHeader
            backHref="/admin/sites"
            backLabel="Voltar"
            kicker="Sites"
            title="Novo site"
            lead="Escolha o profissional e o template. A prévia mostra o visual antes de criar; as seções padrão vêm na sequência."
          />
        }
      />
    </main>
  );
}
