import type { Metadata } from "next";
import { z } from "zod";

import {
  professionalDisplayName,
  type SiteDocument,
  type SiteDocumentBlogPost,
} from "@/lib/sites/document";
import {
  publicSiteOrigin,
  publicSiteUrl,
} from "@/lib/sites/host";
import { faqContentSchema } from "@/modules/schemas";

type PublishedCanonicalInput = {
  slug: string;
  primary_domain: string | null;
};

const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const optionalHttpsUrl = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || /^https:\/\//i.test(value), {
    message: "A URL precisa começar com https://.",
  });

export const siteSeoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .max(70, "Título com no máximo 70 caracteres.")
    .transform(emptyToNull),
  description: z
    .string()
    .trim()
    .max(170, "Descrição com no máximo 170 caracteres.")
    .transform(emptyToNull),
  og_image_url: optionalHttpsUrl,
  google_site_verification: z
    .string()
    .trim()
    .max(120)
    .transform(emptyToNull)
    .refine(
      (value) => value === null || /^[A-Za-z0-9_-]+$/.test(value),
      {
        message: "Use só o código de verificação do Google (sem tags HTML).",
      },
    ),
  locality: z
    .string()
    .trim()
    .max(80, "Cidade com no máximo 80 caracteres.")
    .transform(emptyToNull),
  region: z
    .string()
    .trim()
    .max(40, "Estado/UF com no máximo 40 caracteres.")
    .transform(emptyToNull),
  google_business_url: optionalHttpsUrl,
});

export type SiteSeoFormValues = z.infer<typeof siteSeoFormSchema>;

export type SiteSeoFields = {
  title: string | null;
  description: string | null;
  og_image_url: string | null;
  google_site_verification: string | null;
  locality: string | null;
  region: string | null;
  google_business_url: string | null;
};

export type DocumentFaqItem = {
  question: string;
  answer: string;
};

export function siteSeoFromRecord(
  seo: Record<string, unknown> | null | undefined,
): SiteSeoFields {
  const source = seo && typeof seo === "object" ? seo : {};
  return {
    title: stringOrNull(source.title),
    description: stringOrNull(source.description),
    og_image_url: stringOrNull(source.og_image_url),
    google_site_verification: stringOrNull(source.google_site_verification),
    locality: stringOrNull(source.locality),
    region: stringOrNull(source.region),
    google_business_url: stringOrNull(source.google_business_url),
  };
}

export function parseSiteSeoForm(formData: FormData) {
  return siteSeoFormSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    og_image_url: String(formData.get("og_image_url") ?? ""),
    google_site_verification: String(
      formData.get("google_site_verification") ?? "",
    ),
    locality: String(formData.get("locality") ?? ""),
    region: String(formData.get("region") ?? ""),
    google_business_url: String(formData.get("google_business_url") ?? ""),
  });
}

/** Mescla campos de SEO do site preservando `blog` e demais chaves. */
export function mergeSiteSeo(
  current: Record<string, unknown>,
  values: SiteSeoFormValues,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...current };
  setOrDelete(next, "title", values.title);
  setOrDelete(next, "description", values.description);
  setOrDelete(next, "og_image_url", values.og_image_url);
  setOrDelete(next, "google_site_verification", values.google_site_verification);
  setOrDelete(next, "locality", values.locality);
  setOrDelete(next, "region", values.region);
  setOrDelete(next, "google_business_url", values.google_business_url);
  return next;
}

export function seoFromDocument(document: SiteDocument): {
  title: string;
  description: string;
  ogImage: string | null;
  googleSiteVerification: string | null;
  locality: string | null;
  region: string | null;
  googleBusinessUrl: string | null;
} {
  const fields = siteSeoFromRecord(document.site.seo);
  const name = professionalDisplayName(document.professional);
  const officeCity = officeCityFromProfessional(document.professional.office_address);
  const locality = fields.locality ?? officeCity;

  let description = fields.description;
  if (!description) {
    description = locality
      ? `Atendimento clínico com ${name} em ${locality}.`
      : `Atendimento clínico com ${name}.`;
  }

  return {
    title: fields.title ?? name,
    description,
    ogImage:
      fields.og_image_url ??
      document.professional.photo_url?.trim() ??
      null,
    googleSiteVerification: fields.google_site_verification,
    locality,
    region: fields.region ?? officeRegionFromProfessional(document.professional.office_address),
    googleBusinessUrl: fields.google_business_url,
  };
}

