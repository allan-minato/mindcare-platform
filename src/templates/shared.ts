import type { ReactNode } from "react";

import {
  professionalDisplayName,
  whatsappHref,
  type SiteDocument,
  type SiteDocumentProfessional,
  type SiteDocumentSection,
} from "@/lib/sites/document";
import type { ModuleKey } from "@/modules/registry";

export type TemplateShellProps = {
  document: SiteDocument;
  banner?: ReactNode;
  /** Prefixo de rotas internas (ex.: `/preview/{siteId}`). */
  basePath?: string;
  children: ReactNode;
};

/**
 * Resolve caminhos internos do site. Com `basePath` (prévia), `/blog` vira
 * `/preview/{id}/blog` sem quebrar âncoras `#seção`.
 */
export function siteHref(path: string, basePath = ""): string {
  const base = basePath.replace(/\/$/, "");
  if (!base) {
    return path;
  }
  if (path.startsWith("#")) {
    return path;
  }
  if (path === "/") {
    return base;
  }
  if (path.startsWith("/#")) {
    return `${base}${path.slice(1)}`;
  }
  if (path.startsWith("/")) {
    return `${base}${path}`;
  }
  return path;
}

export type TemplateSectionProps = {
  section: SiteDocumentSection;
  document: SiteDocument;
};

export type SiteNavItem = {
  href: string;
  label: string;
};

/**
 * Nav principal enxuta: só âncoras de alto nível.
 * Ordem fixa; o item só aparece se a seção correspondente estiver preenchida.
 */
const PRIMARY_NAV: { module: ModuleKey; label: string }[] = [
  { module: "about", label: "Sobre" },
  { module: "services", label: "Serviços" },
  { module: "faq", label: "FAQ" },
  { module: "contact", label: "Contato" },
];

export function homeSections(document: SiteDocument): SiteDocumentSection[] {
  const home =
    document.pages.find((page) => page.path === "/") ?? document.pages[0];
  return home?.sections ?? [];
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasFilledItems(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

/** Conteúdo suficiente para a seção aparecer na navegação. */
export function sectionHasNavContent(section: SiteDocumentSection): boolean {
  const content = section.content ?? {};

  switch (section.module) {
    case "about":
      return hasText(content.title) || hasText(content.body);
    case "approach":
      return hasFilledItems(content.pillars);
    case "services":
      return hasFilledItems(content.items);
    case "specialties":
      return hasFilledItems(content.items);
    case "how_it_works":
      return hasFilledItems(content.steps);
    case "location":
      return (
        hasText(content.title) ||
        hasText(content.body) ||
        hasFilledItems(content.modes)
      );
    case "audience":
      return hasText(content.title) || hasText(content.body);
    case "contact":
      return (
        hasText(content.title) ||
        hasText(content.city) ||
        hasText(content.note)
      );
    case "education":
      return hasFilledItems(content.items);
    case "faq":
      return hasFilledItems(content.items);
    default:
      return false;
  }
}

/** Links da nav principal (preenchidas + ordem curada). */
export function siteNavItems(
  document: SiteDocument,
  basePath = "",
): SiteNavItem[] {
  const sections = homeSections(document);

  const items = PRIMARY_NAV.flatMap(({ module, label }) => {
    const section = sections.find(
      (item) => item.module === module && sectionHasNavContent(item),
    );
    if (!section) {
      return [];
    }
    return [{ href: `#${section.key}`, label }];
  });

  if (document.blog.enabled && document.blog.posts.length > 0) {
    const blogItem: SiteNavItem = {
      href: siteHref("/blog", basePath),
      label: "Blog",
    };
    const contactIndex = items.findIndex((item) => item.label === "Contato");
    if (contactIndex >= 0) {
      items.splice(contactIndex, 0, blogItem);
    } else {
      items.push(blogItem);
    }
  }

  return items;
}

export function formatCouncil(
  professional: SiteDocumentProfessional,
): string | null {
  const council = professional.council?.toUpperCase();
  const registration = professional.registration_number?.trim();
  if (!council || !registration) {
    return null;
  }
  return `${council} ${registration}`;
}

/** Nav do footer: Início + seções + Blog, com hrefs que funcionam fora da home. */
export function footerNavItems(
  document: SiteDocument,
  basePath = "",
): SiteNavItem[] {
  const sections = homeSections(document);
  const items: SiteNavItem[] = [
    { href: siteHref("/", basePath), label: "Início" },
  ];

  for (const { module, label } of PRIMARY_NAV) {
    const section = sections.find(
      (item) => item.module === module && sectionHasNavContent(item),
    );
    if (!section) {
      continue;
    }
    items.push({
      href: siteHref(`/#${section.key}`, basePath),
      label,
    });
  }

  if (document.blog.enabled && document.blog.posts.length > 0) {
    const contactIndex = items.findIndex((item) => item.label === "Contato");
    const blogItem: SiteNavItem = {
      href: siteHref("/blog", basePath),
      label: "Blog",
    };
    if (contactIndex >= 0) {
      items.splice(contactIndex, 0, blogItem);
    } else {
      items.push(blogItem);
    }
  }

  return items;
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string" && entry.trim()) {
      result[key] = entry.trim();
    }
  }
  return result;
}

