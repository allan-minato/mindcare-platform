import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { renderMinimalistaSection } from "@/templates/minimalista/sections";
import { MinimalistaShell } from "@/templates/minimalista/shell";
import { homeSections } from "@/templates/shared";

type MinimalistaTemplateProps = {
  document: SiteDocument;
  banner?: ReactNode;
};

export function MinimalistaTemplate({
  document,
  banner,
}: MinimalistaTemplateProps) {
  const sections = homeSections(document);

  return (
    <MinimalistaShell document={document} banner={banner}>
      {sections.map((section) =>
        renderMinimalistaSection(section, document),
      )}
    </MinimalistaShell>
  );
}
