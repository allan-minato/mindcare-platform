"use client";

import { ImageUploadField } from "@/app/(admin)/admin/media/image-upload-field";
import type { ModuleKey } from "@/modules/registry";

type SectionFieldsProps = {
  siteId: string;
  moduleKey: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  onContentChange: (content: Record<string, unknown>) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
};

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700";

export function SectionFields({
  siteId,
  moduleKey,
  content,
  settings,
  onContentChange,
  onSettingsChange,
}: SectionFieldsProps) {
  const key = moduleKey as ModuleKey;

  switch (key) {
    case "hero":
      return (
        <div className="grid gap-3">
          <TextField
            label="Headline"
            value={stringValue(content.headline)}
            onChange={(headline) => onContentChange({ ...content, headline })}
          />
          <TextAreaField
            label="Apoio"
            value={stringValue(content.support)}
            onChange={(support) => onContentChange({ ...content, support })}
          />
          <StringListField
            label="Selos"
            values={stringArray(content.badges)}
            onChange={(badges) => onContentChange({ ...content, badges })}
          />
          <ImageUploadField
            label="Imagem"
            value={stringValue(content.image_url)}
            target={{ kind: "site", siteId }}
            onChange={(image_url) =>
              onContentChange({ ...content, image_url })
            }
          />
        </div>
      );
    case "recognition":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <ObjectListField
            label="Itens"
            items={objectArray(content.items)}
            fields={[
              { key: "title", label: "Título" },
              { key: "detail", label: "Detalhe" },
            ]}
            emptyItem={{ title: "", detail: "" }}
            onChange={(items) => onContentChange({ ...content, items })}
          />
        </div>
      );
    case "about":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <TextAreaField
            label="Texto"
            value={stringValue(content.body)}
            onChange={(body) => onContentChange({ ...content, body })}
          />
          <TextField
            label="Credencial"
            value={stringValue(content.credential)}
            onChange={(credential) =>
              onContentChange({ ...content, credential })
            }
          />
          <ImageUploadField
            label="Imagem"
            value={stringValue(content.image_url)}
            target={{ kind: "site", siteId }}
            onChange={(image_url) =>
              onContentChange({ ...content, image_url })
            }
          />
        </div>
      );
    case "approach":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <ObjectListField
            label="Pilares"
            items={objectArray(content.pillars)}
            fields={[
              { key: "title", label: "Título" },
              { key: "body", label: "Texto", multiline: true },
            ]}
            emptyItem={{ title: "", body: "" }}
            onChange={(pillars) => onContentChange({ ...content, pillars })}
          />
        </div>
      );
    case "services":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <ObjectListField
            label="Itens"
            items={objectArray(content.items)}
            fields={[
              { key: "title", label: "Título" },
              { key: "body", label: "Texto", multiline: true },
            ]}
            emptyItem={{ title: "", body: "" }}
            onChange={(items) => onContentChange({ ...content, items })}
          />
        </div>
      );
    case "specialties":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <StringListField
            label="Especialidades"
            values={stringArray(content.items)}
            onChange={(items) => onContentChange({ ...content, items })}
          />
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Exibição</label>
            <select
              className={inputClass}
              value={stringValue(settings.display) || "tags"}
              onChange={(event) =>
                onSettingsChange({ ...settings, display: event.target.value })
              }
            >
              <option value="tags">Etiquetas</option>
              <option value="cards">Cards</option>
            </select>
          </div>
        </div>
      );
    case "how_it_works":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <ObjectListField
            label="Etapas"
            items={objectArray(content.steps)}
            fields={[
              { key: "title", label: "Título" },
              { key: "body", label: "Texto", multiline: true },
            ]}
            emptyItem={{ title: "", body: "" }}
            onChange={(steps) => onContentChange({ ...content, steps })}
          />
        </div>
      );
    case "location":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <TextAreaField
            label="Texto"
            value={stringValue(content.body)}
            onChange={(body) => onContentChange({ ...content, body })}
          />
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Modalidades</legend>
            {(["in_person", "online"] as const).map((mode) => {
              const modes = stringArray(content.modes);
              const checked = modes.includes(mode);
              return (
                <label key={mode} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...modes, mode]
                        : modes.filter((item) => item !== mode);
                      onContentChange({ ...content, modes: next });
                    }}
                  />
                  {mode === "in_person" ? "Presencial" : "Online"}
                </label>
              );
            })}
          </fieldset>
        </div>
      );
    case "audience":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <TextAreaField
            label="Texto"
            value={stringValue(content.body)}
            onChange={(body) => onContentChange({ ...content, body })}
          />
        </div>
      );
    case "contact":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <TextField
            label="Cidade"
            value={stringValue(content.city)}
            onChange={(city) => onContentChange({ ...content, city })}
          />
          <TextAreaField
            label="Nota"
            value={stringValue(content.note)}
            onChange={(note) => onContentChange({ ...content, note })}
          />
        </div>
      );
    case "education":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <StringListField
            label="Formações"
            values={stringArray(content.items)}
            onChange={(items) => onContentChange({ ...content, items })}
          />
        </div>
      );
    case "faq":
      return (
        <div className="grid gap-3">
          <TextField
            label="Título"
            value={stringValue(content.title)}
            onChange={(title) => onContentChange({ ...content, title })}
          />
          <ObjectListField
            label="Perguntas"
            items={objectArray(content.items)}
            fields={[
              { key: "question", label: "Pergunta" },
              { key: "answer", label: "Resposta", multiline: true },
            ]}
            emptyItem={{ question: "", answer: "" }}
            onChange={(items) => onContentChange({ ...content, items })}
          />
        </div>
      );
    default:
      return (
        <p className="text-sm text-zinc-500">
          Módulo sem formulário nesta etapa.
        </p>
      );
  }
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        className={`${inputClass} min-h-24`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function StringListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <button
          type="button"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          onClick={() => onChange([...values, ""])}
        >
          Adicionar
        </button>
      </div>
      {values.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum item.</p>
      ) : (
        values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              className={inputClass}
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className="shrink-0 text-sm text-zinc-500 underline-offset-4 hover:underline"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              Remover
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function ObjectListField({
  label,
  items,
  fields,
  emptyItem,
  onChange,
}: {
  label: string;
  items: Record<string, string>[];
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
  emptyItem: Record<string, string>;
  onChange: (items: Record<string, string>[]) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <button
          type="button"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          onClick={() => onChange([...items, { ...emptyItem }])}
        >
          Adicionar
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum item.</p>
      ) : (
        items.map((item, index) => (
          <div
            key={index}
            className="grid gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800"
          >
            {fields.map((field) =>
              field.multiline ? (
                <TextAreaField
                  key={field.key}
                  label={field.label}
                  value={item[field.key] ?? ""}
                  onChange={(value) => {
                    const next = [...items];
                    next[index] = { ...next[index], [field.key]: value };
                    onChange(next);
                  }}
                />
              ) : (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={item[field.key] ?? ""}
                  onChange={(value) => {
                    const next = [...items];
                    next[index] = { ...next[index], [field.key]: value };
                    onChange(next);
                  }}
                />
              ),
            )}
            <button
              type="button"
              className="justify-self-start text-sm text-zinc-500 underline-offset-4 hover:underline"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remover item
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function objectArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => {
      const result: Record<string, string> = {};
      for (const [key, entry] of Object.entries(item)) {
        result[key] = typeof entry === "string" ? entry : "";
      }
      return result;
    });
}
