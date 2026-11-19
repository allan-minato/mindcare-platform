import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { renderAcolhedorSection } from "@/templates/acolhedor/sections";
import { AcolhedorShell } from "@/templates/acolhedor/shell";
import { homeSections, ScrollReveal } from "@/templates/shared";

type AcolhedorTemplateProps = {
  document: SiteDocument;
  banner?: ReactNode;
};

export function AcolhedorTemplate({
  document,
  banner,
}: AcolhedorTemplateProps) {
  const sections = homeSections(document);

  return (
    <AcolhedorShell document={document} banner={banner}>
      {sections.map((section, index) => {
        const node = renderAcolhedorSection(section, document);
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
    </AcolhedorShell>
  );
}
