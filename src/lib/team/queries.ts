import "server-only";

import { requireAdminRole, type AdminRole } from "@/lib/auth/admin";
import { isTeamRole, type TeamMember } from "@/lib/team/schema";
import { createClient } from "@/lib/supabase/server";

export async function listAdminUsers(): Promise<TeamMember[]> {
  await requireAdminRole("super_admin");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, full_name, email, role, is_active, created_at, updated_at")
    .order("is_active", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar a equipe.");
  }

  return ((data ?? []) as Array<Record<string, unknown>>).flatMap((row) => {
    const role = String(row.role ?? "");
    if (!isTeamRole(role)) {
      return [];
    }
    return [
      {
        id: String(row.id),
        full_name: String(row.full_name),
        email: String(row.email),
        role: role as AdminRole,
        is_active: Boolean(row.is_active),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      },
    ];
  });
}
