"use server";

import { revalidatePath } from "next/cache";

import { requireAdminRole, type AdminRole } from "@/lib/auth/admin";
import {
  isTeamRole,
  parseInviteTeamMemberForm,
} from "@/lib/team/schema";
import { createClient } from "@/lib/supabase/server";

export type TeamActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
};

export async function inviteTeamMember(
  _state: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  await requireAdminRole("super_admin");
  const parsed = parseInviteTeamMemberForm(formData);
  if (!parsed.success) {
    return {
      error: "Revise os campos destacados.",
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.functions.invoke("invite-admin", {
    body: {
      email: parsed.data.email,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    },
  });

  if (error) {
    return { error: await readFunctionsError(error, data) };
  }

  const payload = data as { error?: string } | null;
  if (payload?.error) {
    return { error: payload.error };
  }

  revalidatePath("/admin/team");
  return { success: "Convite enviado." };
}

export async function setTeamMemberRole(
  memberId: string,
  role: AdminRole,
  _state: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  void formData;
  const admin = await requireAdminRole("super_admin");
  if (!isTeamRole(role)) {
    return { error: "Papel inválido." };
  }
  if (memberId === admin.id && role !== "super_admin") {
    return { error: "Você não pode remover o próprio papel de super_admin." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ role })
    .eq("id", memberId);

  if (error) {
    return { error: humanizeTeamError(error.message) };
  }

  revalidatePath("/admin/team");
  return {};
}

export async function setTeamMemberActive(
  memberId: string,
  isActive: boolean,
  _state: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  void formData;
  const admin = await requireAdminRole("super_admin");
  if (memberId === admin.id && !isActive) {
    return { error: "Você não pode desativar a própria conta." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ is_active: isActive })
    .eq("id", memberId);

  if (error) {
    return { error: humanizeTeamError(error.message) };
  }

  revalidatePath("/admin/team");
  return {};
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

function humanizeTeamError(message: string) {
  if (message.includes("A plataforma precisa de ao menos um super_admin")) {
    return "A plataforma precisa de ao menos um super_admin ativo.";
  }
  if (message.includes("admin_users_email_key")) {
    return "Este e-mail já faz parte da equipe.";
  }
  return "Não foi possível atualizar o membro.";
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
      // corpo não-JSON
    }
  }

  if (/unauthor|jwt|session|401/i.test(error.message)) {
    return "Sessão expirada. Entre de novo.";
  }
  return "Não foi possível enviar o convite.";
}