/** FAQ visível no snapshot (só seções publicadas entram no document). */
export function documentFaqItems(document: SiteDocument): DocumentFaqItem[] {
  const home = document.pages.find((page) => page.path === "/") ?? document.pages[0];
  if (!home) {
    return [];
  }

  const items: DocumentFaqItem[] = [];
  for (const section of home.sections) {
    if (section.module !== "faq") {
      continue;
    }
    const parsed = faqContentSchema.safeParse(section.content ?? {});
    if (!parsed.success) {
      continue;
    }
    for (const item of parsed.data.items) {
      if (item.question.trim() && item.answer.trim()) {
        items.push({
          question: item.question.trim(),
          answer: item.answer.trim(),
        });
      }
    }
  }
  return items;
}

export function socialProfileUrls(document: SiteDocument): string[] {
  const links = document.professional.social_links;
  if (!links || typeof links !== "object" || Array.isArray(links)) {
    return [];
  }
  const raw = links as Record<string, unknown>;
  const urls: string[] = [];
  for (const key of ["instagram", "linkedin", "website", "facebook", "youtube"]) {
    const value = stringOrNull(raw[key]);
    if (!value) {
      continue;
    }
    if (/^https?:\/\//i.test(value)) {
      urls.push(value);
    } else if (key === "instagram") {
      urls.push(`https://instagram.com/${value.replace(/^@/, "")}`);
    } else if (key === "linkedin") {
      urls.push(
        value.includes("linkedin.com")
          ? `https://${value.replace(/^https?:\/\//i, "")}`
          : `https://www.linkedin.com/in/${value}`,
      );
    }
  }
  return urls;
}

/** Canonical preferindo domínio personalizado principal verificado. */
export function publishedCanonicalUrl(
  published: PublishedCanonicalInput,
  path = "/",
): string {
  const normalizedPath =
    !path || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;

  if (published.primary_domain) {
    const origin = `https://${published.primary_domain.replace(/\/$/, "")}`;
    return normalizedPath === "/" ? `${origin}/` : `${origin}${normalizedPath}`;
  }

  const platform = publicSiteUrl(published.slug).replace(/\/$/, "");
  return normalizedPath === "/" ? `${platform}/` : `${platform}${normalizedPath}`;
}

