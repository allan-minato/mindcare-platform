import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProfessionalForm } from "@/app/(admin)/admin/professionals/professional-form";
import { updateMyProfessional } from "@/app/(app)/app/actions";
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="grid gap-2">
        <Link
          href="/app"
          className="text-sm text-zinc-500 underline-offset-4 hover:underline"
        >
          Voltar
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Meu perfil</h1>
        <p className="text-sm text-zinc-500">
          Dados públicos do seu cadastro. Alterações no site publicado só
          aparecem depois que a equipe republicar.
        </p>
      </div>
      <ProfessionalForm
        professional={professional}
        portalMode
        action={updateMyProfessional}
      />
    </main>
  );
}
