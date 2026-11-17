import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { renderAcolhedorSection } from "@/templates/acolhedor/sections";
import { AcolhedorShell } from "@/templates/acolhedor/shell";
import { homeSections } from "@/templates/shared";

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
      {sections.map((section) =>
        renderAcolhedorSection(section, document),
      )}
    </AcolhedorShell>
  );
}
