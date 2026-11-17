import { z } from "zod";

import { adminRoles, isAdminRole, type AdminRole } from "@/lib/auth/roles";

export const teamRoles = adminRoles;

export type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const inviteTeamMemberSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(200, "Nome com no máximo 200 caracteres."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido.")
    .max(320, "E-mail com no máximo 320 caracteres."),
  role: z.enum(teamRoles),
});

export type InviteTeamMemberValues = z.infer<typeof inviteTeamMemberSchema>;

export function parseInviteTeamMemberForm(formData: FormData) {
  return inviteTeamMemberSchema.safeParse({
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
}

export function isTeamRole(value: string): value is AdminRole {
  return isAdminRole(value);
}
