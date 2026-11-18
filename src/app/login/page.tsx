import type { Metadata } from "next";

import { LoginForm } from "@/app/login/login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Entrar · MindCare",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-wide text-zinc-500">
          MindCare
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">
          Acesso da equipe ao painel.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
