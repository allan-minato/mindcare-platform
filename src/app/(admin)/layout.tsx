import { Suspense, type ReactNode } from "react";

import { AccessDenied, AdminHeader } from "@/app/(admin)/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";

export const instant = false;

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

function AdminLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm text-zinc-500">Carregando…</p>
    </main>
  );
}

async function AdminGate({ children }: { children: ReactNode }) {
  const access = await requireAdmin();

  if (access.status === "denied") {
    return <AccessDenied />;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AdminHeader admin={access.admin} />
      {children}
    </div>
  );
}
