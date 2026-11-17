"use server";

import { redirect } from "next/navigation";

import { requireAdminRole } from "@/lib/auth/admin";
import {
  parseProfessionalForm,
  professionalStatuses,
  toWritePayload,
  type ProfessionalStatus,
} from "@/lib/professionals/schema";
import { createClient } from "@/lib/supabase/server";

export type ProfessionalActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProfessional(
  _state: ProfessionalActionState,
  formData: FormData,
): Promise<ProfessionalActionState> {
  await requireAdminRole("admin");

  const parsed = parseProfessionalForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const payload = toWritePayload(parsed.data);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    return { error: humanizeDbError(error?.message) };
  }

  redirect(`/admin/professionals/${data.id}`);
}

export async function updateProfessional(
  id: string,
  _state: ProfessionalActionState,
  formData: FormData,
): Promise<ProfessionalActionState> {
  await requireAdminRole("admin");

  const parsed = parseProfessionalForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const payload = toWritePayload(parsed.data);
  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: humanizeDbError(error.message) };
  }

  redirect(`/admin/professionals/${id}`);
}

export async function setProfessionalStatus(
  id: string,
  status: ProfessionalStatus,
) {
  await requireAdminRole("admin");

  if (!professionalStatuses.includes(status)) {
    redirect(`/admin/professionals/${id}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(humanizeDbError(error.message));
  }

  redirect(`/admin/professionals/${id}`);
}

function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
}

function humanizeDbError(message?: string) {
  if (!message) {
    return "Não foi possível salvar o profissional.";
  }
  if (message.includes("professionals_registration_pair")) {
    return "Informe o conselho e o número de registro juntos.";
  }
  if (message.includes("check")) {
    return "Algum campo não passou na validação do banco.";
  }
  return "Não foi possível salvar o profissional.";
}
