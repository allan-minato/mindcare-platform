"use client";

import { useActionState, useMemo, useState } from "react";

import { type SiteActionState } from "@/app/(admin)/admin/sites/actions";
import {
  suggestSiteName,
  suggestSlug,
  type EligibleProfessional,
  type SiteTemplateOption,
} from "@/lib/sites/schema";

type SiteFormProps = {
  action: (
    state: SiteActionState,
    formData: FormData,
  ) => Promise<SiteActionState>;
  professionals: EligibleProfessional[];
  templates: SiteTemplateOption[];
  initialProfessionalId?: string;
};

const initialState: SiteActionState = {};

export function SiteForm({
  action,
  professionals,
  templates,
  initialProfessionalId,
}: SiteFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const defaultProfessionalId =
    initialProfessionalId &&
    professionals.some((item) => item.id === initialProfessionalId)
      ? initialProfessionalId
      : (professionals[0]?.id ?? "");

  const initialProfessional = professionals.find(
    (item) => item.id === defaultProfessionalId,
  );

  const [professionalId, setProfessionalId] = useState(defaultProfessionalId);
  const [name, setName] = useState(
    initialProfessional ? suggestSiteName(initialProfessional) : "",
  );
  const [slug, setSlug] = useState(
    initialProfessional
      ? suggestSlug(suggestSiteName(initialProfessional))
      : "",
  );
  const [slugTouched, setSlugTouched] = useState(false);

  const selectedProfessional = useMemo(
    () => professionals.find((item) => item.id === professionalId),
    [professionalId, professionals],
  );

  if (professionals.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Cadastre um profissional ativo ou inativo antes de criar um site.
      </p>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Nenhum template ativo disponível.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-6">
      {state.error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-1.5">
        <label htmlFor="professional_id" className="text-sm font-medium">
          Profissional
        </label>
        <select
          id="professional_id"
          name="professional_id"
          required
          value={professionalId}
          onChange={(event) => {
            const nextId = event.target.value;
            setProfessionalId(nextId);
            const next = professionals.find((item) => item.id === nextId);
            if (!next) {
              return;
            }
            const suggestedName = suggestSiteName(next);
            setName(suggestedName);
            if (!slugTouched) {
              setSlug(suggestSlug(suggestedName));
            }
          }}
          className={inputClass}
        >
          {professionals.map((professional) => (
            <option key={professional.id} value={professional.id}>
              {professional.professional_name?.trim() || professional.full_name}
              {professional.professional_name
                ? ` (${professional.full_name})`
                : ""}
            </option>
          ))}
        </select>
        {state.fieldErrors?.professional_id?.[0] ? (
          <p className="text-sm text-red-700 dark:text-red-400">
            {state.fieldErrors.professional_id[0]}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="template_key" className="text-sm font-medium">
          Template
        </label>
        <select
          id="template_key"
          name="template_key"
          required
          defaultValue={templates[0]?.key}
          className={inputClass}
        >
          {templates.map((template) => (
            <option key={template.key} value={template.key}>
              {template.name}
            </option>
          ))}
        </select>
        {selectedProfessional ? (
          <p className="text-sm text-zinc-500">
            As três chaves geram as mesmas 12 seções padrão nesta etapa.
          </p>
        ) : null}
        {state.fieldErrors?.template_key?.[0] ? (
          <p className="text-sm text-red-700 dark:text-red-400">
            {state.fieldErrors.template_key[0]}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nome do site
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(event) => {
            const nextName = event.target.value;
            setName(nextName);
            if (!slugTouched) {
              setSlug(suggestSlug(nextName));
            }
          }}
          className={inputClass}
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="text-sm text-red-700 dark:text-red-400">
            {state.fieldErrors.name[0]}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value.toLowerCase());
          }}
          className={inputClass}
        />
        <p className="text-sm text-zinc-500">
          Letras minúsculas, números e hífens. Usado no host interno depois.
        </p>
        {state.fieldErrors?.slug?.[0] ? (
          <p className="text-sm text-red-700 dark:text-red-400">
            {state.fieldErrors.slug[0]}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Criando…" : "Criar site"}
      </button>
    </form>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700";
