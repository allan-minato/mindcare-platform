"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/login/actions";
import type { ProfessionalAccessProfile } from "@/lib/auth/professional";

export function PortalHeader({ profile }: { profile: ProfessionalAccessProfile }) {
  const pathname = usePathname();
  const onHome = pathname === "/app" || pathname === "/app/";
  const onProfile = pathname.startsWith("/app/profile");

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <Link href="/app" className="portal-brand">
          <span className="portal-brand-mark">
            Mind<em>Care</em>
          </span>
          <span className="portal-brand-user">{profile.fullName}</span>
        </Link>

        <div className="portal-header-actions">
          <nav className="portal-nav" aria-label="Portal">
            <Link href="/app" data-active={onHome ? "true" : "false"}>
              Início
            </Link>
            <Link href="/app/profile" data-active={onProfile ? "true" : "false"}>
              Meu perfil
            </Link>
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
