"use server";

import { redirect } from "next/navigation";

import { requireAdminRole } from "@/lib/auth/admin";
import { parseSiteCreateForm } from "@/lib/sites/schema";
import { sectionsForTemplate } from "@/lib/templates/registry";
import { createClient } from "@/lib/supabase/server";

export type SiteActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createSite(
  _state: SiteActionState,
  formData: FormData,
): Promise<SiteActionState> {
  await requireAdminRole("admin");

  const parsed = parseSiteCreateForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const values = parsed.data;
  const supabase = await createClient();

  const { data: template, error: templateError } = await supabase
    .from("site_templates")
    .select("key")
    .eq("key", values.template_key)
    .eq("is_active", true)
    .maybeSingle();

  if (templateError || !template) {
    return { error: "Template inválido ou inativo." };
  }

  const { data: professional, error: professionalError } = await supabase
    .from("professionals")
    .select("id, status")
    .eq("id", values.professional_id)
    .maybeSingle();

  if (professionalError || !professional || professional.status === "archived") {
    return { error: "Selecione um profissional ativo ou inativo." };
  }

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .insert({
      professional_id: values.professional_id,
      name: values.name,
      slug: values.slug,
      template_key: values.template_key,
      theme: {},
      seo: {},
    })
    .select("id")
    .single();

  if (siteError || !site) {
    return { error: humanizeDbError(siteError?.message) };
  }

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .insert({
      site_id: site.id,
      path: "/",
      title: "Início",
      seo: {},
      is_visible: true,
    })
    .select("id")
    .single();

  if (pageError || !page) {
    await rollbackSite(supabase, site.id, values.name);
    return { error: humanizeDbError(pageError?.message, "página") };
  }

  const blueprint = sectionsForTemplate(values.template_key);
  const sectionRows = blueprint.map((section, position) => ({
    page_id: page.id,
    module_key: section.module_key,
    section_key: section.section_key,
    position,
    content: {},
    settings: {},
    is_visible: section.is_visible,
  }));

  const { error: sectionsError } = await supabase
    .from("site_sections")
    .insert(sectionRows);

  if (sectionsError) {
    await rollbackSite(supabase, site.id, values.name);
    return { error: humanizeDbError(sectionsError.message, "seções") };
  }

  redirect(`/admin/sites/${site.id}`);
}

async function rollbackSite(
  supabase: Awaited<ReturnType<typeof createClient>>,
  siteId: string,
  name: string,
) {
  const { error: deleteError } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId);

  if (!deleteError) {
    return;
  }

  // Apenas super_admin apaga sites; admin arquiva o rascunho incompleto.
  await supabase
    .from("sites")
    .update({
      archived_at: new Date().toISOString(),
      name: `[incompleto] ${name}`.slice(0, 200),
    })
    .eq("id", siteId);
}

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

function humanizeDbError(message?: string, part?: string) {
  if (!message) {
    return part
      ? `Não foi possível criar as ${part} do site.`
      : "Não foi possível criar o site.";
  }
  if (message.includes("sites_slug") || message.includes("duplicate")) {
    return "Este slug já está em uso.";
  }
  if (message.includes("sites_slug_check") || message.includes("check")) {
    return "Algum campo não passou na validação do banco.";
  }
  if (message.includes("foreign key") || message.includes("template_key")) {
    return "Template ou profissional inválido.";
  }
  return part
    ? `Não foi possível criar as ${part} do site.`
    : "Não foi possível criar o site.";
}
