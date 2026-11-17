import "server-only";

import { connection } from "next/server";
import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const adminRoles = ["editor", "admin", "super_admin"] as const;

export type AdminRole = (typeof adminRoles)[number];

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

const roleRank: Record<AdminRole, number> = {
  editor: 0,
  admin: 1,
  super_admin: 2,
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
    redirect("/admin/professionals");
  }
  return admin;
}

export function hasMinRole(role: AdminRole, minRole: AdminRole) {
  return roleRank[role] >= roleRank[minRole];
}

function isAdminRole(role: string): role is AdminRole {
  return adminRoles.some((adminRole) => adminRole === role);
}

export function adminRoleLabel(role: AdminRole) {
  switch (role) {
    case "editor":
      return "Editor";
    case "admin":
      return "Admin";
    case "super_admin":
      return "Super admin";
  }
}
