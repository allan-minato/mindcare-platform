import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { AcolhedorTemplate } from "@/templates/acolhedor";

type TemplateRendererProps = {
  document: SiteDocument;
  mode?: "preview" | "public";
  banner?: ReactNode;
};

export function TemplateRenderer({
  document,
  mode = "public",
  banner,
}: TemplateRendererProps) {
  const previewBanner =
    banner ??
    (mode === "preview" ? (
      <div className="acolhedor-preview-banner">Prévia · não indexada</div>
    ) : null);

  // Templates B/C compartilham o blueprint nesta etapa; usam o mesmo renderer.
  return <AcolhedorTemplate document={document} banner={previewBanner} />;
}
