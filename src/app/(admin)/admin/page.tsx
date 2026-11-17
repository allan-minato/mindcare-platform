import type { Metadata } from "next";
import { Suspense } from "react";

import { signOut } from "@/app/login/actions";
import { adminRoleLabel, requireAdmin, type AdminProfile } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Painel · MindCare",
};

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminHome />
    </Suspense>
  );
}

function AdminLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm text-zinc-500">Carregando…</p>
    </main>
  );
}

async function AdminHome() {
  const access = await requireAdmin();

  if (access.status === "denied") {
    return <AccessDenied />;
  }

  return <AdminShell admin={access.admin} />;
}

function AdminShell({ admin }: { admin: AdminProfile }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="grid gap-0.5">
          <p className="text-sm text-zinc-500">MindCare</p>
          <p className="font-medium">{admin.fullName}</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-500">{adminRoleLabel(admin.role)}</p>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-3 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Painel</h1>
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">
          O cadastro de profissionais entra na próxima etapa.
        </p>
      </main>
    </div>
  );
}

function AccessDenied() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Sem acesso ao painel
        </h1>
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">
          Esta conta não faz parte da equipe.
        </p>
      </div>
      <SignOutButton />
    </main>
  );
}

function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
      >
        Sair
      </button>
    </form>
  );
}
