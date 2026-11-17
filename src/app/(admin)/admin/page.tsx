import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Painel · MindCare",
};

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-3 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Painel</h1>
      <p className="leading-7 text-zinc-600 dark:text-zinc-400">
        Cadastre profissionais e, nas próximas etapas, os sites deles.
      </p>
      <Link
        href="/admin/professionals"
        className="text-sm font-medium underline underline-offset-4"
      >
        Ver profissionais
      </Link>
    </main>
  );
}
