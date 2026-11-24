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
    message: "A URL da imagem precisa começar com https://.",
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
      (value) =>
        value === null || /^[A-Za-z0-9_-]+$/.test(value),
      {
        message: "Use só o código de verificação do Google (sem tags HTML).",
      },
    ),
});

export type SiteSeoFormValues = z.infer<typeof siteSeoFormSchema>;

export type SiteSeoFields = {
  title: string | null;
  description: string | null;
  og_image_url: string | null;
  google_site_verification: string | null;
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
  });
}

/** Mescla campos de SEO do site preservando `blog` e demais chaves. */
export function mergeSiteSeo(
  current: Record<string, unknown>,
  values: SiteSeoFormValues,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...current };

  if (values.title) {
    next.title = values.title;
  } else {
    delete next.title;
  }

  if (values.description) {
    next.description = values.description;
  } else {
    delete next.description;
  }

  if (values.og_image_url) {
    next.og_image_url = values.og_image_url;
  } else {
    delete next.og_image_url;
  }

  if (values.google_site_verification) {
    next.google_site_verification = values.google_site_verification;
  } else {
    delete next.google_site_verification;
  }

  return next;
}

export function seoFromDocument(document: SiteDocument): {
  title: string;
  description: string;
  ogImage: string | null;
  googleSiteVerification: string | null;
} {
  const fields = siteSeoFromRecord(document.site.seo);
  const name = professionalDisplayName(document.professional);

  return {
    title: fields.title ?? name,
    description:
      fields.description ?? `Atendimento clínico com ${name}.`,
    ogImage:
      fields.og_image_url ??
      document.professional.photo_url?.trim() ??
      null,
    googleSiteVerification: fields.google_site_verification,
  };
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

export type SeoChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
};

export function buildSeoChecklist(input: {
  seo: Record<string, unknown>;
  document: SiteDocument | null;
  hasVerifiedDomain: boolean;
  isLive: boolean;
}): SeoChecklistItem[] {
  const fields = siteSeoFromRecord(input.seo);
  const posts = input.document?.blog.posts ?? [];
  const postsWithoutExcerpt = posts.filter((post) => !post.excerpt?.trim());
  const postsWithoutCover = posts.filter((post) => !post.cover_image_url);

  return [
    {
      id: "title",
      label: "Título SEO da home",
      ok: Boolean(fields.title),
      hint: fields.title
        ? undefined
        : "Sem título customizado, o Google usa o nome do profissional.",
    },
    {
      id: "description",
      label: "Descrição SEO da home",
      ok: Boolean(fields.description),
      hint: fields.description
        ? undefined
        : "Adicione uma frase clara sobre o atendimento (até 170 caracteres).",
    },
    {
      id: "og",
      label: "Imagem de compartilhamento",
      ok: Boolean(fields.og_image_url || input.document?.professional.photo_url),
      hint: "Usada no WhatsApp e redes. Sem ela, cai na foto do perfil.",
    },
    {
      id: "live",
      label: "Site publicado",
      ok: input.isLive,
      hint: input.isLive
        ? undefined
        : "SEO público só vale depois que a equipe publica o snapshot.",
    },
    {
      id: "domain",
      label: "Domínio personalizado verificado",
      ok: input.hasVerifiedDomain,
      hint: input.hasVerifiedDomain
        ? undefined
        : "Sem domínio próprio, o canonical usa a URL da plataforma.",
    },
    {
      id: "posts-excerpt",
      label: "Posts com resumo",
      ok: posts.length === 0 || postsWithoutExcerpt.length === 0,
      hint:
        postsWithoutExcerpt.length > 0
          ? `${postsWithoutExcerpt.length} post(s) sem resumo.`
          : undefined,
    },
    {
      id: "posts-cover",
      label: "Posts com capa",
      ok: posts.length === 0 || postsWithoutCover.length === 0,
      hint:
        postsWithoutCover.length > 0
          ? `${postsWithoutCover.length} post(s) sem imagem de capa.`
          : undefined,
    },
  ];
}

function stringOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
