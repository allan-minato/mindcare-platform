import type { ReactNode } from "react";
import Link from "next/link";

type PortalPageProps = {
  children: ReactNode;
  wide?: boolean;
  className?: string;
};

export function PortalPage({ children, wide = false, className }: PortalPageProps) {
  return (
    <main
      className={`portal-page${wide ? " portal-page-wide" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </main>
  );
}

type PortalPageHeaderProps = {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Status ou metadados sob o lead — não misturar com botões. */
  meta?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Ações primárias (ex.: Ver prévia, Novo post). */
  actions?: ReactNode;
};

export function PortalPageHeader({
  kicker,
  title,
  lead,
  meta,
  backHref,
  backLabel = "Voltar",
  actions,
}: PortalPageHeaderProps) {
  return (
    <header className="portal-page-header">
      <div className="portal-page-header-top">
        <div className="portal-page-header-copy">
          {backHref ? (
            <Link href={backHref} className="portal-back">
              <span aria-hidden="true">←</span>
              {backLabel}
            </Link>
          ) : null}
          {kicker ? <p className="portal-kicker">{kicker}</p> : null}
          <h1 className="portal-title">{title}</h1>
          {lead ? <p className="portal-lead">{lead}</p> : null}
          {meta ? <div className="portal-page-header-meta">{meta}</div> : null}
        </div>
        {actions ? (
          <div className="portal-page-header-actions">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
