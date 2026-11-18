import Link from "next/link";

import { signOut } from "@/app/login/actions";
import {
  adminRoleLabel,
  hasMinRole,
  type AdminProfile,
} from "@/lib/auth/admin";

export function AdminHeader({ admin }: { admin: AdminProfile }) {
  const canManageTeam = hasMinRole(admin.role, "super_admin");

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="grid gap-0.5">
          <p className="text-sm text-zinc-500">MindCare</p>
          <p className="font-medium">{admin.fullName}</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-500">{adminRoleLabel(admin.role)}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-4 px-6 pb-3 text-sm">
        <Link href="/admin" className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400">
          Início
        </Link>
        <Link
          href="/admin/professionals"
          className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Profissionais
        </Link>
        <Link
          href="/admin/sites"
          className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Sites
        </Link>
        {canManageTeam ? (
          <Link
            href="/admin/team"
            className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Equipe
          </Link>
        ) : null}
      </nav>
    </header>
  );
}

export function AccessDenied() {
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
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
        >
          Sair
        </button>
      </form>
    </main>
  );
}
