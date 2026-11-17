import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Profissionais
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Cadastro dos clientes da plataforma.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/admin/professionals/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Novo profissional
          </Link>
        ) : null}
      </div>

      {professionals.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum profissional cadastrado.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {professionals.map((professional) => (
            <li key={professional.id} className="flex items-center justify-between gap-4 py-4">
              <div className="grid gap-1">
                <Link
                  href={`/admin/professionals/${professional.id}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {professional.full_name}
                </Link>
                <p className="text-sm text-zinc-500">
                  {professional.council && professional.registration_number
                    ? `${councilLabel(professional.council)} ${professional.registration_number}`
                    : "Sem registro"}
                  {" · "}
                  {professionalStatusLabel(professional.status)}
                </p>
              </div>
              <Link
                href={`/admin/professionals/${professional.id}`}
                className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
              >
                {canWrite ? "Editar" : "Ver"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
