import type { Metadata } from "next";
import Link from "next/link";

import { createProfessional } from "@/app/(admin)/admin/professionals/actions";
import { ProfessionalForm } from "@/app/(admin)/admin/professionals/professional-form";
import { requireAdminRole } from "@/lib/auth/admin";

export const instant = false;

export const metadata: Metadata = {
  title: "Novo profissional · MindCare",
};

export default async function NewProfessionalPage() {
  await requireAdminRole("admin");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href="/admin/professionals"
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Novo profissional
        </h1>
      </div>
      <ProfessionalForm action={createProfessional} />
    </main>
  );
}
