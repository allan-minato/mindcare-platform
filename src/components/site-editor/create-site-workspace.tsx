"use client";

import { useMemo, useState, type ReactNode } from "react";

import { buildCreatePreviewDocument } from "@/components/site-editor/build-live-document";
import { LiveSitePreview } from "@/components/site-editor/live-site-preview";
import type { EligibleProfessional, SiteTemplateOption } from "@/lib/sites/schema";
import {
  isTemplateKey,
  type TemplateKey,
} from "@/lib/templates/registry";

type CreateSiteWorkspaceProps = {
  professionals: EligibleProfessional[];
  templates: SiteTemplateOption[];
  professionalId: string;
  templateKey: string;
  slug: string;
  header?: ReactNode;
  children: ReactNode;
};

export function CreateSiteWorkspace({
  professionals,
  templates,
  professionalId,
  templateKey,
  slug,
  header,
  children,
}: CreateSiteWorkspaceProps) {
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  const professional = useMemo(
    () =>
      professionals.find((item) => item.id === professionalId) ??
      professionals[0],
    [professionalId, professionals],
  );

  const resolvedTemplate: TemplateKey = isTemplateKey(templateKey)
    ? templateKey
    : templates[0]?.key && isTemplateKey(templates[0].key)
      ? templates[0].key
      : "acolhedor";

  const previewDocument = useMemo(() => {
    if (!professional) {
      return null;
    }
    return buildCreatePreviewDocument({
      templateKey: resolvedTemplate,
      slug,
      professional: {
        full_name: professional.full_name,
        professional_name: professional.professional_name,
      },
    });
  }, [professional, resolvedTemplate, slug]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-[#e4ddd2] px-6 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("form")}
          className="rounded-md px-3 py-1.5 text-sm font-semibold"
          style={
            mobileTab === "form"
              ? { background: "#141210", color: "#fffcf8" }
              : { background: "transparent", color: "#5c564e" }
          }
        >
          Formulário
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className="rounded-md px-3 py-1.5 text-sm font-semibold"
          style={
            mobileTab === "preview"
              ? { background: "#141210", color: "#fffcf8" }
              : { background: "transparent", color: "#5c564e" }
          }
        >
          Prévia
        </button>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(22rem,28rem)_minmax(0,1fr)] xl:grid-cols-[minmax(24rem,32rem)_minmax(0,1fr)]">
        <div
          className={`min-h-0 overflow-y-auto px-6 pb-6 pt-4 lg:pt-5 ${
            mobileTab === "form" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
            {header}
            {children}
          </div>
        </div>

        <div
          className={`min-h-[70vh] border-t border-[#e4ddd2] bg-[#f3efe8] px-3 pb-2 pt-1 lg:sticky lg:top-0 lg:h-[100dvh] lg:max-h-[100dvh] lg:border-t-0 lg:border-l ${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          {previewDocument ? (
            <LiveSitePreview
              document={previewDocument}
              badge="Prévia do template"
              className="h-full"
            />
          ) : (
            <p className="text-sm text-zinc-500">
              Selecione um profissional para ver a prévia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
