"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin";
import {
  parseSiteCreateForm,
  type SectionEditorInput,
} from "@/lib/sites/schema";
import { sectionsForTemplate } from "@/lib/templates/registry";
import { normalizeSectionPayload } from "@/modules/registry";
import { createClient } from "@/lib/supabase/server";

export type SiteActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export type SectionsActionState = {
  error?: string;
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

export async function updateSiteSections(
  siteId: string,
  _state: SectionsActionState,
  formData: FormData,
): Promise<SectionsActionState> {
  await requireAdmin();

  const raw = String(formData.get("sections") ?? "");
  let inputs: SectionEditorInput[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { error: "Payload de seções inválido." };
    }
    inputs = parsed as SectionEditorInput[];
  } catch {
    return { error: "Payload de seções inválido." };
  }

  if (inputs.length === 0) {
    return { error: "Nenhuma seção para salvar." };
  }

  const supabase = await createClient();
  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .select("id")
    .eq("site_id", siteId)
    .eq("path", "/")
    .maybeSingle();

  if (pageError || !page) {
    return { error: "Página inicial do site não encontrada." };
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("site_sections")
    .select("id, module_key")
    .eq("page_id", page.id);

  if (existingError || !existingRows) {
    return { error: "Não foi possível carregar as seções do site." };
  }

  const existingById = new Map(
    existingRows.map((row) => [row.id, row.module_key]),
  );

  if (inputs.length !== existingById.size) {
    return { error: "O conjunto de seções não confere com o site." };
  }

  const updates: Array<{
    id: string;
    is_visible: boolean;
    position: number;
    content: Record<string, unknown>;
    settings: Record<string, unknown>;
  }> = [];

  for (const [position, input] of inputs.entries()) {
    if (!input?.id || typeof input.id !== "string") {
      return { error: "Seção sem identificador." };
    }
    const moduleKey = existingById.get(input.id);
    if (!moduleKey) {
      return { error: "Uma das seções não pertence a este site." };
    }

    const normalized = normalizeSectionPayload(
      moduleKey,
      input.content,
      input.settings ?? {},
    );
    if (!normalized.success) {
      return { error: `${moduleKey}: ${normalized.error}` };
    }

    updates.push({
      id: input.id,
      is_visible: Boolean(input.is_visible),
      position,
      content: normalized.data.content,
      settings: normalized.data.settings,
    });
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("site_sections")
      .update({
        is_visible: update.is_visible,
        position: update.position,
        content: update.content,
        settings: update.settings,
      })
      .eq("id", update.id)
      .eq("page_id", page.id);

    if (error) {
      return { error: "Não foi possível salvar as seções." };
    }
  }

  redirect(`/admin/sites/${siteId}`);
}

export type PublishActionState = {
  error?: string;
};

export async function publishSite(
  siteId: string,
  state: PublishActionState,
  formData: FormData,
): Promise<PublishActionState> {
  void state;
  void formData;
  await requireAdminRole("admin");
  const supabase = await createClient();

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("id, slug")
    .eq("id", siteId)
    .maybeSingle();

  if (siteError || !site) {
    return { error: "Site não encontrado." };
  }

  const { error } = await supabase.rpc("publish_site", {
    p_site_id: siteId,
  });

  if (error) {
    return { error: humanizePublishError(error.message) };
  }

  updateTag(`site:${site.slug}`);
  revalidatePath(`/admin/sites/${siteId}`);
  revalidatePath("/admin/sites");
  redirect(`/admin/sites/${siteId}`);
}

export async function unpublishSite(
  siteId: string,
  state: PublishActionState,
  formData: FormData,
): Promise<PublishActionState> {
  void state;
  void formData;
  await requireAdminRole("admin");
  const supabase = await createClient();

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("id, slug")
    .eq("id", siteId)
    .maybeSingle();

  if (siteError || !site) {
    return { error: "Site não encontrado." };
  }

  const { error } = await supabase.rpc("unpublish_site", {
    p_site_id: siteId,
  });

  if (error) {
    return { error: humanizePublishError(error.message) };
  }

  updateTag(`site:${site.slug}`);
  revalidatePath(`/admin/sites/${siteId}`);
  revalidatePath("/admin/sites");
  redirect(`/admin/sites/${siteId}`);
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

function humanizePublishError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("arquivado")) {
    return "Site ou profissional arquivado não pode ir ao ar.";
  }
  if (lower.includes("registro") || lower.includes("registration")) {
    return "O profissional precisa ter número de registro para publicar.";
  }
  if (lower.includes("página") || lower.includes("page") || lower.includes("/")) {
    return "A página inicial precisa estar visível para publicar.";
  }
  if (lower.includes("acesso") || lower.includes("privilege")) {
    return "Sem permissão para publicar ou despublicar.";
  }
  if (lower.includes("não encontrado") || lower.includes("not found")) {
    return "Site não encontrado.";
  }
  return message || "Não foi possível alterar a publicação.";
}
