"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireAdminRole } from "@/lib/auth/admin";
import {
  isDomainConfigurationStatus,
  isDomainVerificationStatus,
  parseSiteDomainForm,
  type DomainConfigurationStatus,
  type DomainVerificationStatus,
} from "@/lib/sites/domains";
import { createClient } from "@/lib/supabase/server";

export type DomainActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

type DomainSiteContext = {
  domainId: string;
  siteId: string;
  slug: string;
  domain: string;
};

export async function addSiteDomain(
  siteId: string,
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  await requireAdminRole("admin");
  const parsed = parseSiteDomainForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise o domínio informado.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createClient();
  const site = await loadSiteSlug(supabase, siteId);
  if (!site) {
    return { error: "Site não encontrado." };
  }

  const { count, error: countError } = await supabase
    .from("site_domains")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId);

  if (countError) {
    return { error: "Não foi possível cadastrar o domínio." };
  }

  const isPrimary = (count ?? 0) === 0;

  const { error } = await supabase.from("site_domains").insert({
    site_id: siteId,
    domain: parsed.data.domain,
    is_primary: isPrimary,
    verification_status: "pending",
    configuration_status: "pending",
  });

  if (error) {
    return { error: humanizeDomainError(error.message) };
  }

  await refreshSiteDomainCache(site.slug, siteId, parsed.data.domain);
  return {};
}

export async function setDomainPrimary(
  domainId: string,
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  void formData;
  await requireAdminRole("admin");
  const supabase = await createClient();
  const context = await loadDomainSiteContext(supabase, domainId);
  if (!context) {
    return { error: "Domínio não encontrado." };
  }

  const { error: clearError } = await supabase
    .from("site_domains")
    .update({ is_primary: false })
    .eq("site_id", context.siteId)
    .neq("id", domainId);

  if (clearError) {
    return { error: "Não foi possível definir o domínio principal." };
  }

  const { error } = await supabase
    .from("site_domains")
    .update({ is_primary: true })
    .eq("id", domainId);

  if (error) {
    return { error: humanizeDomainError(error.message) };
  }

  await refreshSiteDomainCache(context.slug, context.siteId, context.domain);
  return {};
}

export async function setDomainVerification(
  domainId: string,
  status: DomainVerificationStatus,
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  void formData;
  await requireAdminRole("admin");
  if (!isDomainVerificationStatus(status)) {
    return { error: "Status de verificação inválido." };
  }

  const supabase = await createClient();
  const context = await loadDomainSiteContext(supabase, domainId);
  if (!context) {
    return { error: "Domínio não encontrado." };
  }

  const { error } = await supabase
    .from("site_domains")
    .update({
      verification_status: status,
      verified_at: status === "verified" ? new Date().toISOString() : null,
    })
    .eq("id", domainId);

  if (error) {
    return { error: humanizeDomainError(error.message) };
  }

  await refreshSiteDomainCache(context.slug, context.siteId, context.domain);
  return {};
}

export async function setDomainConfiguration(
  domainId: string,
  status: DomainConfigurationStatus,
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  void formData;
  await requireAdminRole("admin");
  if (!isDomainConfigurationStatus(status)) {
    return { error: "Status de configuração inválido." };
  }

  const supabase = await createClient();
  const context = await loadDomainSiteContext(supabase, domainId);
  if (!context) {
    return { error: "Domínio não encontrado." };
  }

  const { error } = await supabase
    .from("site_domains")
    .update({ configuration_status: status })
    .eq("id", domainId);

  if (error) {
    return { error: humanizeDomainError(error.message) };
  }

  await refreshSiteDomainCache(context.slug, context.siteId, context.domain);
  return {};
}

export async function removeSiteDomain(
  domainId: string,
  _state: DomainActionState,
  formData: FormData,
): Promise<DomainActionState> {
  void formData;
  await requireAdminRole("admin");
  const supabase = await createClient();
  const context = await loadDomainSiteContext(supabase, domainId);
  if (!context) {
    return { error: "Domínio não encontrado." };
  }

  const { error } = await supabase
    .from("site_domains")
    .delete()
    .eq("id", domainId);

  if (error) {
    return { error: humanizeDomainError(error.message) };
  }

  await refreshSiteDomainCache(context.slug, context.siteId, context.domain);
  return {};
}

async function loadSiteSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  siteId: string,
): Promise<{ id: string; slug: string } | null> {
  const { data, error } = await supabase
    .from("sites")
    .select("id, slug")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data;
}

async function loadDomainSiteContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  domainId: string,
): Promise<DomainSiteContext | null> {
  const { data, error } = await supabase
    .from("site_domains")
    .select("id, site_id, domain, sites(slug)")
    .eq("id", domainId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const sites = data.sites as
    | { slug: string }
    | { slug: string }[]
    | null
    | undefined;
  const site = Array.isArray(sites) ? sites[0] : sites;
  if (!site?.slug) {
    return null;
  }

  return {
    domainId: data.id,
    siteId: data.site_id,
    slug: site.slug,
    domain: data.domain,
  };
}

async function refreshSiteDomainCache(
  slug: string,
  siteId: string,
  domain?: string,
) {
  updateTag(`site:${slug}`);
  if (domain) {
    updateTag(`domain:${domain}`);
  }
  revalidatePath(`/admin/sites/${siteId}`);
  revalidatePath(`/admin/sites/${siteId}/domains`);
  revalidatePath(`/admin/sites/${siteId}/seo`);
  revalidatePath("/admin/sites");
}

function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([key, value]) =>
      value ? [[key, value]] : [],
    ),
  );
}

function humanizeDomainError(message: string) {
  if (message.includes("site_domains_domain_key")) {
    return "Este domínio já está cadastrado.";
  }
  if (message.includes("site_domains_one_primary_per_site")) {
    return "Já existe um domínio principal neste site.";
  }
  if (message.includes("check constraint") || message.includes("domain_check")) {
    return "Informe um domínio válido, como clinica.exemplo.com.br.";
  }
  return "Não foi possível atualizar o domínio.";
}
