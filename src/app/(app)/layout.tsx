import { Suspense, type ReactNode } from "react";
import { Fraunces, Manrope } from "next/font/google";

import { signOut } from "@/app/login/actions";
import { PortalHeader } from "@/components/portal";
import "@/components/portal/portal.css";
import {
  requireProfessional,
} from "@/lib/auth/professional";

export const instant = false;

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-portal-display",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-portal-sans",
});

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AppLoading />}>
      <AppGate>{children}</AppGate>
    </Suspense>
  );
}

function AppLoading() {
  return (
    <div className={`${display.variable} ${sans.variable} portal-root`}>
      <main className="portal-page">
        <p className="portal-hint">Carregando…</p>
      </main>
    </div>
  );
}

async function AppGate({ children }: { children: ReactNode }) {
  const access = await requireProfessional();

  if (access.status === "denied") {
    return (
      <div className={`${display.variable} ${sans.variable} portal-root`}>
        <PortalDenied />
      </div>
    );
  }

  return (
    <div className={`${display.variable} ${sans.variable} portal-root`}>
      <PortalHeader profile={access.profile} />
      {children}
    </div>
  );
}

function PortalDenied() {
  return (
    <main className="portal-denied">
      <p className="portal-kicker">Portal</p>
      <h1 className="portal-title">Sem acesso ao portal</h1>
      <p className="portal-lead" style={{ marginInline: "auto" }}>
        Esta conta não está vinculada a um profissional ativo.
      </p>
      <form action={signOut}>
        <button type="submit" className="portal-btn portal-btn-ghost">
          Sair
        </button>
      </form>
    </main>
  );
}
