"use client";

import { useActionState } from "react";

import { type BlogActionState } from "@/app/(admin)/admin/sites/blog-actions";

type BlogSettingsFormProps = {
  action: (
    state: BlogActionState,
    formData: FormData,
  ) => Promise<BlogActionState>;
  initialTitle: string;
  initialIntro: string;
};

const initialState: BlogActionState = {};

export function BlogSettingsForm({
  action,
  initialTitle,
  initialIntro,
}: BlogSettingsFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-1.5">
        <label htmlFor="blog-title" className="text-sm font-medium">
          Título da página Blog
        </label>
        <input
          id="blog-title"
          name="title"
          required
          defaultValue={initialTitle}
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-xs text-red-700 dark:text-red-400">
            {state.fieldErrors.title[0]}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="blog-intro" className="text-sm font-medium">
          Introdução
        </label>
        <textarea
          id="blog-intro"
          name="intro"
          rows={3}
          defaultValue={initialIntro}
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Salvando…" : "Salvar página do blog"}
      </button>
    </form>
  );
}
