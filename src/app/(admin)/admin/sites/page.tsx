import type { Metadata } from "next";
import Link from "next/link";

import {
  PortalCard,
  PortalPage,
  PortalPageHeader,
  StatusChip,
} from "@/components/portal";
import { hasMinRole, requireAdminProfile } from "@/lib/auth/admin";
import { listSites } from "@/lib/sites/queries";
import { templateLabel } from "@/lib/templates/registry";

export const instant = false;

export const metadata: Metadata = {
  title: "Sites · MindCare",
};

export default async function SitesPage() {
  const admin = await requireAdminProfile();
  const canWrite = hasMinRole(admin.role, "admin");
  const sites = await listSites();

  return (
    <PortalPage>
      <PortalPageHeader
        kicker="Sites"
        title="Sites"
        lead="Rascunhos ligados a um profissional e a um template."
        actions={
          canWrite ? (
            <Link href="/admin/sites/new" className="portal-btn portal-btn-primary">
              Novo site
            </Link>
          ) : null
        }
      />

      {sites.length === 0 ? (
        <PortalCard quiet>
          <div className="portal-empty">
            <p className="portal-section-title" style={{ fontSize: "1.2rem" }}>
              Nenhum site criado
            </p>
            <p>Crie o primeiro site para um profissional ativo.</p>
            {canWrite ? (
              <div style={{ marginTop: "0.75rem" }}>
                <Link
                  href="/admin/sites/new"
                  className="portal-btn portal-btn-primary"
                >
                  Novo site
                </Link>
              </div>
            ) : null}
          </div>
        </PortalCard>
      ) : (
        <div className="portal-site-grid">
          {sites.map((site) => {
            const live = Boolean(site.live_publication_id);
            return (
              <PortalCard key={site.id} className="portal-site-card">
                <div className="portal-site-card-top">
                  <div>
                    <h2 className="portal-site-name">{site.name}</h2>
                    <p className="portal-site-meta">
                      {site.slug}
                      {" · "}
                      {templateLabel(site.template_key)}
                      {" · "}
                      {site.professional_name}
                    </p>
                  </div>
                  <StatusChip live={live} />
                </div>
                <div className="portal-site-actions">
                  <Link
                    href={`/admin/sites/${site.id}`}
                    className="portal-btn portal-btn-primary"
                  >
                    Abrir
                  </Link>
                  <Link
                    href={`/preview/${site.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="portal-btn portal-btn-ghost"
                  >
                    Prévia
                  </Link>
                </div>
              </PortalCard>
            );
          })}
        </div>
      )}
    </PortalPage>
  );
}
