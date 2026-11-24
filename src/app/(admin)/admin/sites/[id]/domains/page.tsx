import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteDomainsPanel } from "@/app/(admin)/admin/sites/site-domains-panel";
import {
  PortalPage,
  PortalPageHeader,
  PortalSection,
  StatusChip,
} from "@/components/portal";
import { hasMinRole, requireAdminProfile } from "@/lib/auth/admin";
import { publicSiteUrl } from "@/lib/sites/host";
import { getSite } from "@/lib/sites/queries";

export const instant = false;

export const metadata: Metadata = {
  title: "Domínios · Site · MindCare",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSiteDomainsPage({ params }: PageProps) {
  const admin = await requireAdminProfile();
  const canManage = hasMinRole(admin.role, "admin");
  const { id } = await params;
  const site = await getSite(id);

  if (!site) {
    notFound();
  }

  const isLive = Boolean(site.live_publication_id);
  const hasPendingChanges = site.has_pending_changes;
  const verifiedCount = site.domains.filter(
    (domain) => domain.verification_status === "verified",
  ).length;
  const primary = site.domains.find((domain) => domain.is_primary);

  return (
    <PortalPage wide className="seo-page">
      <PortalPageHeader
        backHref={`/admin/sites/${id}`}
        backLabel="Voltar ao editor"
        kicker="Domínios"
        title="Domínios e URL pública"
        lead={`${site.name} · host da plataforma e domínio do cliente`}
        meta={
          <StatusChip
            live={isLive}
            pending={hasPendingChanges}
            label={
              hasPendingChanges
                ? `No ar · v${site.published_version ?? "—"} · republicar`
                : isLive
                  ? `No ar · v${site.published_version ?? "—"} · atualizado`
                  : "Rascunho"
            }
          />
        }
        actions={
          <Link
            href={`/preview/${id}`}
            target="_blank"
            rel="noreferrer"
            className="portal-btn portal-btn-primary"
          >
            Ver prévia
          </Link>
        }
      />

      <div className="seo-intro">
        <h2 className="seo-intro-title">O MindCare não vende domínio</h2>
        <p className="seo-intro-body">
          Todo site já tem uma URL na plataforma. Um domínio próprio (ex.:{" "}
          <code className="seo-code">clinica.com.br</code>) é opcional: compra-se
          fora (Registro.br, Cloudflare, GoDaddy, etc.) e depois se aponta para
          a hospedagem. Enquanto isso, o site funciona pela URL da plataforma.
        </p>
      </div>

      <PortalSection
        title="Passo a passo"
        description="O que fazer depois de comprar (ou receber) o domínio do cliente."
      >
        <ol className="seo-guide-steps" style={{ paddingLeft: "1.35rem" }}>
          <li>
            <strong>Compre ou use um domínio existente</strong> em um
            registrador — isso não acontece dentro do MindCare.
          </li>
          <li>
            <strong>No host (ex.: Railway)</strong>, cadastre o domínio no
            serviço do site e espere o certificado SSL. Planos gratuitos podem
            não oferecer domínio customizado; nesse caso use só a URL da
            plataforma.
          </li>
          <li>
            <strong>No DNS do registrador</strong>, aponte o domínio (ou{" "}
            <code className="seo-code">www</code>) para o host — em geral um{" "}
            <strong>CNAME</strong> ou registro <strong>A</strong>, conforme a
            documentação do Railway/hospedagem.
          </li>
          <li>
            <strong>Aqui no MindCare</strong>, adicione o mesmo domínio abaixo
            (ex.: <code className="seo-code">clinica.com.br</code>).
          </li>
          <li>
            Quando DNS + SSL estiverem ok, marque como{" "}
            <strong>verificado</strong> (e configuração ok). Se houver mais de
            um, defina o <strong>principal</strong> — ele entra no SEO
            (canonical).
          </li>
          <li>
            Garanta que o site esteja <strong>publicado</strong>. A “URL atual”
            passa a ser a do domínio próprio.
          </li>
        </ol>
        <p className="portal-hint" style={{ marginTop: "1rem" }}>
          Marque “verificado” só depois que{" "}
          <code className="seo-code">https://seudominio.com</code> abrir o site
          de verdade. Antes disso, a verificação no app seria só um rótulo.
        </p>
      </PortalSection>

      <PortalSection
        title="Resumo deste site"
        description="Estado atual dos hosts."
      >
        <div className="grid gap-3">
          <p className="portal-hint" style={{ margin: 0 }}>
            <strong>URL da plataforma (já funciona):</strong>{" "}
            <a
              href={publicSiteUrl(site.slug)}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:underline"
            >
              {publicSiteUrl(site.slug)}
            </a>
          </p>
          <p className="portal-hint" style={{ margin: 0 }}>
            <strong>Domínios verificados:</strong> {verifiedCount}
            {primary ? ` · principal: ${primary.domain}` : null}
            {verifiedCount === 0
              ? " · nenhum domínio próprio ativo ainda"
              : null}
          </p>
        </div>
      </PortalSection>

      <PortalSection
        title="Gerenciar domínios"
        description="Cadastre o host do cliente só depois de comprar/apontar o DNS. A verificação no MindCare não configura DNS sozinha."
      >
        <SiteDomainsPanel
          siteId={site.id}
          domains={site.domains}
          canManage={canManage}
          platformUrl={publicSiteUrl(site.slug)}
          isLive={isLive}
        />
      </PortalSection>
    </PortalPage>
  );
}
