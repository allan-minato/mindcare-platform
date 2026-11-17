import { z } from "zod";

import {
  isTemplateKey,
  type TemplateKey,
} from "@/lib/templates/registry";

export const reservedSlugs = [
  "www",
  "app",
  "admin",
  "api",
  "preview",
] as const;

export type SiteListItem = {
  id: string;
  name: string;
  slug: string;
  template_key: TemplateKey;
  professional_id: string;
  professional_name: string;
  live_publication_id: string | null;
  published_version: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSection = {
  id: string;
  module_key: string;
  section_key: string;
  position: number;
  is_visible: boolean;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export type SectionEditorInput = {
  id: string;
  is_visible: boolean;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export type SiteDetail = {
  id: string;
  name: string;
  slug: string;
  template_key: TemplateKey;
  professional_id: string;
  professional_name: string;
  theme: Record<string, unknown>;
  seo: Record<string, unknown>;
  archived_at: string | null;
  live_publication_id: string | null;
  published_version: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  home_page: {
    id: string;
    path: string;
    title: string;
    sections: SiteSection[];
  } | null;
};

export type SiteTemplateOption = {
  key: TemplateKey;
  name: string;
  description: string | null;
};

export type EligibleProfessional = {
  id: string;
  full_name: string;
  professional_name: string | null;
};

export const siteCreateSchema = z.object({
  professional_id: z
    .string()
    .uuid("Selecione um profissional."),
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do site.")
    .max(200, "Nome com no máximo 200 caracteres."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Informe o slug.")
    .max(63, "Slug com no máximo 63 caracteres.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens.",
    )
    .refine(
      (value) =>
        !reservedSlugs.includes(value as (typeof reservedSlugs)[number]),
      { message: "Este slug é reservado." },
    ),
  template_key: z
    .string()
    .refine((value) => isTemplateKey(value), {
      message: "Escolha um template válido.",
    })
    .transform((value) => value as TemplateKey),
});

export type SiteCreateValues = z.infer<typeof siteCreateSchema>;

export function parseSiteCreateForm(formData: FormData) {
  return siteCreateSchema.safeParse({
    professional_id: String(formData.get("professional_id") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    template_key: String(formData.get("template_key") ?? ""),
  });
}

export function suggestSiteName(professional: EligibleProfessional) {
  return professional.professional_name?.trim() || professional.full_name;
}

export function suggestSlug(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}
