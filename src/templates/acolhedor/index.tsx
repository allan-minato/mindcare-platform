import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { renderAcolhedorSection } from "@/templates/acolhedor/sections";
import { AcolhedorShell } from "@/templates/acolhedor/shell";

type AcolhedorTemplateProps = {
  document: SiteDocument;
  banner?: ReactNode;
};

export function AcolhedorTemplate({
  document,
  banner,
}: AcolhedorTemplateProps) {
  const home =
    document.pages.find((page) => page.path === "/") ?? document.pages[0];
  const sections = home?.sections ?? [];

  return (
    <AcolhedorShell document={document} banner={banner}>
      {sections.map((section) =>
        renderAcolhedorSection(section, document),
      )}
    </AcolhedorShell>
  );
}
