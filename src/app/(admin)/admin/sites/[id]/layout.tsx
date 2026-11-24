import type { ReactNode } from "react";

import { SiteWorkspaceNav } from "@/components/portal";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function AdminSiteWorkspaceLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = await params;

  return (
    <div className="portal-site-workspace">
      <div className="portal-workspace-bar">
        <SiteWorkspaceNav siteId={id} basePath="/admin" />
      </div>
      {children}
    </div>
  );
}
