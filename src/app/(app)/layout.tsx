import { Suspense, type ReactNode } from "react";
import Link from "next/link";

import { signOut } from "@/app/login/actions";
import {
  requireProfessional,
  type ProfessionalAccessProfile,
} from "@/lib/auth/professional";

export const instant = false;

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppLoading />}>
      <AppGate>{children}</AppGate>
    </Suspense>
  );
}

function AppLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm text-zinc-500">Carregando…</p>
    </main>
  );
}

async function AppGate({ children }: { children: ReactNode }) {
  const access = await requireProfessional();

  if (access.status === "denied") {
    return <PortalDenied />;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PortalHeader profile={access.profile} />
      {children}
    </div>
  );
}

function PortalHeader({ profile }: { profile: ProfessionalAccessProfile }) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="grid gap-0.5">
          <p className="text-sm text-zinc-500">MindCare</p>
          <p className="font-medium">{profile.fullName}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
          >
            Sair
          </button>
        </form>
      </div>
      <nav className="flex gap-4 px-6 pb-3 text-sm">
        <Link
          href="/app"
          className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Início
        </Link>
        <Link
          href="/app/profile"
          className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Meu perfil
        </Link>
      </nav>
    </header>
  );
}

function PortalDenied() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Sem acesso ao portal
        </h1>
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">
          Esta conta não está vinculada a um profissional ativo.
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
