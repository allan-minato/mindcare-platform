"use client";

import { useActionState, useState, type ReactNode } from "react";

import { ImageUploadField } from "@/app/(admin)/admin/media/image-upload-field";
import {
  type ProfessionalActionState,
} from "@/app/(admin)/admin/professionals/actions";
import {
  type Professional,
  professionalStatuses,
  professionalStatusLabel,
} from "@/lib/professionals/schema";

type ProfessionalFormProps = {
  professional?: Professional;
  readOnly?: boolean;
  action: (
    state: ProfessionalActionState,
    formData: FormData,
  ) => Promise<ProfessionalActionState>;
};

const initialState: ProfessionalActionState = {};

export function ProfessionalForm({
  professional,
  readOnly = false,
  action,
}: ProfessionalFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [photoUrl, setPhotoUrl] = useState(professional?.photo_url ?? "");

  const educationText = (professional?.education ?? []).join("\n");
  const office = professional?.office_address ?? {};
  const social = professional?.social_links ?? {};
  const modes = new Set(professional?.attendance_modes ?? []);

  return (
    <form action={formAction} className="grid gap-8">
      {state.error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <Section title="Identidade">
        <Field
          label="Nome completo"
          name="full_name"
          required
          defaultValue={professional?.full_name ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.full_name?.[0]}
        />
        <Field
          label="Nome profissional"
          name="professional_name"
          defaultValue={professional?.professional_name ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.professional_name?.[0]}
        />
        <div className="grid gap-1.5">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={professional?.status ?? "active"}
            disabled={readOnly}
            className={inputClass}
          >
            {professionalStatuses.map((status) => (
              <option key={status} value={status}>
                {professionalStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Registro">
        <div className="grid gap-1.5">
          <label htmlFor="council" className="text-sm font-medium">
            Conselho
          </label>
          <select
            id="council"
            name="council"
            defaultValue={professional?.council ?? ""}
            disabled={readOnly}
            className={inputClass}
          >
            <option value="">Sem registro</option>
            <option value="crp">CRP</option>
            <option value="crm">CRM</option>
          </select>
        </div>
        <Field
          label="Número de registro"
          name="registration_number"
          defaultValue={professional?.registration_number ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.registration_number?.[0]}
        />
        <Field
          label="RQE"
          name="specialty_registration"
          defaultValue={professional?.specialty_registration ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.specialty_registration?.[0]}
        />
        <Field
          label="Especialidade"
          name="specialty"
          defaultValue={professional?.specialty ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.specialty?.[0]}
        />
      </Section>

      <Section title="Contato">
        <Field
          label="Telefone"
          name="phone"
          defaultValue={professional?.phone ?? ""}
          readOnly={readOnly}
          hint="Somente dígitos, com DDI e DDD."
          error={state.fieldErrors?.phone?.[0]}
        />
        <Field
          label="WhatsApp"
          name="whatsapp"
          defaultValue={professional?.whatsapp ?? ""}
          readOnly={readOnly}
          hint="Somente dígitos, com DDI e DDD."
          error={state.fieldErrors?.whatsapp?.[0]}
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          defaultValue={professional?.email ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.email?.[0]}
        />
        {professional?.id && !readOnly ? (
          <div className="grid gap-2">
            <ImageUploadField
              label="Foto"
              value={photoUrl}
              target={{ kind: "professional", professionalId: professional.id }}
              onChange={setPhotoUrl}
            />
            <input type="hidden" name="photo_url" value={photoUrl} />
            {state.fieldErrors?.photo_url?.[0] ? (
              <p className="text-sm text-red-700 dark:text-red-400">
                {state.fieldErrors.photo_url[0]}
              </p>
            ) : null}
          </div>
        ) : (
          <Field
            label="URL da foto"
            name="photo_url"
            defaultValue={professional?.photo_url ?? ""}
            readOnly={readOnly}
            hint={
              professional?.id
                ? "Começa com https://"
                : "Salve o profissional para enviar arquivo; ou cole uma URL https://"
            }
            error={state.fieldErrors?.photo_url?.[0]}
          />
        )}
      </Section>

      <Section title="Conteúdo público">
        <div className="grid gap-1.5">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={professional?.bio ?? ""}
            readOnly={readOnly}
            className={inputClass}
          />
          {state.fieldErrors?.bio?.[0] ? (
            <p className="text-sm text-red-700 dark:text-red-400">
              {state.fieldErrors.bio[0]}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="education" className="text-sm font-medium">
            Formação
          </label>
          <textarea
            id="education"
            name="education"
            rows={4}
            defaultValue={educationText}
            readOnly={readOnly}
            className={inputClass}
            placeholder="Uma formação por linha"
          />
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Modalidades</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="attendance_modes"
              value="in_person"
              defaultChecked={modes.has("in_person")}
              disabled={readOnly}
            />
            Presencial
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="attendance_modes"
              value="online"
              defaultChecked={modes.has("online")}
              disabled={readOnly}
            />
            Online
          </label>
        </fieldset>
      </Section>

      <Section title="Endereço do consultório">
        <Field
          label="Rua"
          name="street"
          defaultValue={office.street ?? ""}
          readOnly={readOnly}
        />
        <Field
          label="Cidade"
          name="city"
          defaultValue={office.city ?? ""}
          readOnly={readOnly}
        />
        <Field
          label="Estado"
          name="state"
          defaultValue={office.state ?? ""}
          readOnly={readOnly}
        />
        <Field
          label="CEP"
          name="cep"
          defaultValue={office.cep ?? ""}
          readOnly={readOnly}
        />
      </Section>

      <Section title="Redes">
        <Field
          label="Instagram"
          name="instagram"
          defaultValue={social.instagram ?? ""}
          readOnly={readOnly}
        />
        <Field
          label="LinkedIn"
          name="linkedin"
          defaultValue={social.linkedin ?? ""}
          readOnly={readOnly}
        />
        <Field
          label="Site"
          name="website"
          defaultValue={social.website ?? ""}
          readOnly={readOnly}
        />
      </Section>

      <Section title="Uso interno da equipe">
        <div className="grid gap-1.5">
          <label htmlFor="internal_notes" className="text-sm font-medium">
            Nota interna
          </label>
          <textarea
            id="internal_notes"
            name="internal_notes"
            rows={4}
            defaultValue={professional?.internal_notes ?? ""}
            readOnly={readOnly}
            className={inputClass}
          />
          <p className="text-sm text-zinc-500">
            Nunca entra no site publicado.
          </p>
          {state.fieldErrors?.internal_notes?.[0] ? (
            <p className="text-sm text-red-700 dark:text-red-400">
              {state.fieldErrors.internal_notes[0]}
            </p>
          ) : null}
        </div>
      </Section>

      {!readOnly ? (
        <button
          type="submit"
          disabled={pending}
          className="justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
      ) : null}
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  readOnly,
  required,
  type = "text",
  hint,
  error,
}: {
  label: string;
  name: string;
  defaultValue: string;
  readOnly?: boolean;
  required?: boolean;
  type?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={inputClass}
      />
      {hint ? <p className="text-sm text-zinc-500">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 read-only:opacity-70 dark:border-zinc-700";
