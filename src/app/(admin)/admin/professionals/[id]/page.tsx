import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  setProfessionalStatus,
  updateProfessional,
} from "@/app/(admin)/admin/professionals/actions";
import { InviteAccessPanel } from "@/app/(admin)/admin/professionals/invite-access-panel";
import { ProfessionalForm } from "@/app/(admin)/admin/professionals/professional-form";
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <Link
            href="/admin/professionals"
            className="text-sm text-zinc-500 underline-offset-4 hover:underline"
          >
            Voltar
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            {professional.full_name}
          </h1>
          {!canWrite ? (
            <p className="text-sm text-zinc-500">
              Sua conta pode ver o cadastro, mas não alterar.
            </p>
          ) : null}
        </div>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            {professional.status !== "archived" ? (
              <Link
                href={`/admin/sites/new?professionalId=${professional.id}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
              >
                Criar site
              </Link>
            ) : null}
            {professional.status === "archived" ? (
              <form action={reactivate}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
                >
                  Reativar
                </button>
              </form>
            ) : (
              <form action={archive}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
                >
                  Arquivar
                </button>
              </form>
            )}
          </div>
        ) : null}
      </div>

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
      />
    </main>
  );
}
