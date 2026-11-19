"use client";

import { useState, useTransition } from "react";

import {
  uploadProfessionalImage,
  uploadSiteImage,
  type MediaUploadState,
} from "@/app/(admin)/admin/media/actions";
import {
  ALLOWED_IMAGE_TYPES,
  isAllowedImageType,
  MAX_IMAGE_BYTES,
} from "@/lib/media/constants";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  target:
    | { kind: "site"; siteId: string }
    | { kind: "professional"; professionalId: string };
};

export function ImageUploadField({
  label,
  value,
  onChange,
  disabled = false,
  target,
}: ImageUploadFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    if (!isAllowedImageType(file.type)) {
      setError("Use JPEG, PNG ou WebP.");
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const initial: MediaUploadState = {};
      const result =
        target.kind === "site"
          ? await uploadSiteImage(target.siteId, initial, formData)
          : await uploadProfessionalImage(
              target.professionalId,
              initial,
              formData,
            );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        onChange(result.url);
      }
    });
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-32 w-auto max-w-full rounded-md border border-zinc-300 object-cover dark:border-zinc-700"
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer text-sm font-medium underline underline-offset-4">
          {pending ? "Enviando…" : value ? "Trocar imagem" : "Enviar imagem"}
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="sr-only"
            disabled={disabled || pending}
            onChange={(event) => {
              handleFileChange(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {value ? (
          <button
            type="button"
            className="text-sm text-zinc-500 underline-offset-4 hover:underline"
            disabled={disabled || pending}
            onClick={() => {
              setError(null);
              onChange("");
            }}
          >
            Remover
          </button>
        ) : null}
      </div>
      <p className="text-sm text-zinc-500">JPEG, PNG ou WebP · até 5 MB</p>
      {value ? (
        <input
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          value={value}
          readOnly
        />
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
