import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  setProfessionalStatus,
  updateProfessional,
} from "@/app/(admin)/admin/professionals/actions";
import { InviteAccessPanel } from "@/app/(admin)/admin/professionals/invite-access-panel";
import { ProfessionalForm } from "@/app/(admin)/admin/professionals/professional-form";
import { PortalPage, PortalPageHeader } from "@/components/portal";
import { hasMinRole, requireAdminProfile } from "@/lib/auth/admin";
import {
  getProfessional,
  getProfessionalPortalAccess,
} from "@/lib/professionals/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Profissional · MindCare",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfessionalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await requireAdminProfile();
  const canWrite = hasMinRole(admin.role, "admin");
  const professional = await getProfessional(id);

  if (!professional) {
    notFound();
  }

  const portalAccess = canWrite
    ? await getProfessionalPortalAccess(professional.id)
    : null;

  const action = updateProfessional.bind(null, professional.id);
  const archive = setProfessionalStatus.bind(null, professional.id, "archived");
  const reactivate = setProfessionalStatus.bind(null, professional.id, "active");

  return (
    <PortalPage>
      <PortalPageHeader
        backHref="/admin/professionals"
        backLabel="Voltar"
        kicker="Cadastro"
        title={professional.full_name}
        lead={
          canWrite
            ? undefined
            : "Sua conta pode ver o cadastro, mas não alterar."
        }
        actions={
          canWrite ? (
            <>
              {professional.status !== "archived" ? (
                <Link
                  href={`/admin/sites/new?professionalId=${professional.id}`}
                  className="portal-btn portal-btn-ghost"
                >
                  Criar site
                </Link>
              ) : null}
              {professional.status === "archived" ? (
                <form action={reactivate}>
                  <button type="submit" className="portal-btn portal-btn-ghost">
                    Reativar
                  </button>
                </form>
              ) : (
                <form action={archive}>
                  <button type="submit" className="portal-btn portal-btn-ghost">
                    Arquivar
                  </button>
                </form>
              )}
            </>
          ) : null
        }
      />

      {canWrite ? (
        <InviteAccessPanel
          professionalId={professional.id}
          defaultEmail={professional.email}
          access={portalAccess}
        />
      ) : null}

      <ProfessionalForm
        professional={professional}
        readOnly={!canWrite}
        action={action}
        studio
      />
    </PortalPage>
  );
}
