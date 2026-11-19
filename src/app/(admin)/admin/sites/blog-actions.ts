"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSiteEditor } from "@/lib/auth/site-access";
import {
  parseBlogSettingsForm,
  parseSitePostForm,
  postSeoFromForm,
} from "@/lib/sites/posts";
import { createClient } from "@/lib/supabase/server";

export type BlogActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
}

function humanizeDbError(message?: string) {
  if (!message) {
    return "Não foi possível salvar.";
  }
  if (/duplicate|unique/i.test(message)) {
    return "Já existe um post com este slug neste site.";
  }
  return "Não foi possível salvar. Tente novamente.";
}

function revalidateBlogPaths(siteId: string, portal: "admin" | "app") {
  const base = portal === "admin" ? "/admin/sites" : "/app/sites";
  revalidatePath(`${base}/${siteId}`);
  revalidatePath(`${base}/${siteId}/blog`);
  revalidatePath(`/preview/${siteId}`);
  revalidatePath(`/preview/${siteId}/blog`);
}

export async function updateBlogSettings(
  siteId: string,
  portal: "admin" | "app",
  _state: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requireSiteEditor(siteId);
  const parsed = parseBlogSettingsForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createClient();
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("seo")
    .eq("id", siteId)
    .maybeSingle();

  if (siteError || !site) {
    return { error: "Site não encontrado." };
  }

  const currentSeo =
    site.seo && typeof site.seo === "object" && !Array.isArray(site.seo)
      ? (site.seo as Record<string, unknown>)
      : {};

  const nextSeo = {
    ...currentSeo,
    blog: {
      title: parsed.data.title,
      intro: parsed.data.intro,
    },
  };

  const { error } = await supabase
    .from("sites")
    .update({ seo: nextSeo })
    .eq("id", siteId);

  if (error) {
    return { error: humanizeDbError(error.message) };
  }

  revalidateBlogPaths(siteId, portal);
  return {};
}

export async function createSitePost(
  siteId: string,
  portal: "admin" | "app",
  _state: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requireSiteEditor(siteId);
  const parsed = parseSitePostForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const values = parsed.data;
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("site_posts")
    .select("position")
    .eq("site_id", siteId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position =
    typeof maxRow?.position === "number" ? maxRow.position + 1 : 0;

  const publishedAt =
    values.status === "published" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("site_posts")
    .insert({
      site_id: siteId,
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      body_markdown: values.body_markdown,
      cover_image_url: values.cover_image_url,
      status: values.status,
      published_at: publishedAt,
      seo: postSeoFromForm(values),
      position,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: humanizeDbError(error?.message) };
  }

  revalidateBlogPaths(siteId, portal);
  redirect(
    portal === "admin"
      ? `/admin/sites/${siteId}/blog/${data.id}`
      : `/app/sites/${siteId}/blog/${data.id}`,
  );
}

export async function updateSitePost(
  siteId: string,
  postId: string,
  portal: "admin" | "app",
  _state: BlogActionState,
  formData: FormData,
): Promise<BlogActionState> {
  await requireSiteEditor(siteId);
  const parsed = parseSitePostForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const values = parsed.data;
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("site_posts")
    .select("id, status, published_at")
    .eq("site_id", siteId)
    .eq("id", postId)
    .maybeSingle();

  if (existingError || !existing) {
    return { error: "Post não encontrado." };
  }

  let publishedAt = existing.published_at as string | null;
  if (values.status === "published") {
    publishedAt = publishedAt ?? new Date().toISOString();
  } else {
    publishedAt = null;
  }

  const { error } = await supabase
    .from("site_posts")
    .update({
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      body_markdown: values.body_markdown,
      cover_image_url: values.cover_image_url,
      status: values.status,
      published_at: publishedAt,
      seo: postSeoFromForm(values),
    })
    .eq("site_id", siteId)
    .eq("id", postId);

  if (error) {
    return { error: humanizeDbError(error.message) };
  }

  revalidateBlogPaths(siteId, portal);
  return {};
}

export async function deleteSitePost(
  siteId: string,
  postId: string,
  portal: "admin" | "app",
): Promise<BlogActionState> {
  await requireSiteEditor(siteId);
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_posts")
    .delete()
    .eq("site_id", siteId)
    .eq("id", postId);

  if (error) {
    return { error: humanizeDbError(error.message) };
  }

  revalidateBlogPaths(siteId, portal);
  redirect(
    portal === "admin"
      ? `/admin/sites/${siteId}/blog`
      : `/app/sites/${siteId}/blog`,
  );
}
