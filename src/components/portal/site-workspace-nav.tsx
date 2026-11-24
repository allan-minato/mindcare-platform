import Link from "next/link";

export type SiteWorkspaceArea = "editor" | "seo" | "blog" | "domains";

type SiteWorkspaceNavProps = {
  siteId: string;
  basePath: "/admin" | "/app";
  active: SiteWorkspaceArea;
  /** Domínios só no admin por enquanto. */
  showDomains?: boolean;
};

const LABELS: Record<SiteWorkspaceArea, string> = {
  editor: "Página inicial",
  seo: "SEO",
  blog: "Blog",
  domains: "Domínios",
};

export function SiteWorkspaceNav({
  siteId,
  basePath,
  active,
  showDomains = basePath === "/admin",
}: SiteWorkspaceNavProps) {
  const root = `${basePath}/sites/${siteId}`;
  const items: Array<{ area: SiteWorkspaceArea; href: string }> = [
    { area: "editor", href: root },
    { area: "seo", href: `${root}/seo` },
    { area: "blog", href: `${root}/blog` },
  ];
  if (showDomains) {
    items.push({ area: "domains", href: `${root}/domains` });
  }

  return (
    <nav className="portal-subnav" aria-label="Áreas do site">
      {items.map((item) => (
        <Link
          key={item.area}
          href={item.href}
          className="portal-subnav-link"
          data-active={item.area === active ? "true" : undefined}
          aria-current={item.area === active ? "page" : undefined}
        >
          {LABELS[item.area]}
        </Link>
      ))}
    </nav>
  );
}
