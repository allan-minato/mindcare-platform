"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/login/actions";
import {
  adminRoleLabel,
  hasMinRole,
  type AdminRole,
} from "@/lib/auth/roles";

type AdminHeaderProfile = {
  id: string;
  fullName: string;
  role: AdminRole;
};

export function AdminHeader({ admin }: { admin: AdminHeaderProfile }) {
  const pathname = usePathname();
  const canManageTeam = hasMinRole(admin.role, "super_admin");

  const items = [
    { href: "/admin", label: "Início", match: (p: string) => p === "/admin" || p === "/admin/" },
    {
      href: "/admin/professionals",
      label: "Profissionais",
      match: (p: string) => p.startsWith("/admin/professionals"),
    },
    {
      href: "/admin/sites",
      label: "Sites",
      match: (p: string) => p.startsWith("/admin/sites"),
    },
    ...(canManageTeam
      ? [
          {
            href: "/admin/team",
            label: "Equipe",
            match: (p: string) => p.startsWith("/admin/team"),
          },
        ]
      : []),
  ];

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <Link href="/admin" className="portal-brand">
          <span className="portal-brand-mark">
            Mind<em>Care</em>
          </span>
          <span className="portal-brand-user">{admin.fullName}</span>
        </Link>

        <div className="portal-header-actions">
          <span className="portal-chip portal-chip-draft">
            {adminRoleLabel(admin.role)}
          </span>
          <nav className="portal-nav" aria-label="Admin">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={item.match(pathname) ? "true" : "false"}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button type="submit" className="portal-btn portal-btn-ghost">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function AccessDenied() {
  return (
    <main className="portal-denied">
      <p className="portal-kicker">Admin</p>
      <h1 className="portal-title">Sem acesso ao painel</h1>
      <p className="portal-lead" style={{ marginInline: "auto" }}>
        Esta conta não faz parte da equipe.
      </p>
      <form action={signOut}>
        <button type="submit" className="portal-btn portal-btn-ghost">
          Sair
        </button>
      </form>
    </main>
  );
}
