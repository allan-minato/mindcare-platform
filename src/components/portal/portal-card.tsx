import type { ReactNode } from "react";

type PortalCardProps = {
  children: ReactNode;
  quiet?: boolean;
  className?: string;
};

export function PortalCard({ children, quiet = false, className }: PortalCardProps) {
  return (
    <div
      className={`portal-card${quiet ? " portal-card-quiet" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
}

type PortalSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PortalSection({
  title,
  description,
  children,
}: PortalSectionProps) {
  return (
    <section className="portal-section">
      <div className="portal-section-head">
        <h2 className="portal-section-title">{title}</h2>
        {description ? (
          <p className="portal-section-desc">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
