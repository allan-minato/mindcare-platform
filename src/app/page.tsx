import { publicSupabaseEnv } from "@/lib/supabase/public-env";

export default function Home() {
  const supabase = publicSupabaseEnv();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-wide text-zinc-500">
          Etapa 1
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          MindCare Platform
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Aplicativo local pronto. O banco, o login e os sites entram nas
          próximas etapas.
        </p>
      </div>
      <dl className="grid gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="grid gap-1">
          <dt className="text-sm text-zinc-500">Projeto Supabase</dt>
          <dd className="font-mono text-sm">uejagjwfvdhpfhpazjhi</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-sm text-zinc-500">URL</dt>
          <dd className="font-mono text-sm break-all">
            {supabase.url ?? "Não configurada"}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-sm text-zinc-500">Chave publicável</dt>
          <dd className="text-sm">
            {supabase.hasPublishableKey
              ? "Configurada"
              : "Ainda não configurada em .env.local"}
          </dd>
        </div>
      </dl>
    </main>
  );
}
