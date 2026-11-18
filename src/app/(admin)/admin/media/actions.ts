"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { requireProfessionalProfile } from "@/lib/auth/professional";
import { requireSiteEditor } from "@/lib/auth/site-access";
import { uploadImageFile } from "@/lib/media/upload";
import { createClient } from "@/lib/supabase/server";

export type MediaUploadState = {
  error?: string;
  url?: string;
};

export async function uploadSiteImage(
  siteId: string,
  _state: MediaUploadState,
  formData: FormData,
): Promise<MediaUploadState> {
  if (!isUuid(siteId)) {
    return { error: "Site inválido." };
  }

  await requireSiteEditor(siteId);

  const supabase = await createClient();
  const { data: site, error } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !site) {
    return { error: "Site não encontrado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Selecione um arquivo de imagem." };
  }

  const result = await uploadImageFile(file, `sites/${siteId}`);
  if (!result.ok) {
    return { error: result.error };
  }

  return { url: result.url };
}

export async function uploadProfessionalImage(
  professionalId: string,
  _state: MediaUploadState,
  formData: FormData,
): Promise<MediaUploadState> {
  if (!isUuid(professionalId)) {
    return { error: "Profissional inválido." };
  }

  const adminAccess = await requireAdmin();
  if (adminAccess.status === "denied") {
    const profile = await requireProfessionalProfile();
    if (profile.professionalId !== professionalId) {
      return { error: "Sem permissão para este profissional." };
    }
  }

  const supabase = await createClient();
  const { data: professional, error } = await supabase
    .from("professionals")
    .select("id")
    .eq("id", professionalId)
    .maybeSingle();

  if (error || !professional) {
    return { error: "Profissional não encontrado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Selecione um arquivo de imagem." };
  }

  const result = await uploadImageFile(
    file,
    `professionals/${professionalId}`,
  );
  if (!result.ok) {
    return { error: result.error };
  }

  return { url: result.url };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
