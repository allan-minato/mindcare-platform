import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import {
  type EligibleProfessional,
  type SiteDetail,
  type SiteListItem,
  type SiteSection,
  type SiteTemplateOption,
} from "@/lib/sites/schema";
import { isTemplateKey, type TemplateKey } from "@/lib/templates/registry";
import { normalizeSectionPayload } from "@/modules/registry";
import { createClient } from "@/lib/supabase/server";

type SiteListRow = {
  id: string;
  name: string;
  slug: string;
  template_key: string;
  professional_id: string;
  created_at: string;
  updated_at: string;
  professionals:
    | { full_name: string; professional_name: string | null }
    | { full_name: string; professional_name: string | null }[]
    | null;
};

type SiteDetailRow = {
  id: string;
  name: string;
  slug: string;
  template_key: string;
  professional_id: string;
  theme: unknown;
  seo: unknown;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  professionals:
    | { full_name: string; professional_name: string | null }
    | { full_name: string; professional_name: string | null }[]
    | null;
};

type PageRow = {
  id: string;
  path: string;
  title: string;
};

type SectionRow = {
  id: string;
  module_key: string;
  section_key: string;
  position: number;
  is_visible: boolean;
  content: unknown;
  settings: unknown;
};

export async function listSites(): Promise<SiteListItem[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select(
      "id, name, slug, template_key, professional_id, created_at, updated_at, professionals(full_name, professional_name)",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar os sites.");
  }

  return ((data ?? []) as SiteListRow[]).flatMap((row) => {
    if (!isTemplateKey(row.template_key)) {
      return [];
    }
    const professional = firstRelation(row.professionals);
    return [
      {
        id: row.id,
        name: row.name,
        slug: row.slug,
        template_key: row.template_key,
        professional_id: row.professional_id,
        professional_name:
          professional?.professional_name?.trim() ||
          professional?.full_name ||
          "Profissional",
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    ];
  });
}

export async function getSite(id: string): Promise<SiteDetail | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select(
      "id, name, slug, template_key, professional_id, theme, seo, archived_at, created_at, updated_at, professionals(full_name, professional_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o site.");
  }

  if (!data) {
    return null;
  }

  const row = data as SiteDetailRow;
  if (!isTemplateKey(row.template_key)) {
    return null;
  }

  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .select("id, path, title")
    .eq("site_id", id)
    .eq("path", "/")
    .maybeSingle<PageRow>();

  if (pageError) {
    throw new Error("Não foi possível carregar a página inicial do site.");
  }

  let sections: SiteSection[] = [];
  if (page) {
    const { data: sectionRows, error: sectionsError } = await supabase
      .from("site_sections")
      .select(
        "id, module_key, section_key, position, is_visible, content, settings",
      )
      .eq("page_id", page.id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (sectionsError) {
      throw new Error("Não foi possível carregar as seções do site.");
    }

    sections = ((sectionRows ?? []) as SectionRow[]).map((section) => {
      const normalized = normalizeSectionPayload(
        section.module_key,
        section.content,
        section.settings,
      );
      return {
        id: section.id,
        module_key: section.module_key,
        section_key: section.section_key,
        position: section.position,
        is_visible: section.is_visible,
        content: normalized.success
          ? normalized.data.content
          : asObject(section.content),
        settings: normalized.success
          ? normalized.data.settings
          : asObject(section.settings),
      };
    });
  }

  const professional = firstRelation(row.professionals);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    template_key: row.template_key as TemplateKey,
    professional_id: row.professional_id,
    professional_name:
      professional?.professional_name?.trim() ||
      professional?.full_name ||
      "Profissional",
    theme: asObject(row.theme),
    seo: asObject(row.seo),
    archived_at: row.archived_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    home_page: page
      ? {
          id: page.id,
          path: page.path,
          title: page.title,
          sections,
        }
      : null,
  };
}

export async function listActiveTemplates(): Promise<SiteTemplateOption[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_templates")
    .select("key, name, description")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os templates.");
  }

  return (data ?? []).flatMap((row) => {
    if (!isTemplateKey(row.key)) {
      return [];
    }
    return [
      {
        key: row.key,
        name: row.name,
        description: row.description,
      },
    ];
  });
}

export async function listEligibleProfessionals(): Promise<
  EligibleProfessional[]
> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("id, full_name, professional_name")
    .neq("status", "archived")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os profissionais.");
  }

  return data ?? [];
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}
