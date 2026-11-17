import "server-only";

import { randomUUID } from "crypto";

import {
  ALLOWED_IMAGE_TYPES,
  extensionForImageType,
  isAllowedImageType,
  MAX_IMAGE_BYTES,
  SITE_MEDIA_BUCKET,
} from "@/lib/media/constants";
import { createClient } from "@/lib/supabase/server";

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

export async function uploadImageFile(
  file: File,
  folder: string,
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Selecione um arquivo de imagem." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "A imagem deve ter no máximo 5 MB." };
  }

  if (!isAllowedImageType(file.type)) {
    return {
      ok: false,
      error: "Use JPEG, PNG ou WebP.",
    };
  }

  const safeFolder = folder
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");

  if (!safeFolder) {
    return { ok: false, error: "Pasta de upload inválida." };
  }

  const path = `${safeFolder}/${randomUUID()}.${extensionForImageType(file.type)}`;
  const supabase = await createClient();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { ok: false, error: "Não foi possível enviar a imagem." };
  }

  const { data } = supabase.storage
    .from(SITE_MEDIA_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl.startsWith("https://")) {
    return { ok: false, error: "URL pública inválida após o upload." };
  }

  return { ok: true, url: data.publicUrl, path };
}

export function allowedImageAccept() {
  return ALLOWED_IMAGE_TYPES.join(",");
}
