import "server-only";

import { connection } from "next/server";
import { cache } from "react";
import { redirect } from "next/navigation";

import {
  hasMinRole,
  isAdminRole,
  type AdminRole,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type { AdminRole } from "@/lib/auth/roles";
export {
  adminRoleLabel,
  adminRoles,
  hasMinRole,
  isAdminRole,
} from "@/lib/auth/roles";

export type AdminProfile = {
  id: string;
  fullName: string;
  role: AdminRole;
};

export type AdminAccess =
  | { status: "ok"; admin: AdminProfile }
  | { status: "denied" };

type AdminUserRow = {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
};

export const requireAdmin = cache(async (): Promise<AdminAccess> => {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle<AdminUserRow>();

  if (error || !data?.is_active || !isAdminRole(data.role)) {
    return { status: "denied" };
  }

  return {
    status: "ok",
    admin: {
      id: data.id,
      fullName: data.full_name,
      role: data.role,
    },
  };
});

export async function requireAdminProfile(): Promise<AdminProfile> {
  const access = await requireAdmin();
  if (access.status === "denied") {
    redirect("/admin");
  }
  return access.admin;
}

export async function requireAdminRole(minRole: AdminRole): Promise<AdminProfile> {
  const admin = await requireAdminProfile();
  if (!hasMinRole(admin.role, minRole)) {
    redirect("/admin");
  }
  return admin;
}
