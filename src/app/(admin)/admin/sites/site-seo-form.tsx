"use client";

import { useActionState } from "react";

import { type SeoActionState } from "@/app/(admin)/admin/sites/seo-actions";
import type { SiteSeoFields } from "@/lib/sites/seo";

type SiteSeoFormProps = {
  action: (
    state: SeoActionState,
    formData: FormData,
  ) => Promise<SeoActionState>;
  initial: SiteSeoFields;
};

const initialState: SeoActionState = {};

export function SiteSeoForm({ action, initial }: SiteSeoFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      {state.saved ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          SEO salvo. Publique de novo para ir ao ar.
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor="seo-title" className="text-sm font-medium">
          Título (aba do navegador / Google)
        </label>
        <input
          id="seo-title"
          name="title"
          maxLength={70}
          defaultValue={initial.title ?? ""}
          placeholder="Ex.: Dra. Ana — Psicologia clínica"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-xs text-red-700 dark:text-red-400">
            {state.fieldErrors.title[0]}
          </p>
        ) : (
          <p className="portal-hint" style={{ margin: 0 }}>
            Até 70 caracteres. Vazio = nome do profissional.
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="seo-description" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="seo-description"
          name="description"
          rows={3}
          maxLength={170}
          defaultValue={initial.description ?? ""}
          placeholder="Uma frase clara sobre o atendimento e para quem é."
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {state.fieldErrors?.description?.[0] ? (
          <p className="text-xs text-red-700 dark:text-red-400">
            {state.fieldErrors.description[0]}
          </p>
        ) : (
          <p className="portal-hint" style={{ margin: 0 }}>
            Até 170 caracteres. Aparece na busca e no compartilhamento.
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="seo-og" className="text-sm font-medium">
          Imagem de compartilhamento (URL https)
        </label>
        <input
          id="seo-og"
          name="og_image_url"
          type="url"
          inputMode="url"
          defaultValue={initial.og_image_url ?? ""}
          placeholder="https://…"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {state.fieldErrors?.og_image_url?.[0] ? (
          <p className="text-xs text-red-700 dark:text-red-400">
            {state.fieldErrors.og_image_url[0]}
          </p>
        ) : (
          <p className="portal-hint" style={{ margin: 0 }}>
            Ideal 1200×630. Sem URL, usa a foto do perfil.
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="seo-gsc" className="text-sm font-medium">
          Google Search Console (código)
        </label>
        <input
          id="seo-gsc"
          name="google_site_verification"
          defaultValue={initial.google_site_verification ?? ""}
          placeholder="conteúdo do meta google-site-verification"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {state.fieldErrors?.google_site_verification?.[0] ? (
          <p className="text-xs text-red-700 dark:text-red-400">
            {state.fieldErrors.google_site_verification[0]}
          </p>
        ) : (
          <p className="portal-hint" style={{ margin: 0 }}>
            Só o valor do atributo content, sem a tag HTML.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Salvando…" : "Salvar SEO"}
      </button>
    </form>
  );
}
