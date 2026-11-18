"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminRole } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type InviteProfessionalState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

const inviteEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido.")
    .max(320),
});

export async function inviteProfessionalAccess(
  professionalId: string,
  _state: InviteProfessionalState,
  formData: FormData,
): Promise<InviteProfessionalState> {
  await requireAdminRole("admin");
  const parsed = inviteEmailSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return {
      error: "Revise o e-mail.",
      fieldErrors: {
        email: parsed.error.flatten().fieldErrors.email ?? ["E-mail inválido."],
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke(
    "invite-professional",
    {
      body: {
        professional_id: professionalId,
        email: parsed.data.email,
      },
    },
  );

  if (error) {
    return { error: await readFunctionsError(error, data) };
  }

  const payload = data as { error?: string } | null;
  if (payload?.error) {
    return { error: payload.error };
  }

  revalidatePath(`/admin/professionals/${professionalId}`);
  return { success: "Convite enviado." };
}

export async function setProfessionalAccessActive(
  professionalId: string,
  isActive: boolean,
  _state: InviteProfessionalState,
  formData: FormData,
): Promise<InviteProfessionalState> {
  void formData;
  await requireAdminRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("professional_users")
    .update({ is_active: isActive })
    .eq("professional_id", professionalId);

  if (error) {
    return { error: "Não foi possível atualizar o acesso." };
  }

  revalidatePath(`/admin/professionals/${professionalId}`);
  return {};
}

async function readFunctionsError(
  error: { message: string; context?: unknown },
  data: unknown,
): Promise<string> {
  if (data && typeof data === "object" && "error" in data) {
    const message = (data as { error?: unknown }).error;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  const context = error.context;
  if (context && typeof Response !== "undefined" && context instanceof Response) {
    try {
      const body = (await context.clone().json()) as { error?: unknown };
      if (typeof body.error === "string" && body.error.length > 0) {
        return body.error;
      }
    } catch {
      // ignore
    }
  }
  return "Não foi possível enviar o convite.";
}
