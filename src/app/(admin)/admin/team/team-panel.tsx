"use client";

import { useActionState } from "react";

import {
  inviteTeamMember,
  setTeamMemberActive,
  setTeamMemberRole,
  type TeamActionState,
} from "@/app/(admin)/admin/team/actions";
import { adminRoleLabel, type AdminRole } from "@/lib/auth/roles";
import { teamRoles, type TeamMember } from "@/lib/team/schema";

type TeamPanelProps = {
  members: TeamMember[];
  currentUserId: string;
};

const initialState: TeamActionState = {};

export function TeamPanel({ members, currentUserId }: TeamPanelProps) {
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteTeamMember,
    initialState,
  );

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Membros</h2>
        {members.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum membro cadastrado.</p>
        ) : (
          <ul className="grid gap-4">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isSelf={member.id === currentUserId}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Convidar</h2>
        <form action={inviteAction} className="grid gap-3">
          <div className="grid gap-1">
            <label htmlFor="full_name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            {inviteState.fieldErrors?.full_name?.[0] ? (
              <p className="text-sm text-red-700 dark:text-red-400">
                {inviteState.fieldErrors.full_name[0]}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            {inviteState.fieldErrors?.email?.[0] ? (
              <p className="text-sm text-red-700 dark:text-red-400">
                {inviteState.fieldErrors.email[0]}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1">
            <label htmlFor="role" className="text-sm font-medium">
              Papel
            </label>
            <select
              id="role"
              name="role"
              defaultValue="editor"
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            >
              {teamRoles.map((role) => (
                <option key={role} value={role}>
                  {adminRoleLabel(role)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={invitePending}
            className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Enviar convite
          </button>
          {inviteState.error ? (
            <p className="text-sm text-red-700 dark:text-red-400">
              {inviteState.error}
            </p>
          ) : null}
          {inviteState.success ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {inviteState.success}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}

function MemberRow({
  member,
  isSelf,
}: {
  member: TeamMember;
  isSelf: boolean;
}) {
  return (
    <li className="grid gap-3 border-b border-zinc-200 pb-4 last:border-b-0 last:pb-0 dark:border-zinc-800">
      <div className="grid gap-1">
        <p className="font-medium">
          {member.full_name}
          {isSelf ? (
            <span className="ml-2 text-xs font-normal text-zinc-500">você</span>
          ) : null}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {member.email}
          {" · "}
          {adminRoleLabel(member.role)}
          {" · "}
          {member.is_active ? "Ativo" : "Inativo"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {teamRoles.map((role) => (
          <RoleButton
            key={role}
            memberId={member.id}
            role={role}
            current={member.role}
            disabled={isSelf && role !== "super_admin"}
          />
        ))}
        <ActiveButton
          memberId={member.id}
          isActive={member.is_active}
          disabled={isSelf}
        />
      </div>
    </li>
  );
}

function RoleButton({
  memberId,
  role,
  current,
  disabled,
}: {
  memberId: string;
  role: AdminRole;
  current: AdminRole;
  disabled: boolean;
}) {
  const bound = setTeamMemberRole.bind(null, memberId, role);
  const [state, action, pending] = useActionState(bound, initialState);
  const active = current === role;

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || active || disabled}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        {adminRoleLabel(role)}
      </button>
      {state.error ? (
        <span className="ml-2 text-sm text-red-700 dark:text-red-400">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function ActiveButton({
  memberId,
  isActive,
  disabled,
}: {
  memberId: string;
  isActive: boolean;
  disabled: boolean;
}) {
  const nextActive = !isActive;
  const bound = setTeamMemberActive.bind(null, memberId, nextActive);
  const [state, action, pending] = useActionState(bound, initialState);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        {isActive ? "Desativar" : "Reativar"}
      </button>
      {state.error ? (
        <span className="ml-2 text-sm text-red-700 dark:text-red-400">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
