"use client";

import { useActionState, useState } from "react";

import {
  updateSiteSections,
  type SectionsActionState,
} from "@/app/(admin)/admin/sites/actions";
import { SectionFields } from "@/app/(admin)/admin/sites/section-fields";
import type { SiteSection } from "@/lib/sites/schema";
import { moduleLabel } from "@/modules/registry";

type EditorSection = {
  id: string;
  module_key: string;
  section_key: string;
  is_visible: boolean;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
};

type SiteSectionsEditorProps = {
  siteId: string;
  sections: SiteSection[];
};

const initialState: SectionsActionState = {};

export function SiteSectionsEditor({
  siteId,
  sections: initialSections,
}: SiteSectionsEditorProps) {
  const action = updateSiteSections.bind(null, siteId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [sections, setSections] = useState<EditorSection[]>(
    initialSections.map((section) => ({
      id: section.id,
      module_key: section.module_key,
      section_key: section.section_key,
      is_visible: section.is_visible,
      content: section.content,
      settings: section.settings,
    })),
  );

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

      <div className="grid gap-4">
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="grid gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
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
        className="justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
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
