import { z } from "zod";

import { moduleKeys } from "@/modules/registry";
import { templateKeys } from "@/lib/templates/registry";

const jsonObject = z.record(z.string(), z.unknown()).default({});

export const siteDocumentSectionSchema = z.object({
  key: z.string(),
  module: z.enum(moduleKeys),
  content: jsonObject,
  settings: jsonObject,
});

export const siteDocumentPageSchema = z.object({
  path: z.string(),
  title: z.string(),
  seo: jsonObject,
  sections: z.array(siteDocumentSectionSchema).default([]),
});

export const siteDocumentProfessionalSchema = z.object({
  full_name: z.string().nullable().optional(),
  professional_name: z.string().nullable().optional(),
  council: z.string().nullable().optional(),
  registration_number: z.string().nullable().optional(),
  specialty_registration: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  education: z.unknown().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  social_links: z.unknown().optional(),
  office_address: z.unknown().optional(),
  attendance_modes: z.array(z.string()).nullable().optional(),
});

export const siteDocumentBlogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().default(""),
  body_markdown: z.string().default(""),
  cover_image_url: z.string().nullable().optional(),
  published_at: z.string().nullable().optional(),
  seo: jsonObject,
});

export const siteDocumentBlogSchema = z.object({
  enabled: z.boolean().default(false),
  title: z.string().default("Blog"),
  intro: z.string().default(""),
  posts: z.array(siteDocumentBlogPostSchema).default([]),
});

export const siteDocumentSchema = z.object({
  schema_version: z.literal(1),
  site: z.object({
    slug: z.string(),
    template: z.object({
      key: z.enum(templateKeys),
      version: z.number().int().positive(),
    }),
    theme: jsonObject,
    seo: jsonObject,
  }),
  professional: siteDocumentProfessionalSchema,
  pages: z.array(siteDocumentPageSchema).default([]),
  blog: siteDocumentBlogSchema.default({
    enabled: false,
    title: "Blog",
    intro: "",
    posts: [],
  }),
});

export type SiteDocument = z.infer<typeof siteDocumentSchema>;
export type SiteDocumentSection = z.infer<typeof siteDocumentSectionSchema>;
export type SiteDocumentProfessional = z.infer<
  typeof siteDocumentProfessionalSchema
>;
export type SiteDocumentBlog = z.infer<typeof siteDocumentBlogSchema>;
export type SiteDocumentBlogPost = z.infer<typeof siteDocumentBlogPostSchema>;

export function parseSiteDocument(value: unknown): SiteDocument | null {
  const parsed = siteDocumentSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function professionalDisplayName(
  professional: SiteDocumentProfessional,
): string {
  const preferred = professional.professional_name?.trim();
  if (preferred) {
    return preferred;
  }
  const fullName = professional.full_name?.trim();
  if (fullName) {
    return fullName;
  }
  return "Profissional";
}

export function whatsappHref(whatsapp: string | null | undefined): string | null {
  if (!whatsapp) {
    return null;
  }
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }
  return `https://wa.me/${digits}`;
}

export function documentBlog(document: SiteDocument): SiteDocumentBlog {
  return document.blog;
}

export function findBlogPost(
  document: SiteDocument,
  slug: string,
): SiteDocumentBlogPost | null {
  return document.blog.posts.find((post) => post.slug === slug) ?? null;
}
