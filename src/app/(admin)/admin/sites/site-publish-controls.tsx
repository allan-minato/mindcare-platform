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
  publicUrl: string;
  statusLabel: string;
};

const initialState: PublishActionState = {};

export function SitePublishControls({
  siteId,
  isLive,
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

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{statusLabel}</p>
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
          <p className="text-sm text-zinc-500">
            Publique para gerar o snapshot no host interno.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <form action={publishAction}>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isLive ? "Republicar" : "Publicar"}
          </button>
        </form>
        {isLive ? (
          <form action={unpublishAction}>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-zinc-700"
            >
              Despublicar
            </button>
          </form>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
