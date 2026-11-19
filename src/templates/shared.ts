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
