import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { renderPremiumSection } from "@/templates/premium/sections";
import { PremiumShell } from "@/templates/premium/shell";
import { homeSections } from "@/templates/shared";

type PremiumTemplateProps = {
  document: SiteDocument;
  banner?: ReactNode;
};

export function PremiumTemplate({ document, banner }: PremiumTemplateProps) {
  const sections = homeSections(document);

  return (
    <PremiumShell document={document} banner={banner}>
      {sections.map((section) => renderPremiumSection(section, document))}
    </PremiumShell>
  );
}
