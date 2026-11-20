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
import { buildLiveBlogPost } from "@/components/site-editor/build-live-blog-post";
import { LiveSitePreview } from "@/components/site-editor/live-site-preview";
import { Markdown } from "@/lib/markdown";
import type { SiteDocument, SiteDocumentBlogPost } from "@/lib/sites/document";
import {
  suggestPostSlug,
  type SitePost,
} from "@/lib/sites/posts";

type MobileTab = "edit" | "preview";

type BlogPostFormProps = {
  action: (
    state: BlogActionState,
    formData: FormData,
  ) => Promise<BlogActionState>;
  post?: SitePost | null;
  deleteAction?: () => Promise<BlogActionState>;
  cancelHref: string;
  previewDocument: SiteDocument;
  previewBasePath: string;
  fullPreviewHref?: string;
  header?: ReactNode;
};

const initialState: BlogActionState = {};

export function BlogPostForm({
  action,
  post,
  deleteAction,
  cancelHref,
  previewDocument,
  previewBasePath,
  fullPreviewHref,
  header,
}: BlogPostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    post?.cover_image_url ?? "",
  );
  const [body, setBody] = useState(post?.body_markdown ?? "");
  const [seoTitle, setSeoTitle] = useState(
    typeof post?.seo.title === "string" ? post.seo.title : "",
  );
  const [seoDescription, setSeoDescription] = useState(
    typeof post?.seo.description === "string" ? post.seo.description : "",
  );
  const [deleteState, setDeleteState] = useState<BlogActionState>({});
  const [deleting, setDeleting] = useState(false);

  const basePost = useMemo<SiteDocumentBlogPost | null>(() => {
    if (!post) {
      return null;
    }
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body_markdown: post.body_markdown,
      cover_image_url: post.cover_image_url,
      published_at: post.published_at,
      seo: post.seo,
    };
  }, [post]);

  const livePost = useMemo(
    () =>
      buildLiveBlogPost(
        {
          title,
          slug,
          excerpt,
          body_markdown: body,
          cover_image_url: coverImageUrl,
          seo_title: seoTitle,
          seo_description: seoDescription,
        },
        basePost,
      ),
    [
      title,
      slug,
      excerpt,
      body,
      coverImageUrl,
      seoTitle,
      seoDescription,
      basePost,
    ],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-[#e4ddd2] px-6 py-2 lg:hidden">
        <TabButton
          active={mobileTab === "edit"}
          onClick={() => setMobileTab("edit")}
        >
          Editar
        </TabButton>
        <TabButton
          active={mobileTab === "preview"}
          onClick={() => setMobileTab("preview")}
        >
          Prévia
        </TabButton>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(22rem,28rem)_minmax(0,1fr)] xl:grid-cols-[minmax(24rem,32rem)_minmax(0,1fr)]">
        <div
          className={`min-h-0 overflow-y-auto px-6 pb-6 pt-4 lg:pt-5 ${
            mobileTab === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
            {header}

            <form action={formAction} className="grid gap-5">
              {state.error ? (
                <p
                  role="alert"
                  className="text-sm text-red-700 dark:text-red-400"
                >
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
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field
                id="cover_image_url"
                label="Imagem de capa"
                error={state.fieldErrors?.cover_image_url?.[0]}
              >
                <input
                  id="cover_image_url"
                  name="cover_image_url"
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  className={inputClass}
                  placeholder="https://exemplo.com/foto-de-capa.jpg"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Cole o link https da imagem. Ela aparece no card da listagem e
                  no topo do artigo. Ainda não há upload — use uma URL pública.
                </p>
              </Field>

              <Field
                id="body_markdown"
                label="Corpo (Markdown)"
                error={state.fieldErrors?.body_markdown?.[0]}
              >
                <textarea
                  id="body_markdown"
                  name="body_markdown"
                  rows={16}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className={`${inputClass} font-mono text-[13px] leading-relaxed`}
                />
                <details className="mt-2 rounded-md border border-[#e4ddd2] bg-[#fffcf8] px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold text-[#2a2622]">
                    Prévia do Markdown
                  </summary>
                  <div className="mt-3 border-t border-[#ebe4d8] pt-3">
                    {body.trim() ? (
                      <div className="site-md-preview prose-like text-sm text-zinc-800">
                        <Markdown source={body} />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        Digite o corpo acima para ver a prévia.
                      </p>
                    )}
                  </div>
                </details>
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
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field id="seo_description" label="SEO · descrição">
                  <input
                    id="seo_description"
                    name="seo_description"
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
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
          </div>
        </div>

        <div
          className={`min-h-[70vh] border-t border-[#e4ddd2] bg-[#f3efe8] px-3 pb-2 pt-1 lg:sticky lg:top-0 lg:h-[100dvh] lg:max-h-[100dvh] lg:border-t-0 lg:border-l ${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <LiveSitePreview
            document={previewDocument}
            post={livePost}
            previewBasePath={previewBasePath}
            fullPreviewHref={fullPreviewHref}
            badge="Blog · ao vivo"
            className="h-full"
          />
        </div>
      </div>

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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-3 py-1.5 text-sm font-semibold transition"
      style={
        active
          ? { background: "#141210", color: "#fffcf8" }
          : { color: "#2a2622" }
      }
    >
      {children}
    </button>
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
