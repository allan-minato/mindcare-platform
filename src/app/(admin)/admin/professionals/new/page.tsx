import type { Metadata } from "next";

import { createProfessional } from "@/app/(admin)/admin/professionals/actions";
import { ProfessionalForm } from "@/app/(admin)/admin/professionals/professional-form";
import { PortalPage, PortalPageHeader } from "@/components/portal";
import { requireAdminRole } from "@/lib/auth/admin";

export const instant = false;

export const metadata: Metadata = {
  title: "Novo profissional · MindCare",
};

export default async function NewProfessionalPage() {
  await requireAdminRole("admin");

  return (
    <PortalPage>
      <PortalPageHeader
        backHref="/admin/professionals"
        backLabel="Voltar"
        kicker="Cadastro"
        title="Novo profissional"
        lead="Dados públicos e de contato. Depois você pode convidar ao portal."
      />
      <ProfessionalForm action={createProfessional} studio />
    </PortalPage>
  );
}
