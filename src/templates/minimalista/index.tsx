import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { renderMinimalistaSection } from "@/templates/minimalista/sections";
import { MinimalistaShell } from "@/templates/minimalista/shell";
import { homeSections, ScrollReveal } from "@/templates/shared";

type MinimalistaTemplateProps = {
  document: SiteDocument;
  banner?: ReactNode;
  basePath?: string;
};

export function MinimalistaTemplate({
  document,
  banner,
  basePath = "",
}: MinimalistaTemplateProps) {
  const sections = homeSections(document);

  return (
    <MinimalistaShell document={document} banner={banner} basePath={basePath}>
      {sections.map((section, index) => {
        const node = renderMinimalistaSection(section, document);
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
    </MinimalistaShell>
  );
}