export function hostCanonicalUrl(host: string, path = "/"): string {
  const normalized = host.trim().toLowerCase();
  const origin =
    normalized.endsWith(".localhost") || normalized === "localhost"
      ? `http://${normalized}:3000`
      : publicSiteOrigin(normalized);
  const normalizedPath =
    !path || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;
  return normalizedPath === "/" ? `${origin}/` : `${origin}${normalizedPath}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string | null;
  googleSiteVerification?: string | null;
  type?: "website" | "article";
}): Metadata {
  const images = input.ogImage
    ? [{ url: input.ogImage, alt: input.title }]
    : undefined;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.canonical },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.canonical,
      type: input.type ?? "website",
      images,
      locale: "pt_BR",
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      images: input.ogImage ? [input.ogImage] : undefined,
    },
    verification: input.googleSiteVerification
      ? { google: input.googleSiteVerification }
      : undefined,
  };
}

export function postSeoMetadata(
  document: SiteDocument,
  post: SiteDocumentBlogPost,
): { title: string; description: string; ogImage: string | null } {
  const siteSeo = seoFromDocument(document);
  const seoTitle =
    typeof post.seo.title === "string" && post.seo.title.trim()
      ? post.seo.title.trim()
      : post.title;
  const seoDescription =
    typeof post.seo.description === "string" && post.seo.description.trim()
      ? post.seo.description.trim()
      : post.excerpt?.trim() || siteSeo.description;

  return {
    title: seoTitle,
    description: seoDescription,
    ogImage: post.cover_image_url?.trim() || siteSeo.ogImage,
  };
}

export type SeoChecklistGroup = "basico" | "descoberta" | "conteudo";

export type SeoChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
  group: SeoChecklistGroup;
};

export type SeoChecklistSectionInput = {
  module_key: string;
  is_visible: boolean;
  content: Record<string, unknown>;
};

export function buildSeoChecklist(input: {
  seo: Record<string, unknown>;
  document: SiteDocument | null;
  sections?: SeoChecklistSectionInput[];
  hasVerifiedDomain: boolean;
  isLive: boolean;
}): SeoChecklistItem[] {
  const fields = siteSeoFromRecord(input.seo);
  const posts = input.document?.blog.posts ?? [];
  const postsWithoutExcerpt = posts.filter((post) => !post.excerpt?.trim());
  const postsWithoutCover = posts.filter((post) => !post.cover_image_url);
  const officeCity = input.document
    ? officeCityFromProfessional(input.document.professional.office_address)
    : null;
  const hasLocality = Boolean(fields.locality || officeCity);
  const socialCount = input.document ? socialProfileUrls(input.document).length : 0;
  const faqState = resolveFaqChecklist(input.sections, input.document);

  return [
    {
      id: "title",
      label: "Título SEO da home",
      ok: Boolean(fields.title),
      hint: fields.title
        ? undefined
        : "Sem título customizado, o Google usa o nome do profissional.",
      group: "basico",
    },
    {
      id: "description",
      label: "Descrição SEO da home",
      ok: Boolean(fields.description),
      hint: fields.description
        ? undefined
        : "Adicione uma frase clara sobre o atendimento (até 170 caracteres).",
      group: "basico",
    },
    {
      id: "og",
      label: "Imagem de compartilhamento",
      ok: Boolean(fields.og_image_url || input.document?.professional.photo_url),
      hint: "Usada no WhatsApp e redes. Sem ela, cai na foto do perfil.",
      group: "basico",
    },
    {
      id: "live",
      label: "Site publicado",
      ok: input.isLive,
      hint: input.isLive
        ? undefined
        : "SEO público só vale depois que a equipe publica o snapshot.",
      group: "basico",
    },
    {
      id: "domain",
      label: "Domínio personalizado verificado",
      ok: input.hasVerifiedDomain,
      hint: input.hasVerifiedDomain
        ? undefined
        : "Sem domínio próprio, o canonical usa a URL da plataforma.",
      group: "basico",
    },
    {
      id: "locality",
      label: "Cidade / região de atendimento",
      ok: hasLocality,
      hint: hasLocality
        ? undefined
        : "Ajuda Google e ChatGPT a associar você a buscas locais (ex.: psicólogo em Curitiba).",
      group: "descoberta",
    },
    {
      id: "faq",
      label: "FAQ visível com perguntas",
      ok: faqState.ok,
      hint: faqState.hint,
      group: "descoberta",
    },
    {
      id: "social",
      label: "Perfis sociais no cadastro",
      ok: socialCount > 0,
      hint:
        socialCount > 0
          ? undefined
          : "Instagram/LinkedIn no perfil reforçam a entidade do profissional na web.",
      group: "descoberta",
    },
    {
      id: "gmb",
      label: "Google Business (URL)",
      ok: Boolean(fields.google_business_url),
      hint: fields.google_business_url
        ? undefined
        : "Opcional, mas forte para aparecer em recomendações locais.",
      group: "descoberta",
    },
    {
      id: "posts-excerpt",
      label: "Posts com resumo",
      ok: posts.length === 0 || postsWithoutExcerpt.length === 0,
      hint:
        postsWithoutExcerpt.length > 0
          ? `${postsWithoutExcerpt.length} post(s) sem resumo.`
          : undefined,
      group: "conteudo",
    },
    {
      id: "posts-cover",
      label: "Posts com capa",
      ok: posts.length === 0 || postsWithoutCover.length === 0,
      hint:
        postsWithoutCover.length > 0
          ? `${postsWithoutCover.length} post(s) sem imagem de capa.`
          : undefined,
      group: "conteudo",
    },
  ];
}

function resolveFaqChecklist(
  sections: SeoChecklistSectionInput[] | undefined,
  document: SiteDocument | null,
): { ok: boolean; hint?: string } {
  if (sections && sections.length > 0) {
    const faqSections = sections.filter((section) => section.module_key === "faq");
    if (faqSections.length === 0) {
      return {
        ok: false,
        hint: "Ative a seção FAQ no editor e preencha 3–5 dúvidas reais.",
      };
    }
    const visible = faqSections.filter((section) => section.is_visible);
    if (visible.length === 0) {
      return {
        ok: false,
        hint: "A seção FAQ existe, mas está oculta. Deixe visível e publique de novo.",
      };
    }
    const hasItems = visible.some((section) => {
      const parsed = faqContentSchema.safeParse(section.content ?? {});
      return parsed.success && parsed.data.items.length > 0;
    });
    if (!hasItems) {
      return {
        ok: false,
        hint: "FAQ visível sem perguntas. Adicione respostas curtas e claras.",
      };
    }
    return { ok: true };
  }

  const publishedItems = document ? documentFaqItems(document) : [];
  if (publishedItems.length === 0) {
    return {
      ok: false,
      hint: "Ative a seção FAQ no editor e preencha 3–5 dúvidas reais.",
    };
  }
  return { ok: true };
}

function setOrDelete(
  target: Record<string, unknown>,
  key: string,
  value: string | null,
) {
  if (value) {
    target[key] = value;
  } else {
    delete target[key];
  }
}

function officeCityFromProfessional(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return stringOrNull((value as Record<string, unknown>).city);
}

function officeRegionFromProfessional(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  return stringOrNull(raw.state ?? raw.region);
}

function stringOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
