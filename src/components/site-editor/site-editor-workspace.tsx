"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  buildLiveDocument,
  type LiveEditorSection,
} from "@/components/site-editor/build-live-document";
import { LiveSitePreview } from "@/components/site-editor/live-site-preview";
import type { SiteDocument } from "@/lib/sites/document";

type MobileTab = "edit" | "preview";

type SiteEditorWorkspaceProps = {
  baseDocument: SiteDocument;
  sections: LiveEditorSection[];
  fullPreviewHref?: string;
  focusSectionKey?: string | null;
  header?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
};

export function SiteEditorWorkspace({
  baseDocument,
  sections,
  fullPreviewHref,
  focusSectionKey,
  header,
  aside,
  children,
}: SiteEditorWorkspaceProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("edit");
  const liveDocument = useMemo(
    () => buildLiveDocument(baseDocument, sections),
    [baseDocument, sections],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-2 lg:hidden dark:border-zinc-800">
        <TabButton
          active={mobileTab === "edit"}
          onClick={() => setMobileTab("edit")}
        >
          Editar
        </TabButton>
        <TabButton
          active={mobileTab === "preview"}
          onClick={() => setMobileTab("preview")}
        >
          Prévia
        </TabButton>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(22rem,28rem)_minmax(0,1fr)] xl:grid-cols-[minmax(24rem,32rem)_minmax(0,1fr)]">
        <div
          className={`min-h-0 overflow-y-auto px-6 pb-6 pt-4 lg:pt-5 ${
            mobileTab === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
            {header}
            {aside}
            {children}
          </div>
        </div>

        <div
          className={`min-h-[70vh] border-t border-zinc-200 bg-zinc-50 px-3 pb-2 pt-1 lg:sticky lg:top-0 lg:h-[100dvh] lg:max-h-[100dvh] lg:border-t-0 lg:border-l dark:border-zinc-800 dark:bg-zinc-900/40 ${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <LiveSitePreview
            document={liveDocument}
            fullPreviewHref={fullPreviewHref}
            focusSectionKey={focusSectionKey}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}
