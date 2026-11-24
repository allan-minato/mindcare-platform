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
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function PortalPageHeader({
  kicker,
  title,
  lead,
  backHref,
  backLabel = "Voltar",
  actions,
}: PortalPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {backHref ? (
          <Link href={backHref} className="portal-back">
            <span aria-hidden="true">←</span>
            {backLabel}
          </Link>
        ) : null}
        {kicker ? <p className="portal-kicker">{kicker}</p> : null}
        <h1 className="portal-title">{title}</h1>
        {lead ? <p className="portal-lead">{lead}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
