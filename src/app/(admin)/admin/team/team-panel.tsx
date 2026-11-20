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
    <div className="portal-form">
      <section className="portal-section">
        <div className="portal-section-head">
          <h2 className="portal-section-title">Membros</h2>
        </div>
        {members.length === 0 ? (
          <p className="portal-hint">Nenhum membro cadastrado.</p>
        ) : (
          <div className="portal-list">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isSelf={member.id === currentUserId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2 className="portal-section-title">Convidar</h2>
        </div>
        <form action={inviteAction} className="portal-field-grid">
          <div className="portal-label">
            <label htmlFor="full_name">Nome</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="portal-input"
            />
            {inviteState.fieldErrors?.full_name?.[0] ? (
              <p className="portal-error">
                {inviteState.fieldErrors.full_name[0]}
              </p>
            ) : null}
          </div>
          <div className="portal-label">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="portal-input"
            />
            {inviteState.fieldErrors?.email?.[0] ? (
              <p className="portal-error">{inviteState.fieldErrors.email[0]}</p>
            ) : null}
          </div>
          <div className="portal-label">
            <label htmlFor="role">Papel</label>
            <select
              id="role"
              name="role"
              defaultValue="editor"
              className="portal-input"
            >
              {teamRoles.map((role) => (
                <option key={role} value={role}>
                  {adminRoleLabel(role)}
                </option>
              ))}
            </select>
          </div>
          <div className="portal-field-span">
            <button
              type="submit"
              disabled={invitePending}
              className="portal-btn portal-btn-primary"
            >
              Enviar convite
            </button>
          </div>
          {inviteState.error ? (
            <p className="portal-error portal-field-span">{inviteState.error}</p>
          ) : null}
          {inviteState.success ? (
            <p className="portal-hint portal-field-span">{inviteState.success}</p>
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
    <div className="portal-list-item grid gap-3">
      <div className="grid gap-1">
        <p className="font-medium">
          {member.full_name}
          {isSelf ? (
            <span className="ml-2 text-xs font-normal text-[var(--portal-muted)]">
              você
            </span>
          ) : null}
        </p>
        <p className="portal-hint" style={{ margin: 0 }}>
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
    </div>
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
        className={`portal-btn ${active ? "portal-btn-primary" : "portal-btn-ghost"}`}
      >
        {adminRoleLabel(role)}
      </button>
      {state.error ? (
        <span className="ml-2 portal-error">{state.error}</span>
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
        className="portal-btn portal-btn-ghost"
      >
        {isActive ? "Desativar" : "Reativar"}
      </button>
      {state.error ? (
        <span className="ml-2 portal-error">{state.error}</span>
      ) : null}
    </form>
  );
}
