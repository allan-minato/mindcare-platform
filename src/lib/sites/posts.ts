import { z } from "zod";

export const sitePostStatuses = ["draft", "published"] as const;
export type SitePostStatus = (typeof sitePostStatuses)[number];

export type SitePost = {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string | null;
  status: SitePostStatus;
  published_at: string | null;
  seo: Record<string, unknown>;
  position: number;
  created_at: string;
  updated_at: string;
};

const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const optionalHttpsUrl = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || /^https:\/\//.test(value), {
    message: "A imagem de capa precisa de um link https:// público.",
  });

export const sitePostFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Informe o título.")
    .max(200, "Título com no máximo 200 caracteres."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Informe o slug.")
    .max(120, "Slug com no máximo 120 caracteres.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      message: "Use apenas letras minúsculas, números e hífens.",
    }),
  excerpt: z
    .string()
    .trim()
    .max(1000, "Resumo com no máximo 1.000 caracteres.")
    .default(""),
  body_markdown: z
    .string()
    .max(200000, "Corpo com no máximo 200.000 caracteres.")
    .default(""),
  cover_image_url: optionalHttpsUrl,
  status: z.enum(sitePostStatuses),
  seo_title: z
    .string()
    .trim()
    .max(200)
    .transform(emptyToNull),
  seo_description: z
    .string()
    .trim()
    .max(500)
    .transform(emptyToNull),
});

export type SitePostFormValues = z.infer<typeof sitePostFormSchema>;

export const blogSettingsFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Informe o título do blog.")
    .max(200),
  intro: z.string().trim().max(2000).default(""),
});

export type BlogSettingsFormValues = z.infer<typeof blogSettingsFormSchema>;

export function suggestPostSlug(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function parseSitePostForm(formData: FormData) {
  return sitePostFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    body_markdown: String(formData.get("body_markdown") ?? ""),
    cover_image_url: String(formData.get("cover_image_url") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    seo_title: String(formData.get("seo_title") ?? ""),
    seo_description: String(formData.get("seo_description") ?? ""),
  });
}

export function parseBlogSettingsForm(formData: FormData) {
  return blogSettingsFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    intro: String(formData.get("intro") ?? ""),
  });
}

export function postSeoFromForm(values: SitePostFormValues) {
  const seo: Record<string, string> = {};
  if (values.seo_title) seo.title = values.seo_title;
  if (values.seo_description) seo.description = values.seo_description;
  return seo;
}
