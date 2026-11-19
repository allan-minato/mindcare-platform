import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { renderPremiumSection } from "@/templates/premium/sections";
import { PremiumShell } from "@/templates/premium/shell";
import { homeSections, ScrollReveal } from "@/templates/shared";

type PremiumTemplateProps = {
  document: SiteDocument;
  banner?: ReactNode;
};

export function PremiumTemplate({ document, banner }: PremiumTemplateProps) {
  const sections = homeSections(document);

  return (
    <PremiumShell document={document} banner={banner}>
      {sections.map((section, index) => {
        const node = renderPremiumSection(section, document);
        const isHero = section.module === "hero";
        return (
          <ScrollReveal
            key={section.key}
            immediate={isHero}
            delayMs={isHero ? 0 : Math.min(index * 40, 160)}
          >
            {node}
          </ScrollReveal>
        );
      })}
    </PremiumShell>
  );
}