export function instagramHandle(
  social: unknown,
): string | null {
  const value = asStringRecord(social).instagram;
  return value || null;
}

export function instagramHref(social: unknown): string | null {
  const handle = instagramHandle(social);
  if (!handle) {
    return null;
  }
  const clean = handle.replace(/^@/, "");
  return `https://instagram.com/${clean}`;
}

export function instagramLabel(social: unknown): string | null {
  const handle = instagramHandle(social);
  if (!handle) {
    return null;
  }
  return handle.startsWith("@") ? handle : `@${handle}`;
}

export function officeLocationLabel(
  professional: SiteDocumentProfessional,
): string | null {
  const office = asStringRecord(professional.office_address);
  const city = office.city;
  const state = office.state;
  if (city && state) {
    return `${city}/${state}`;
  }
  return city || state || null;
}

export function attendanceSummary(
  professional: SiteDocumentProfessional,
): string | null {
  const location = officeLocationLabel(professional);
  const modes = new Set(professional.attendance_modes ?? []);
  const parts: string[] = [];

  if (modes.has("in_person") && location) {
    parts.push(location);
  } else if (modes.has("in_person")) {
    parts.push("Presencial");
  }

  if (modes.has("online")) {
    parts.push("Online");
  }

  if (parts.length === 0) {
    return location;
  }
  return parts.join(" · ");
}

/** Formata WhatsApp/telefone para exibição: (48) 99121-8576 */
export function formatPhoneDisplay(
  phone: string | null | undefined,
): string | null {
  if (!phone?.trim()) {
    return null;
  }
  const digits = phone.replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("55") && national.length >= 12) {
    national = national.slice(2);
  }
  if (national.length === 11) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 7)}-${national.slice(7)}`;
  }
  if (national.length === 10) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 6)}-${national.slice(6)}`;
  }
  return phone.trim();
}

/** Texto curto de marca no footer (estilo Kalil). */
export function footerBrandBlurb(
  professional: SiteDocumentProfessional,
): string {
  const specialty =
    professional.specialty?.trim() || "Psicólogo clínico";
  const council = formatCouncil(professional);
  const modes = new Set(professional.attendance_modes ?? []);
  const location = officeLocationLabel(professional);
  const attendanceParts: string[] = [];

  if (modes.has("in_person")) {
    attendanceParts.push(
      location
        ? `presencial em ${location}`
        : "presencial",
    );
  }
  if (modes.has("online")) {
    attendanceParts.push("online");
  }

  const head = council
    ? `${specialty} (${council}).`
    : `${specialty}.`;
  if (attendanceParts.length === 0) {
    return `${head} Psicoterapia individual com escuta atenta e método.`;
  }
  const joined =
    attendanceParts.length === 1
      ? attendanceParts[0]
      : `${attendanceParts[0]} e ${attendanceParts[1]}`;
  return `${head} Atendimento ${joined}.`;
}

export function heroDefaults(document: SiteDocument, headline: string, support: string) {
  const name = professionalDisplayName(document.professional);
  return {
    name,
    whatsapp: whatsappHref(document.professional.whatsapp),
    headline: headline.trim() || name,
    support:
      support.trim() ||
      "Acompanhamento psicológico com escuta atenta e presença.",
    photoUrl: document.professional.photo_url?.trim() || "",
  };
}

export function attendanceModeLabel(mode: string): string {
  return mode === "in_person" ? "Presencial" : "Online";
}

export const PREVIEW_BANNER_CLASS = "site-preview-banner";

export const previewBannerCss = `
.${PREVIEW_BANNER_CLASS} {
  background: #111827;
  color: #f3f4f6;
  text-align: center;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  padding: 0.55rem 1rem;
}
`;

export { professionalDisplayName, whatsappHref };
export { ScrollReveal, scrollRevealCss } from "@/templates/scroll-reveal";
