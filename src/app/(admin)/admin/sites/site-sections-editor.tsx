"use client";

import { useActionState, useState, type ReactNode } from "react";

import {
  updateSiteSections,
  type SectionsActionState,
} from "@/app/(admin)/admin/sites/actions";
import { SectionFields } from "@/app/(admin)/admin/sites/section-fields";
import { SiteEditorWorkspace } from "@/components/site-editor/site-editor-workspace";
import type { LiveEditorSection } from "@/components/site-editor/build-live-document";
import type { SiteDocument } from "@/lib/sites/document";
import type { SiteSection } from "@/lib/sites/schema";
import { moduleLabel } from "@/modules/registry";

type SiteSectionsEditorProps = {
  siteId: string;
  sections: SiteSection[];
  baseDocument: SiteDocument;
  fullPreviewHref?: string;
  header?: ReactNode;
  aside?: ReactNode;
};

const initialState: SectionsActionState = {};

export function SiteSectionsEditor({
  siteId,
  sections: initialSections,
  baseDocument,
  fullPreviewHref,
  header,
  aside,
}: SiteSectionsEditorProps) {
  const action = updateSiteSections.bind(null, siteId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [sections, setSections] = useState<LiveEditorSection[]>(
    initialSections.map((section) => ({
      id: section.id,
      module_key: section.module_key,
      section_key: section.section_key,
      is_visible: section.is_visible,
      content: section.content,
      settings: section.settings,
    })),
  );
  const [focusSectionKey, setFocusSectionKey] = useState<string | null>(null);

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) {
      return;
    }
    setSections((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  return (
    <SiteEditorWorkspace
      baseDocument={baseDocument}
      sections={sections}
      fullPreviewHref={fullPreviewHref}
      focusSectionKey={focusSectionKey}
      header={header}
      aside={aside}
    >
      <form action={formAction} className="grid gap-6">
        <input
          type="hidden"
          name="sections"
          value={JSON.stringify(
            sections.map((section) => ({
              id: section.id,
              is_visible: section.is_visible,
              content: cleanContent(section.content),
              settings: section.settings,
            })),
          )}
        />

        {state.error ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {state.error}
          </p>
        ) : null}

        <div className="grid gap-1">
          <h2 className="text-lg font-medium">Seções</h2>
          <p className="text-sm text-zinc-500">
            Edite à esquerda e veja a prévia ao vivo à direita.
          </p>
        </div>

        <div className="grid gap-4">
          {sections.map((section, index) => (
            <section
              key={section.id}
              className="grid gap-4 rounded-lg border border-transparent border-t-zinc-200 pt-6 focus-within:border-zinc-300 focus-within:bg-zinc-50/70 focus-within:p-4 focus-within:pt-4 dark:border-t-zinc-800 dark:focus-within:border-zinc-700 dark:focus-within:bg-zinc-900/40"
              onFocusCapture={() => setFocusSectionKey(section.section_key)}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                  <h3 className="font-medium">
                    {moduleLabel(section.module_key)}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {section.section_key} · {section.module_key}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={section.is_visible}
                      onChange={(event) => {
                        const visible = event.target.checked;
                        setSections((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, is_visible: visible }
                              : item,
                          ),
                        );
                      }}
                    />
                    Visível
                  </label>
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm disabled:opacity-40 dark:border-zinc-700"
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm disabled:opacity-40 dark:border-zinc-700"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                  >
                    Descer
                  </button>
                </div>
              </div>

              <SectionFields
                siteId={siteId}
                moduleKey={section.module_key}
                content={section.content}
                settings={section.settings}
                onContentChange={(content) => {
                  setSections((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, content } : item,
                    ),
                  );
                }}
                onSettingsChange={(settings) => {
                  setSections((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, settings } : item,
                    ),
                  );
                }}
              />
            </section>
          ))}
        </div>

        <button
          type="submit"
          disabled={pending || sections.length === 0}
          className="sticky bottom-4 justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </SiteEditorWorkspace>
  );
}

function cleanContent(content: Record<string, unknown>) {
  const next: Record<string, unknown> = { ...content };
  for (const [key, value] of Object.entries(next)) {
    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "string")
    ) {
      next[key] = value
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }
  return next;
}
