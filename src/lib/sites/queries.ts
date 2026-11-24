import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import {
  isDomainConfigurationStatus,
  isDomainVerificationStatus,
  type SiteDomain,
} from "@/lib/sites/domains";
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

type PublicationFields = {
  live_publication_id: string | null;
  published_version: number | null;
  published_at: string | null;
};

type SiteListRow = {
  id: string;
  name: string;
  slug: string;
  template_key: string;
  professional_id: string;
  live_publication_id: string | null;
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
  live_publication_id: string | null;
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

type PublicationRow = {
  id: string;
  version: number;
  published_at: string;
};

export async function listSites(): Promise<SiteListItem[]> {
  await requireAdmin();
  return loadSiteList();
}

export async function listMySites(
  professionalId: string,
): Promise<SiteListItem[]> {
  return loadSiteList(professionalId);
}

async function loadSiteList(
  professionalId?: string,
): Promise<SiteListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sites")
    .select(
      "id, name, slug, template_key, professional_id, live_publication_id, created_at, updated_at, professionals(full_name, professional_name)",
    )
    .order("updated_at", { ascending: false });

  if (professionalId) {
    query = query.eq("professional_id", professionalId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Não foi possível carregar os sites.");
  }

  const rows = (data ?? []) as SiteListRow[];
  const publicationIds = rows
    .map((row) => row.live_publication_id)
    .filter((id): id is string => Boolean(id));

  const publications = await loadPublicationsById(supabase, publicationIds);

  return rows.flatMap((row) => {
    if (!isTemplateKey(row.template_key)) {
      return [];
    }
    const professional = firstRelation(row.professionals);
    const publication = row.live_publication_id
      ? publications.get(row.live_publication_id)
      : null;
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
        live_publication_id: row.live_publication_id,
        published_version: publication?.version ?? null,
        published_at: publication?.published_at ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    ];
  });
}

export async function getSite(id: string): Promise<SiteDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from("sites")
    .select(
      "id, name, slug, template_key, professional_id, theme, seo, archived_at, live_publication_id, created_at, updated_at, professionals(full_name, professional_name)",
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
  const publicationFields = await resolvePublicationFields(
    supabase,
    row.live_publication_id,
  );
  const [domains, hasPendingChanges] = await Promise.all([
    listSiteDomains(id),
    resolveHasPendingChanges(supabase, {
      siteId: id,
      professionalId: row.professional_id,
      siteUpdatedAt: row.updated_at,
      publishedAt: publicationFields.published_at,
      isLive: Boolean(publicationFields.live_publication_id),
    }),
  ]);

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
    live_publication_id: publicationFields.live_publication_id,
    published_version: publicationFields.published_version,
    published_at: publicationFields.published_at,
    has_pending_changes: hasPendingChanges,
    created_at: row.created_at,
    updated_at: row.updated_at,
    domains,
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

export async function listSiteDomains(siteId: string): Promise<SiteDomain[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const { data, error } = await supabase
    .from("site_domains")
    .select(
      "id, site_id, domain, is_primary, verification_status, configuration_status, verified_at, created_at, updated_at",
    )
    .eq("site_id", siteId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os domínios do site.");
  }

  return ((data ?? []) as Array<Record<string, unknown>>).flatMap((row) => {
    const verification = String(row.verification_status ?? "");
    const configuration = String(row.configuration_status ?? "");
    if (
      !isDomainVerificationStatus(verification) ||
      !isDomainConfigurationStatus(configuration)
    ) {
      return [];
    }
    return [
      {
        id: String(row.id),
        site_id: String(row.site_id),
        domain: String(row.domain),
        is_primary: Boolean(row.is_primary),
        verification_status: verification,
        configuration_status: configuration,
        verified_at:
          typeof row.verified_at === "string" ? row.verified_at : null,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      },
    ];
  });
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

async function resolvePublicationFields(
  supabase: Awaited<ReturnType<typeof createClient>>,
  livePublicationId: string | null,
): Promise<PublicationFields> {
  if (!livePublicationId) {
    return {
      live_publication_id: null,
      published_version: null,
      published_at: null,
    };
  }

  const publications = await loadPublicationsById(supabase, [
    livePublicationId,
  ]);
  const publication = publications.get(livePublicationId);
  return {
    live_publication_id: livePublicationId,
    published_version: publication?.version ?? null,
    published_at: publication?.published_at ?? null,
  };
}

async function resolveHasPendingChanges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    siteId: string;
    professionalId: string;
    siteUpdatedAt: string;
    publishedAt: string | null;
    isLive: boolean;
  },
): Promise<boolean> {
  if (!input.isLive || !input.publishedAt) {
    return false;
  }

  const publishedMs = Date.parse(input.publishedAt);
  if (Number.isNaN(publishedMs)) {
    return false;
  }

  const candidates: number[] = [Date.parse(input.siteUpdatedAt)];

  const [{ data: pages }, { data: posts }, { data: professional }] =
    await Promise.all([
      supabase
        .from("site_pages")
        .select("id, updated_at")
        .eq("site_id", input.siteId),
      supabase
        .from("site_posts")
        .select("updated_at")
        .eq("site_id", input.siteId),
      supabase
        .from("professionals")
        .select("updated_at")
        .eq("id", input.professionalId)
        .maybeSingle(),
    ]);

  for (const page of pages ?? []) {
    candidates.push(Date.parse(String(page.updated_at)));
  }
  for (const post of posts ?? []) {
    candidates.push(Date.parse(String(post.updated_at)));
  }
  if (professional?.updated_at) {
    candidates.push(Date.parse(String(professional.updated_at)));
  }

  const pageIds = (pages ?? []).map((page) => String(page.id));
  if (pageIds.length > 0) {
    const { data: sections } = await supabase
      .from("site_sections")
      .select("updated_at")
      .in("page_id", pageIds);
    for (const section of sections ?? []) {
      candidates.push(Date.parse(String(section.updated_at)));
    }
  }

  const draftMs = candidates.reduce((max, value) => {
    if (Number.isNaN(value)) {
      return max;
    }
    return Math.max(max, value);
  }, 0);

  // 1,5s de folga evita falso positivo logo após publicar.
  return draftMs > publishedMs + 1500;
}

async function loadPublicationsById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[],
): Promise<Map<string, PublicationRow>> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("site_publications")
    .select("id, version, published_at")
    .in("id", uniqueIds);

  if (error || !data) {
    return new Map();
  }

  return new Map(
    (data as PublicationRow[]).map((row) => [row.id, row] as const),
  );
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
