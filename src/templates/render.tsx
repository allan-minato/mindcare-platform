import type { ReactNode } from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { AcolhedorTemplate } from "@/templates/acolhedor/index";
import { MinimalistaTemplate } from "@/templates/minimalista/index";
import { PremiumTemplate } from "@/templates/premium/index";
import { PREVIEW_BANNER_CLASS } from "@/templates/shared";

type TemplateRendererProps = {
  document: SiteDocument;
  mode?: "preview" | "public";
  banner?: ReactNode;
};

function PreviewBanner() {
  return <div className={PREVIEW_BANNER_CLASS}>Prévia · não indexada</div>;
}

export function TemplateRenderer({
  document,
  mode = "public",
  banner,
}: TemplateRendererProps) {
  const previewBanner =
    banner ?? (mode === "preview" ? <PreviewBanner /> : null);

  switch (document.site.template.key) {
    case "minimalista":
      return (
        <MinimalistaTemplate document={document} banner={previewBanner} />
      );
    case "premium":
      return <PremiumTemplate document={document} banner={previewBanner} />;
    case "acolhedor":
    default:
      return <AcolhedorTemplate document={document} banner={previewBanner} />;
  }
}
