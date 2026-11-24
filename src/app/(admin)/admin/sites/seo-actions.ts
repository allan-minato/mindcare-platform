"use server";

import { revalidatePath } from "next/cache";

import { requireSiteEditor } from "@/lib/auth/site-access";
import { mergeSiteSeo, parseSiteSeoForm } from "@/lib/sites/seo";
import { createClient } from "@/lib/supabase/server";

export type SeoActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  saved?: boolean;
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

export async function updateSiteSeo(
  siteId: string,
  portal: "admin" | "app",
  _state: SeoActionState,
  formData: FormData,
): Promise<SeoActionState> {
  await requireSiteEditor(siteId);
  const parsed = parseSiteSeoForm(formData);
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

  const nextSeo = mergeSiteSeo(currentSeo, parsed.data);

  const { error } = await supabase
    .from("sites")
    .update({ seo: nextSeo })
    .eq("id", siteId);

  if (error) {
    return { error: "Não foi possível salvar o SEO. Tente novamente." };
  }

  const base = portal === "admin" ? "/admin/sites" : "/app/sites";
  revalidatePath(`${base}/${siteId}`);
  revalidatePath(`/preview/${siteId}`);
  return { saved: true };
}
