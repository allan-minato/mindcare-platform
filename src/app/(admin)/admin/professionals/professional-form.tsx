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
  /** Esconde status e notas internas; envia valores atuais em campos ocultos. */
  portalMode?: boolean;
  /** Visual elevado (cards/inputs do portal), também no admin. */
  studio?: boolean;
  action: (
    state: ProfessionalActionState,
    formData: FormData,
  ) => Promise<ProfessionalActionState>;
};

const initialState: ProfessionalActionState = {};

const SECTION_COPY: Record<string, string> = {
  Identidade: "Como seu nome aparece no site e no atendimento.",
  Registro: "Conselho, número e especialidade visíveis ao público.",
  Contato: "Canais usados nos botões e no rodapé do site.",
  "Conteúdo público": "Textos e modalidades que alimentam as seções.",
  "Endereço do consultório": "Usado na localização e no rodapé.",
  Redes: "Links sociais exibidos no site.",
};

export function ProfessionalForm({
  professional,
  readOnly = false,
  portalMode = false,
  studio = false,
  action,
}: ProfessionalFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [photoUrl, setPhotoUrl] = useState(professional?.photo_url ?? "");

  const educationText = (professional?.education ?? []).join("\n");
  const office = professional?.office_address ?? {};
  const social = professional?.social_links ?? {};
  const modes = new Set(professional?.attendance_modes ?? []);
  const elevated = portalMode || studio;
  const fieldClass = elevated ? portalInputClass : inputClass;
  const labelClass = elevated ? "portal-label" : undefined;

  return (
    <form
      action={formAction}
      className={elevated ? "portal-form" : "grid gap-8"}
    >
      {state.error ? (
        <p
          role="alert"
          className={
            elevated
              ? "portal-error"
              : "text-sm text-red-700 dark:text-red-400"
          }
        >
          {state.error}
        </p>
      ) : null}

      <Section
        title="Identidade"
        elevated={elevated}
        description={SECTION_COPY.Identidade}
      >
        <Field
          label="Nome completo"
          name="full_name"
          required
          defaultValue={professional?.full_name ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.full_name?.[0]}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="Nome profissional"
          name="professional_name"
          defaultValue={professional?.professional_name ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.professional_name?.[0]}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        {portalMode ? (
          <input
            type="hidden"
            name="status"
            value={professional?.status ?? "active"}
          />
        ) : (
          <div className={elevated ? "portal-label" : "grid gap-1.5"}>
            <label htmlFor="status" className={elevated ? undefined : "text-sm font-medium"}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={professional?.status ?? "active"}
              disabled={readOnly}
              className={fieldClass}
            >
              {professionalStatuses.map((status) => (
                <option key={status} value={status}>
                  {professionalStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        )}
      </Section>

      <Section
        title="Registro"
        elevated={elevated}
        description={SECTION_COPY.Registro}
      >
        <div className={elevated ? "portal-label" : "grid gap-1.5"}>
          {elevated ? <span>Conselho</span> : (
            <label htmlFor="council" className="text-sm font-medium">
              Conselho
            </label>
          )}
          <select
            id="council"
            name="council"
            defaultValue={professional?.council ?? ""}
            disabled={readOnly}
            className={fieldClass}
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
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="RQE"
          name="specialty_registration"
          defaultValue={professional?.specialty_registration ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.specialty_registration?.[0]}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="Especialidade"
          name="specialty"
          defaultValue={professional?.specialty ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.specialty?.[0]}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
      </Section>

      <Section
        title="Contato"
        elevated={elevated}
        description={SECTION_COPY.Contato}
      >
        <Field
          label="Telefone"
          name="phone"
          defaultValue={professional?.phone ?? ""}
          readOnly={readOnly}
          hint="Somente dígitos, com DDI e DDD."
          error={state.fieldErrors?.phone?.[0]}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="WhatsApp"
          name="whatsapp"
          defaultValue={professional?.whatsapp ?? ""}
          readOnly={readOnly}
          hint="Somente dígitos, com DDI e DDD."
          error={state.fieldErrors?.whatsapp?.[0]}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          defaultValue={professional?.email ?? ""}
          readOnly={readOnly}
          error={state.fieldErrors?.email?.[0]}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        {professional?.id && !readOnly ? (
          <div className={elevated ? "portal-field-span grid gap-2" : "grid gap-2"}>
            <ImageUploadField
              label="Foto"
              value={photoUrl}
              target={{ kind: "professional", professionalId: professional.id }}
              onChange={setPhotoUrl}
            />
            <input type="hidden" name="photo_url" value={photoUrl} />
            {state.fieldErrors?.photo_url?.[0] ? (
              <p
                className={
                  elevated
                    ? "portal-error"
                    : "text-sm text-red-700 dark:text-red-400"
                }
              >
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
            className={fieldClass}
            labelClassName={labelClass}
            elevated={elevated}
          />
        )}
      </Section>

      <Section
        title="Conteúdo público"
        elevated={elevated}
        description={SECTION_COPY["Conteúdo público"]}
      >
        <div
          className={
            elevated
              ? "portal-field-span portal-label"
              : "grid gap-1.5"
          }
        >
          {elevated ? (
            <span>Bio</span>
          ) : (
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
          )}
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={professional?.bio ?? ""}
            readOnly={readOnly}
            className={fieldClass}
          />
          {state.fieldErrors?.bio?.[0] ? (
            <p
              className={
                elevated
                  ? "portal-error"
                  : "text-sm text-red-700 dark:text-red-400"
              }
            >
              {state.fieldErrors.bio[0]}
            </p>
          ) : null}
        </div>
        <div
          className={
            elevated
              ? "portal-field-span portal-label"
              : "grid gap-1.5"
          }
        >
          {elevated ? (
            <span>Formação</span>
          ) : (
            <label htmlFor="education" className="text-sm font-medium">
              Formação
            </label>
          )}
          <textarea
            id="education"
            name="education"
            rows={4}
            defaultValue={educationText}
            readOnly={readOnly}
            className={fieldClass}
            placeholder="Uma formação por linha"
          />
        </div>
        <fieldset
          className={
            elevated
              ? "portal-field-span grid gap-2"
              : "grid gap-2"
          }
        >
          <legend className={elevated ? "text-sm font-semibold" : "text-sm font-medium"}>
            Modalidades
          </legend>
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

      <Section
        title="Endereço do consultório"
        elevated={elevated}
        description={SECTION_COPY["Endereço do consultório"]}
      >
        <Field
          label="Rua"
          name="street"
          defaultValue={office.street ?? ""}
          readOnly={readOnly}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="Cidade"
          name="city"
          defaultValue={office.city ?? ""}
          readOnly={readOnly}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="Estado"
          name="state"
          defaultValue={office.state ?? ""}
          readOnly={readOnly}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="CEP"
          name="cep"
          defaultValue={office.cep ?? ""}
          readOnly={readOnly}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
      </Section>

      <Section
        title="Redes"
        elevated={elevated}
        description={SECTION_COPY.Redes}
      >
        <Field
          label="Instagram"
          name="instagram"
          defaultValue={social.instagram ?? ""}
          readOnly={readOnly}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="LinkedIn"
          name="linkedin"
          defaultValue={social.linkedin ?? ""}
          readOnly={readOnly}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
        <Field
          label="Site"
          name="website"
          defaultValue={social.website ?? ""}
          readOnly={readOnly}
          className={fieldClass}
          labelClassName={labelClass}
          elevated={elevated}
        />
      </Section>

      {portalMode ? (
        <input type="hidden" name="internal_notes" value="" />
      ) : (
        <Section
          title="Uso interno da equipe"
          elevated={elevated}
          description="Nunca entra no site publicado."
        >
          <div className={elevated ? "portal-field-span portal-label" : "grid gap-1.5"}>
            <label
              htmlFor="internal_notes"
              className={elevated ? undefined : "text-sm font-medium"}
            >
              Nota interna
            </label>
            <textarea
              id="internal_notes"
              name="internal_notes"
              rows={4}
              defaultValue={professional?.internal_notes ?? ""}
              readOnly={readOnly}
              className={fieldClass}
            />
            {state.fieldErrors?.internal_notes?.[0] ? (
              <p
                className={
                  elevated
                    ? "portal-error"
                    : "text-sm text-red-700 dark:text-red-400"
                }
              >
                {state.fieldErrors.internal_notes[0]}
              </p>
            ) : null}
          </div>
        </Section>
      )}

      {!readOnly ? (
        <div className={elevated ? "portal-form-actions" : undefined}>
          <button
            type="submit"
            disabled={pending}
            className={
              elevated
                ? "portal-btn portal-btn-primary"
                : "justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            }
          >
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      ) : null}
    </form>
  );
}

function Section({
  title,
  description,
  elevated,
  children,
}: {
  title: string;
  description?: string;
  elevated?: boolean;
  children: ReactNode;
}) {
  if (elevated) {
    return (
      <section className="portal-section">
        <div className="portal-section-head">
          <h2 className="portal-section-title">{title}</h2>
          {description ? (
            <p className="portal-section-desc">{description}</p>
          ) : null}
        </div>
        <div className="portal-field-grid">{children}</div>
      </section>
    );
  }

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
  className,
  labelClassName,
  elevated,
}: {
  label: string;
  name: string;
  defaultValue: string;
  readOnly?: boolean;
  required?: boolean;
  type?: string;
  hint?: string;
  error?: string;
  className?: string;
  labelClassName?: string;
  elevated?: boolean;
}) {
  return (
    <div className={labelClassName ?? "grid gap-1.5"}>
      <label
        htmlFor={name}
        className={elevated ? undefined : "text-sm font-medium"}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={className ?? inputClass}
      />
      {hint ? (
        <p className={elevated ? "portal-hint" : "text-sm text-zinc-500"}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          className={
            elevated
              ? "portal-error"
              : "text-sm text-red-700 dark:text-red-400"
          }
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 read-only:opacity-70 dark:border-zinc-700";

const portalInputClass = "portal-input";
