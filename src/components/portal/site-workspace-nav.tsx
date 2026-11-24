"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SiteWorkspaceArea = "editor" | "seo" | "blog" | "domains";

type SiteWorkspaceNavProps = {
  siteId: string;
  basePath: "/admin" | "/app";
  /** Domínios só no admin por enquanto. */
  showDomains?: boolean;
};

const LABELS: Record<SiteWorkspaceArea, string> = {
  editor: "Página inicial",
  seo: "SEO",
  blog: "Blog",
  domains: "Domínios",
};

function resolveActive(pathname: string, root: string): SiteWorkspaceArea {
  if (pathname.startsWith(`${root}/seo`)) {
    return "seo";
  }
  if (pathname.startsWith(`${root}/blog`)) {
    return "blog";
  }
  if (pathname.startsWith(`${root}/domains`)) {
    return "domains";
  }
  return "editor";
}

export function SiteWorkspaceNav({
  siteId,
  basePath,
  showDomains = basePath === "/admin",
}: SiteWorkspaceNavProps) {
  const pathname = usePathname();
  const root = `${basePath}/sites/${siteId}`;
  const active = resolveActive(pathname, root);

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
          prefetch
        >
          {LABELS[item.area]}
        </Link>
      ))}
    </nav>
  );
}
