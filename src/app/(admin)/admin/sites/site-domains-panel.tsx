"use client";

import { useActionState } from "react";

import {
  addSiteDomain,
  removeSiteDomain,
  setDomainConfiguration,
  setDomainPrimary,
  setDomainVerification,
  type DomainActionState,
} from "@/app/(admin)/admin/sites/domain-actions";
import {
  configurationLabel,
  domainConfigurationStatuses,
  domainVerificationStatuses,
  verificationLabel,
  type SiteDomain,
} from "@/lib/sites/domains";

type SiteDomainsPanelProps = {
  siteId: string;
  domains: SiteDomain[];
  canManage: boolean;
};

const initialState: DomainActionState = {};

export function SiteDomainsPanel({
  siteId,
  domains,
  canManage,
}: SiteDomainsPanelProps) {
  const add = addSiteDomain.bind(null, siteId);
  const [addState, addAction, addPending] = useActionState(add, initialState);

  return (
    <div className="grid gap-4">
      {domains.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Nenhum domínio personalizado cadastrado.
        </p>
      ) : (
        <ul className="grid gap-4">
          {domains.map((domain) => (
            <DomainRow
              key={domain.id}
              domain={domain}
              canManage={canManage}
            />
          ))}
        </ul>
      )}

      {canManage ? (
        <form action={addAction} className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-1">
            <label htmlFor="domain" className="sr-only">
              Domínio
            </label>
            <input
              id="domain"
              name="domain"
              type="text"
              required
              placeholder="clinica.exemplo.com.br"
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            {addState.fieldErrors?.domain?.[0] ? (
              <p className="text-sm text-red-700 dark:text-red-400">
                {addState.fieldErrors.domain[0]}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={addPending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Adicionar domínio
          </button>
          {addState.error ? (
            <p className="text-sm text-red-700 sm:col-span-2 dark:text-red-400">
              {addState.error}
            </p>
          ) : null}
        </form>
      ) : (
        <p className="text-sm text-zinc-500">
          Sua conta pode ver os domínios, mas não gerenciá-los.
        </p>
      )}

      <p className="text-xs text-zinc-500">
        DNS e certificado ficam fora do app. Marque como verificado só depois
        que o host apontar para a plataforma.
      </p>
    </div>
  );
}

function DomainRow({
  domain,
  canManage,
}: {
  domain: SiteDomain;
  canManage: boolean;
}) {
  const setPrimary = setDomainPrimary.bind(null, domain.id);
  const remove = removeSiteDomain.bind(null, domain.id);
  const [primaryState, primaryAction, primaryPending] = useActionState(
    setPrimary,
    initialState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    remove,
    initialState,
  );

  const verifiedUrl =
    domain.verification_status === "verified"
      ? `https://${domain.domain}/`
      : null;

  return (
    <li className="grid gap-3 border-b border-zinc-200 pb-4 last:border-b-0 last:pb-0 dark:border-zinc-800">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="grid gap-1">
          <p className="font-medium">
            {domain.domain}
            {domain.is_primary ? (
              <span className="ml-2 text-xs font-normal text-zinc-500">
                principal
              </span>
            ) : null}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Verificação: {verificationLabel(domain.verification_status)}
            {" · "}
            Configuração: {configurationLabel(domain.configuration_status)}
          </p>
          {verifiedUrl ? (
            <a
              href={verifiedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline-offset-4 hover:underline"
            >
              {verifiedUrl}
            </a>
          ) : null}
        </div>
      </div>

      {canManage ? (
        <div className="flex flex-wrap gap-2">
          {!domain.is_primary ? (
            <ActionButton
              action={primaryAction}
              pending={primaryPending}
              label="Tornar principal"
            />
          ) : null}

          {domainVerificationStatuses.map((status) => (
            <VerificationButton
              key={status}
              domainId={domain.id}
              status={status}
              current={domain.verification_status}
            />
          ))}

          {domainConfigurationStatuses.map((status) => (
            <ConfigurationButton
              key={status}
              domainId={domain.id}
              status={status}
              current={domain.configuration_status}
            />
          ))}

          <form action={removeAction}>
            <button
              type="submit"
              disabled={removePending}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-60 dark:border-red-900 dark:text-red-400"
            >
              Remover
            </button>
          </form>
        </div>
      ) : null}

      {primaryState.error || removeState.error ? (
        <p className="text-sm text-red-700 dark:text-red-400">
          {primaryState.error ?? removeState.error}
        </p>
      ) : null}
    </li>
  );
}

function VerificationButton({
  domainId,
  status,
  current,
}: {
  domainId: string;
  status: SiteDomain["verification_status"];
  current: SiteDomain["verification_status"];
}) {
  const bound = setDomainVerification.bind(null, domainId, status);
  const [state, action, pending] = useActionState(bound, initialState);
  const active = current === status;

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || active}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        {status === "verified"
          ? "Marcar verificado"
          : status === "failed"
            ? "Marcar falhou"
            : "Marcar pendente"}
      </button>
      {state.error ? (
        <span className="ml-2 text-sm text-red-700 dark:text-red-400">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function ConfigurationButton({
  domainId,
  status,
  current,
}: {
  domainId: string;
  status: SiteDomain["configuration_status"];
  current: SiteDomain["configuration_status"];
}) {
  const bound = setDomainConfiguration.bind(null, domainId, status);
  const [state, action, pending] = useActionState(bound, initialState);
  const active = current === status;

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending || active}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        Config: {configurationLabel(status).toLowerCase()}
      </button>
      {state.error ? (
        <span className="ml-2 text-sm text-red-700 dark:text-red-400">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function ActionButton({
  action,
  pending,
  label,
}: {
  action: (payload: FormData) => void;
  pending: boolean;
  label: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-700"
      >
        {label}
      </button>
    </form>
  );
}
