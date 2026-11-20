import type { Metadata } from "next";
import Link from "next/link";

import {
  PortalCard,
  PortalPage,
  PortalPageHeader,
} from "@/components/portal";
import { listProfessionals } from "@/lib/professionals/queries";
import { listSites } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Painel · MindCare",
};

export default async function AdminPage() {
  const [professionals, sites] = await Promise.all([
    listProfessionals(),
    listSites(),
  ]);

  const liveSites = sites.filter((site) => site.live_publication_id).length;
  const draftSites = sites.length - liveSites;

  return (
    <PortalPage>
      <PortalPageHeader
        kicker="Admin"
        title={
          <>
            Painel{" "}
            <em style={{ fontStyle: "italic", color: "var(--portal-gold)" }}>
              MindCare
            </em>
          </>
        }
        lead="Duas áreas distintas: as pessoas (profissionais) e os sites públicos que elas usam."
      />

      <div className="portal-hub-grid">
        <PortalCard className="portal-hub-card">
          <div className="portal-hub-card-top">
            <div>
              <p className="portal-hub-eyebrow">1 · Pessoas</p>
              <h2 className="portal-hub-title">Profissionais</h2>
              <p className="portal-hub-lead">
                Quem atende. Cadastro, CRP, contato, foto e acesso ao portal do
                profissional.
              </p>
            </div>
            <span className="portal-hub-count">
              <strong>{professionals.length}</strong>
              {professionals.length === 1 ? "cadastrado" : "cadastrados"}
            </span>
          </div>

          <ul className="portal-hub-points">
            <li>Dados públicos que alimentam o site (nome, bio, WhatsApp)</li>
            <li>Convite e gestão do acesso ao portal do profissional</li>
            <li>Arquivar ou reativar o cadastro</li>
          </ul>

          <div className="portal-hub-actions">
            <Link
              href="/admin/professionals"
              className="portal-btn portal-btn-primary"
            >
              Ver profissionais
            </Link>
            <Link
              href="/admin/professionals/new"
              className="portal-btn portal-btn-ghost"
            >
              Cadastrar profissional
            </Link>
          </div>
        </PortalCard>

        <PortalCard className="portal-hub-card">
          <div className="portal-hub-card-top">
            <div>
              <p className="portal-hub-eyebrow">2 · Presença online</p>
              <h2 className="portal-hub-title">Sites</h2>
              <p className="portal-hub-lead">
                A página pública. Template, textos, blog, domínio e publicação
                do snapshot no ar.
              </p>
            </div>
            <span className="portal-hub-count">
              <strong>{sites.length}</strong>
              {sites.length === 1 ? "site" : "sites"}
              {sites.length > 0 ? (
                <span style={{ fontWeight: 500, color: "var(--portal-muted)" }}>
                  · {liveSites} no ar
                  {draftSites > 0
                    ? ` · ${draftSites} ${draftSites === 1 ? "rascunho" : "rascunhos"}`
                    : ""}
                </span>
              ) : null}
            </span>
          </div>

          <ul className="portal-hub-points">
            <li>Editar seções da home e artigos do blog</li>
            <li>Cadastrar domínio personalizado</li>
            <li>Publicar / republicar o site para o visitante ver</li>
          </ul>

          <div className="portal-hub-actions">
            <Link href="/admin/sites" className="portal-btn portal-btn-primary">
              Ver sites
            </Link>
            <Link href="/admin/sites/new" className="portal-btn portal-btn-ghost">
              Criar site
            </Link>
          </div>
        </PortalCard>
      </div>
    </PortalPage>
  );
}
