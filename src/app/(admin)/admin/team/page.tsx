import type { Metadata } from "next";

import { TeamPanel } from "@/app/(admin)/admin/team/team-panel";
import { PortalPage, PortalPageHeader } from "@/components/portal";
import { requireAdminRole } from "@/lib/auth/admin";
import { listAdminUsers } from "@/lib/team/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Equipe · MindCare",
};

export default async function TeamPage() {
  const admin = await requireAdminRole("super_admin");
  const members = await listAdminUsers();

  return (
    <PortalPage>
      <PortalPageHeader
        kicker="Acesso"
        title="Equipe"
        lead="Convide operadores, defina papéis e ative ou desative o acesso ao painel."
      />
      <TeamPanel members={members} currentUserId={admin.id} />
    </PortalPage>
  );
}
