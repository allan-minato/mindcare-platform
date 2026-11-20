import { Suspense, type ReactNode } from "react";
import { Fraunces, Manrope } from "next/font/google";

import { AccessDenied, AdminHeader } from "@/app/(admin)/admin-shell";
import "@/components/portal/portal.css";
import { requireAdmin } from "@/lib/auth/admin";

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

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

function AdminLoading() {
  return (
    <div className={`${display.variable} ${sans.variable} admin-root`}>
      <main className="portal-page">
        <p className="portal-hint">Carregando…</p>
      </main>
    </div>
  );
}

async function AdminGate({ children }: { children: ReactNode }) {
  const access = await requireAdmin();

  if (access.status === "denied") {
    return (
      <div className={`${display.variable} ${sans.variable} admin-root`}>
        <AccessDenied />
      </div>
    );
  }

  return (
    <div className={`${display.variable} ${sans.variable} admin-root`}>
      <AdminHeader admin={access.admin} />
      {children}
    </div>
  );
}
