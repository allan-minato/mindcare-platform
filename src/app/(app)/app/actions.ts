"use server";

import { redirect } from "next/navigation";

import { requireProfessionalProfile } from "@/lib/auth/professional";
import {
  parseProfessionalForm,
  toWritePayload,
} from "@/lib/professionals/schema";
import { createClient } from "@/lib/supabase/server";

export type PortalProfessionalActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateMyProfessional(
  _state: PortalProfessionalActionState,
  formData: FormData,
): Promise<PortalProfessionalActionState> {
  const profile = await requireProfessionalProfile();
  const parsed = parseProfessionalForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const payload = toWritePayload(parsed.data);
  // Dono não altera status nem notas internas (trigger + payload).
  const { status: _status, internal_notes: _notes, ...safePayload } = payload;
  void _status;
  void _notes;

  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update(safePayload)
    .eq("id", profile.professionalId);

  if (error) {
    return { error: "Não foi possível salvar o perfil." };
  }

  redirect("/app/profile");
}

function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([key, value]) =>
      value ? [[key, value]] : [],
    ),
  );
}
