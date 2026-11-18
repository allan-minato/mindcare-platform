import type { Metadata } from "next";

import { TeamPanel } from "@/app/(admin)/admin/team/team-panel";
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Equipe</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Convide operadores, defina papéis e ative ou desative o acesso ao
          painel.
        </p>
      </div>
      <TeamPanel members={members} currentUserId={admin.id} />
    </main>
  );
}
