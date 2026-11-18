"use client";

import { useActionState } from "react";

import {
  inviteProfessionalAccess,
  setProfessionalAccessActive,
  type InviteProfessionalState,
} from "@/app/(admin)/admin/professionals/invite-actions";

type InviteAccessPanelProps = {
  professionalId: string;
  defaultEmail: string | null;
  access: {
    email: string;
    is_active: boolean;
    invited_at: string;
  } | null;
};

const initialState: InviteProfessionalState = {};

export function InviteAccessPanel({
  professionalId,
  defaultEmail,
  access,
}: InviteAccessPanelProps) {
  const invite = inviteProfessionalAccess.bind(null, professionalId);
  const [inviteState, inviteAction, invitePending] = useActionState(
    invite,
    initialState,
  );

  return (
    <section className="grid gap-3">
      <div className="grid gap-1">
        <h2 className="text-lg font-medium">Acesso ao portal</h2>
        <p className="text-sm text-zinc-500">
          Convida o profissional para editar o próprio perfil e os sites dele.
        </p>
      </div>

      {access ? (
        <div className="grid gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {access.email}
            {" · "}
            {access.is_active ? "Ativo" : "Inativo"}
            {" · "}
            convidado em {formatDate(access.invited_at)}
          </p>
          <ActiveToggle
            professionalId={professionalId}
            isActive={access.is_active}
          />
        </div>
      ) : (
        <form action={inviteAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-1">
            <label htmlFor="email" className="sr-only">
              E-mail do convite
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={defaultEmail ?? ""}
              placeholder="email@clinica.com"
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            {inviteState.fieldErrors?.email?.[0] ? (
              <p className="text-sm text-red-700 dark:text-red-400">
                {inviteState.fieldErrors.email[0]}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={invitePending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Convidar acesso
          </button>
          {inviteState.error ? (
            <p className="text-sm text-red-700 sm:col-span-2 dark:text-red-400">
              {inviteState.error}
            </p>
          ) : null}
          {inviteState.success ? (
            <p className="text-sm text-zinc-600 sm:col-span-2 dark:text-zinc-400">
              {inviteState.success}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}

function ActiveToggle({
  professionalId,
  isActive,
}: {
  professionalId: string;
  isActive: boolean;
}) {
  const bound = setProfessionalAccessActive.bind(
    null,
    professionalId,
    !isActive,
  );
  const [state, action, pending] = useActionState(bound, initialState);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        {isActive ? "Desativar acesso" : "Reativar acesso"}
      </button>
      {state.error ? (
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
