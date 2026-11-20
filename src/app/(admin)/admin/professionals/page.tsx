import type { Metadata } from "next";
import Link from "next/link";

import {
  PortalCard,
  PortalPage,
  PortalPageHeader,
  StatusChip,
} from "@/components/portal";
import { hasMinRole, requireAdminProfile } from "@/lib/auth/admin";
import { listProfessionals } from "@/lib/professionals/queries";
import {
  councilLabel,
  professionalStatusLabel,
} from "@/lib/professionals/schema";

export const instant = false;

export const metadata: Metadata = {
  title: "Profissionais · MindCare",
};

export default async function ProfessionalsPage() {
  const admin = await requireAdminProfile();
  const canWrite = hasMinRole(admin.role, "admin");
  const professionals = await listProfessionals();

  return (
    <PortalPage>
      <PortalPageHeader
        kicker="Cadastro"
        title="Profissionais"
        lead="Clientes da plataforma e acesso ao portal."
        actions={
          canWrite ? (
            <Link
              href="/admin/professionals/new"
              className="portal-btn portal-btn-primary"
            >
              Novo profissional
            </Link>
          ) : null
        }
      />

      {professionals.length === 0 ? (
        <PortalCard quiet>
          <div className="portal-empty">
            <p className="portal-section-title" style={{ fontSize: "1.2rem" }}>
              Nenhum profissional
            </p>
            <p>Cadastre o primeiro profissional para começar.</p>
          </div>
        </PortalCard>
      ) : (
        <div className="portal-site-grid">
          {professionals.map((professional) => {
            const active = professional.status === "active";
            return (
              <PortalCard key={professional.id} className="portal-site-card">
                <div className="portal-site-card-top">
                  <div>
                    <h2 className="portal-site-name">
                      {professional.full_name}
                    </h2>
                    <p className="portal-site-meta">
                      {professional.council && professional.registration_number
                        ? `${councilLabel(professional.council)} ${professional.registration_number}`
                        : "Sem registro"}
                    </p>
                  </div>
                  <StatusChip
                    live={active}
                    label={professionalStatusLabel(professional.status)}
                  />
                </div>
                <div className="portal-site-actions">
                  <Link
                    href={`/admin/professionals/${professional.id}`}
                    className="portal-btn portal-btn-primary"
                  >
                    {canWrite ? "Editar" : "Ver"}
                  </Link>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
