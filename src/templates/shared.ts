import type { ReactNode } from "react";

import {
  professionalDisplayName,
  whatsappHref,
  type SiteDocument,
  type SiteDocumentProfessional,
  type SiteDocumentSection,
} from "@/lib/sites/document";

export type TemplateShellProps = {
  document: SiteDocument;
  banner?: ReactNode;
  children: ReactNode;
};

export type TemplateSectionProps = {
  section: SiteDocumentSection;
  document: SiteDocument;
};

export function homeSections(document: SiteDocument): SiteDocumentSection[] {
  const home =
    document.pages.find((page) => page.path === "/") ?? document.pages[0];
  return home?.sections ?? [];
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
