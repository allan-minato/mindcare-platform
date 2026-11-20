import type { Metadata } from "next";
import Link from "next/link";

import {
  PortalCard,
  PortalPage,
  PortalPageHeader,
  StatusChip,
} from "@/components/portal";
import { requireProfessionalProfile } from "@/lib/auth/professional";
import { listMySites } from "@/lib/sites/queries";
import { templateLabel } from "@/lib/templates/registry";

export const instant = false;

export const metadata: Metadata = {
  title: "Portal · MindCare",
};

export default async function PortalHomePage() {
  const profile = await requireProfessionalProfile();
  const sites = await listMySites(profile.professionalId);
  const firstName = profile.fullName.split(/\s+/)[0] || profile.fullName;

  return (
    <PortalPage>
      <PortalPageHeader
        kicker="Portal"
        title={
          <>
            Olá,{" "}
            <em style={{ fontStyle: "italic", color: "var(--portal-gold)" }}>
              {firstName}
            </em>
          </>
        }
        lead="Aqui você cuida de duas coisas: seus dados de profissional e o conteúdo do seu site. Publicação e domínio ficam com a equipe MindCare."
      />

      <div className="portal-hub-grid">
        <PortalCard className="portal-hub-card">
          <div>
            <p className="portal-hub-eyebrow">Seu cadastro</p>
            <h2 className="portal-hub-title">Meu perfil</h2>
            <p className="portal-hub-lead">
              Nome, CRP, foto, WhatsApp, bio e redes que aparecem no site.
            </p>
          </div>
          <ul className="portal-hub-points">
            <li>Atualize dados de contato e apresentação</li>
            <li>Mudanças no site no ar só depois da equipe republicar</li>
          </ul>
          <div className="portal-hub-actions">
            <Link href="/app/profile" className="portal-btn portal-btn-primary">
              Editar meu perfil
            </Link>
          </div>
        </PortalCard>

        <PortalCard className="portal-hub-card">
          <div className="portal-hub-card-top">
            <div>
              <p className="portal-hub-eyebrow">Sua página pública</p>
              <h2 className="portal-hub-title">Meus sites</h2>
              <p className="portal-hub-lead">
                Textos, seções e blog. A prévia mostra como o visitante vai ver.
              </p>
            </div>
            <span className="portal-hub-count">
              <strong>{sites.length}</strong>
              {sites.length === 1 ? "site" : "sites"}
            </span>
          </div>
          <ul className="portal-hub-points">
            <li>Editar home com prévia ao vivo</li>
            <li>Escrever e organizar posts do blog</li>
          </ul>
        </PortalCard>
      </div>

      <section className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="portal-section-title" style={{ fontSize: "1.25rem" }}>
            Sites vinculados
          </h2>
        </div>

        {sites.length === 0 ? (
          <PortalCard quiet>
            <div className="portal-empty">
              <p className="portal-section-title" style={{ fontSize: "1.2rem" }}>
                Ainda sem site
              </p>
              <p>
                A equipe MindCare cria e vincula o site para você. Enquanto
                isso, complete seu perfil.
              </p>
              <div style={{ marginTop: "0.75rem" }}>
                <Link
                  href="/app/profile"
                  className="portal-btn portal-btn-primary"
                >
                  Completar perfil
                </Link>
              </div>
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
                      <p className="portal-hub-eyebrow" style={{ marginBottom: "0.35rem" }}>
                        Site · {templateLabel(site.template_key)}
                      </p>
                      <h3 className="portal-site-name">{site.name}</h3>
                      <p className="portal-site-meta">
                        Endereço interno: {site.slug}
                        {live
                          ? ` · versão publicada v${site.published_version ?? "—"}`
                          : " · ainda não publicado"}
                      </p>
                    </div>
                    <StatusChip
                      live={live}
                      label={
                        live
                          ? `No ar · v${site.published_version ?? "—"}`
                          : "Rascunho"
                      }
                    />
                  </div>
                  <div className="portal-site-actions">
                    <Link
                      href={`/app/sites/${site.id}`}
                      className="portal-btn portal-btn-primary"
                    >
                      Editar conteúdo
                    </Link>
                    <Link
                      href={`/preview/${site.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="portal-btn portal-btn-ghost"
                    >
                      Ver prévia
                    </Link>
                    <Link
                      href={`/app/sites/${site.id}/blog`}
                      className="portal-btn portal-btn-ghost"
                    >
                      Gerenciar blog
                    </Link>
                  </div>
                </PortalCard>
              );
            })}
          </div>
        )}
      </section>
    </PortalPage>
  );
}
