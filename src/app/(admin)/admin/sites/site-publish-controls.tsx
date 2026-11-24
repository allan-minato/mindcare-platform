"use client";

import { useActionState } from "react";

import {
  publishSite,
  unpublishSite,
  type PublishActionState,
} from "@/app/(admin)/admin/sites/actions";

type SitePublishControlsProps = {
  siteId: string;
  isLive: boolean;
  hasPendingChanges?: boolean;
  publicUrl: string;
  statusLabel: string;
};

const initialState: PublishActionState = {};

export function SitePublishControls({
  siteId,
  isLive,
  hasPendingChanges = false,
  publicUrl,
  statusLabel,
}: SitePublishControlsProps) {
  const publish = publishSite.bind(null, siteId);
  const unpublish = unpublishSite.bind(null, siteId);
  const [publishState, publishAction, publishPending] = useActionState(
    publish,
    initialState,
  );
  const [unpublishState, unpublishAction, unpublishPending] = useActionState(
    unpublish,
    initialState,
  );

  const error = publishState.error ?? unpublishState.error;
  const pending = publishPending || unpublishPending;
  const needsRepublish = isLive && hasPendingChanges;

  return (
    <div className="publish-controls">
      <div className="grid gap-1">
        <p className="portal-hint" style={{ margin: 0 }}>
          {statusLabel}
        </p>
        {isLive ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Abrir site público
          </a>
        ) : (
          <p className="portal-hint" style={{ margin: 0 }}>
            Publique para gerar o snapshot no ar.
          </p>
        )}
      </div>

      {needsRepublish ? (
        <div className="publish-pending-banner" role="status">
          <strong>Há mudanças no rascunho.</strong>
          <span>
            {" "}
            SEO, textos, blog ou perfil foram alterados depois da última
            publicação. Clique em <em>Republicar</em> para ir ao ar.
          </span>
        </div>
      ) : null}

      {isLive && !hasPendingChanges ? (
        <div className="publish-pending-banner publish-pending-banner-ok" role="status">
          <strong>Site atualizado no ar.</strong>
          <span>
            {" "}
            O público já vê a versão mais recente do rascunho. Só republicar se
            fizer novas edições.
          </span>
        </div>
      ) : null}

      {!isLive ? (
        <div className="publish-pending-banner publish-pending-banner-info" role="status">
          <strong>Site ainda em rascunho.</strong>
          <span> Publique para o público ver a versão atual.</span>
        </div>
      ) : null}

      <div className="publish-controls-actions">
        <form action={publishAction}>
          <button
            type="submit"
            disabled={pending}
            className={`portal-btn ${
              needsRepublish || !isLive
                ? "portal-btn-attention"
                : "portal-btn-primary"
            } disabled:opacity-60`}
          >
            {publishPending
              ? isLive
                ? "Republicando…"
                : "Publicando…"
              : isLive
                ? needsRepublish
                  ? "Republicar agora"
                  : "Republicar"
                : "Publicar"}
          </button>
        </form>
        {isLive ? (
          <form action={unpublishAction}>
            <button
              type="submit"
              disabled={pending}
              className="portal-btn portal-btn-danger disabled:opacity-60"
            >
              {unpublishPending ? "Despublicando…" : "Despublicar"}
            </button>
          </form>
        ) : null}
      </div>

      {error ? <p className="portal-error">{error}</p> : null}
    </div>
  );
}
