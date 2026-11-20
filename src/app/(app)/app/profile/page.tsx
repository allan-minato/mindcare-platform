import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfessionalForm } from "@/app/(admin)/admin/professionals/professional-form";
import { updateMyProfessional } from "@/app/(app)/app/actions";
import { PortalPage, PortalPageHeader } from "@/components/portal";
import { getMyProfessional } from "@/lib/professionals/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Meu perfil · MindCare",
};

export default async function PortalProfilePage() {
  const professional = await getMyProfessional();
  if (!professional) {
    notFound();
  }

  return (
    <PortalPage>
      <PortalPageHeader
        backHref="/app"
        backLabel="Voltar ao início"
        kicker="Personalização"
        title="Meu perfil"
        lead="Dados públicos do seu cadastro. Alterações no site publicado só aparecem depois que a equipe republicar."
      />
      <ProfessionalForm
        professional={professional}
        portalMode
        action={updateMyProfessional}
      />
    </PortalPage>
  );
}
