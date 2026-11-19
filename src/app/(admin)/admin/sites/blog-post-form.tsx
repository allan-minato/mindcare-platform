"use client";

import {
  useActionState,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  type BlogActionState,
} from "@/app/(admin)/admin/sites/blog-actions";
import {
  suggestPostSlug,
  type SitePost,
} from "@/lib/sites/posts";
import { Markdown } from "@/lib/markdown";

type BlogPostFormProps = {
  action: (
    state: BlogActionState,
    formData: FormData,
  ) => Promise<BlogActionState>;
  post?: SitePost | null;
  deleteAction?: () => Promise<BlogActionState>;
  cancelHref: string;
};

const initialState: BlogActionState = {};

export function BlogPostForm({
  action,
  post,
  deleteAction,
  cancelHref,
}: BlogPostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [body, setBody] = useState(post?.body_markdown ?? "");
  const [deleteState, setDeleteState] = useState<BlogActionState>({});
  const [deleting, setDeleting] = useState(false);

  const seoTitle =
    typeof post?.seo.title === "string" ? post.seo.title : "";
  const seoDescription =
    typeof post?.seo.description === "string" ? post.seo.description : "";

  const preview = useMemo(() => body, [body]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
      <form action={formAction} className="grid gap-5">
        {state.error ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {state.error}
          </p>
        ) : null}

        <Field
          id="title"
          label="Título"
          error={state.fieldErrors?.title?.[0]}
        >
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => {
              const next = event.target.value;
              setTitle(next);
              if (!slugTouched) {
                setSlug(suggestPostSlug(next));
              }
            }}
            className={inputClass}
          />
        </Field>

        <Field id="slug" label="Slug" error={state.fieldErrors?.slug?.[0]}>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className={inputClass}
          />
        </Field>

        <Field
          id="excerpt"
          label="Resumo (listagem)"
          error={state.fieldErrors?.excerpt?.[0]}
        >
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            className={inputClass}
          />
        </Field>

        <Field
          id="cover_image_url"
          label="URL da capa (https)"
          error={state.fieldErrors?.cover_image_url?.[0]}
        >
          <input
            id="cover_image_url"
            name="cover_image_url"
            defaultValue={post?.cover_image_url ?? ""}
            className={inputClass}
            placeholder="https://..."
          />
        </Field>

        <Field
          id="body_markdown"
          label="Corpo (Markdown)"
          error={state.fieldErrors?.body_markdown?.[0]}
        >
          <textarea
            id="body_markdown"
            name="body_markdown"
            rows={18}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className={`${inputClass} font-mono text-[13px] leading-relaxed`}
          />
        </Field>

        <Field id="status" label="Status">
          <select
            id="status"
            name="status"
            defaultValue={post?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Rascunho</option>
            <option value="published">Pronto para publicar no site</option>
          </select>
          <p className="mt-1 text-xs text-zinc-500">
            Posts “prontos” entram no ar só depois de publicar o site.
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="seo_title" label="SEO · título">
            <input
              id="seo_title"
              name="seo_title"
              defaultValue={seoTitle}
              className={inputClass}
            />
          </Field>
          <Field id="seo_description" label="SEO · descrição">
            <input
              id="seo_description"
              name="seo_description"
              defaultValue={seoDescription}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Salvando…" : "Salvar post"}
          </button>
          <a
            href={cancelHref}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
          >
            Voltar
          </a>
        </div>
      </form>

      <aside className="grid gap-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Prévia do Markdown
          </p>
          {preview.trim() ? (
            <div className="site-md-preview prose-like text-sm text-zinc-800 dark:text-zinc-200">
              <Markdown source={preview} />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Digite o corpo à esquerda para ver a prévia.
            </p>
          )}
        </div>

        {deleteAction ? (
          <div className="rounded-lg border border-red-200 p-4 dark:border-red-900">
            {deleteState.error ? (
              <p className="mb-2 text-sm text-red-700 dark:text-red-400">
                {deleteState.error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (
                  !window.confirm(
                    "Excluir este post permanentemente do rascunho?",
                  )
                ) {
                  return;
                }
                setDeleting(true);
                const result = await deleteAction();
                setDeleteState(result);
                setDeleting(false);
              }}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-60 dark:border-red-900 dark:text-red-400"
            >
              {deleting ? "Excluindo…" : "Excluir post"}
            </button>
          </div>
        ) : null}
      </aside>

      <style>{`
        .site-md-preview h2 { font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.5rem; }
        .site-md-preview h3 { font-size: 1.05rem; font-weight: 600; margin: 1rem 0 0.4rem; }
        .site-md-preview p, .site-md-preview li { line-height: 1.65; margin: 0.55rem 0; }
        .site-md-preview ul { padding-left: 1.2rem; list-style: disc; }
        .site-md-preview ol { padding-left: 1.2rem; list-style: decimal; }
        .site-md-preview blockquote { border-left: 2px solid #a1a1aa; padding-left: 0.85rem; color: #52525b; margin: 0.75rem 0; }
        .site-md-preview a { text-decoration: underline; }
        .site-md-preview code { font-size: 0.85em; background: rgba(0,0,0,0.06); padding: 0.1em 0.3em; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700";
