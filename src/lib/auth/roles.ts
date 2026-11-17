export const adminRoles = ["editor", "admin", "super_admin"] as const;

export type AdminRole = (typeof adminRoles)[number];

const roleRank: Record<AdminRole, number> = {
  editor: 0,
  admin: 1,
  super_admin: 2,
};

export function isAdminRole(role: string): role is AdminRole {
  return adminRoles.some((adminRole) => adminRole === role);
}

export function hasMinRole(role: AdminRole, minRole: AdminRole) {
  return roleRank[role] >= roleRank[minRole];
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
