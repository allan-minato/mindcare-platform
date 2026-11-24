import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";

import {
  footerNavItems,
  formatCouncil,
  previewBannerCss,
  professionalDisplayName,
  siteHref,
  siteNavItems,
  splitPrimaryNavItems,
  whatsappHref,
  type TemplateShellProps,
} from "@/templates/shared";
import { scrollRevealCss } from "@/templates/scroll-reveal-css";
import {
  SiteMobileNav,
  siteMobileNavCss,
} from "@/templates/site-mobile-nav";
import { SmoothAnchors } from "@/templates/smooth-anchors";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-premium-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-premium-body",
});

export function PremiumShell({
  document,
  banner,
  basePath = "",
  children,
}: TemplateShellProps) {
  const name = professionalDisplayName(document.professional);
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const council = formatCouncil(document.professional);
  const navItems = siteNavItems(document, basePath);
  const { blog: blogItem, menuItems } = splitPrimaryNavItems(navItems);
  const footerNav = footerNavItems(document, basePath);

  return (
    <div
      className={`${display.variable} ${body.variable} premium-root min-h-full`}
    >
      <style>{`${previewBannerCss}${scrollRevealCss}${siteMobileNavCss}${premiumCss}`}</style>
      <SmoothAnchors />
      {banner}
      <div className="premium-top">
        <header className="premium-header">
          <div className="premium-wrap premium-header-inner">
            <a href={siteHref("/", basePath)} className="premium-brand">
              {name}
            </a>
            {navItems.length > 0 ? (
              <nav className="premium-nav" aria-label="Seções">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            ) : null}
            <div className="premium-header-actions">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  className="premium-cta"
                  target="_blank"
                  rel="noreferrer"
                >
                  Agendar
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
              <SiteMobileNav items={menuItems} />
            </div>
          </div>
        </header>
        {blogItem || whatsapp ? (
          <div className="premium-mobile-bar" aria-label="Ações rápidas">
            <div className="premium-wrap premium-mobile-bar-inner">
              {blogItem ? (
                <a href={blogItem.href} className="premium-mobile-bar-blog">
                  Blog
                </a>
              ) : (
                <span />
              )}
              {whatsapp ? (
                <a
                  href={whatsapp}
                  className="premium-mobile-bar-cta"
                  target="_blank"
                  rel="noreferrer"
                >
                  Agendar
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <main>{children}</main>
      <footer className="premium-footer">
        <div className="premium-wrap premium-footer-inner">
          <p className="premium-footer-name">{name}</p>
          {council ? <p className="premium-muted">{council}</p> : null}
          {footerNav.length > 0 ? (
            <nav className="premium-footer-nav" aria-label="Rodapé">
              {footerNav.map((item) => (
                <a key={`${item.label}-${item.href}`} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              className="premium-footer-link"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

const premiumCss = `
.premium-root {
  container-type: inline-size;
  container-name: site;
  --pr-bg: #0a0a0a;
  --pr-surface: #121212;
  --pr-ink: #f3ebe0;
  --pr-muted: #b8a990;
  --pr-line: rgba(196, 165, 116, 0.28);
  --pr-accent: #c9a86c;
  --pr-accent-soft: rgba(201, 168, 108, 0.14);
  --site-nav-bg: #121212;
  --site-nav-ink: var(--pr-ink);
  --site-nav-muted: var(--pr-muted);
  --site-nav-line: rgba(201, 168, 108, 0.45);
  --site-nav-accent: #c9a86c;
  --site-nav-soft: rgba(201, 168, 108, 0.1);
  background: var(--pr-bg);
  color: var(--pr-ink);
  font-family: var(--font-premium-body), "Segoe UI", sans-serif;
  font-weight: 300;
}
.premium-wrap {
  width: min(1120px, calc(100% - 2.5rem));
  margin-inline: auto;
}
.premium-top {
  position: sticky;
  top: 0;
  z-index: 20;
}
.premium-header {
  padding-top: var(--site-safe-top, env(safe-area-inset-top, 0px));
  background: rgba(10, 10, 10, 0.94);
  border-bottom: 1px solid rgba(201, 168, 108, 0.18);
}
.premium-header-inner {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1rem;
  min-height: 4.5rem;
}
.premium-brand {
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--pr-accent);
  text-decoration: none;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}
.premium-nav {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 1.55rem;
}
.premium-nav a {
  color: var(--pr-muted);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  transition: color 0.15s ease;
}
.premium-nav a:hover {
  color: var(--pr-accent);
}
.premium-header-actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 0.55rem;
}
.premium-root .site-mobile-nav-toggle {
  color: #c9a86c;
  border-color: #c9a86c;
  background: rgba(201, 168, 108, 0.08);
}
.premium-cta {
  display: none;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--pr-accent);
  border-radius: 999px;
  color: var(--pr-accent);
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.55rem 1.05rem;
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease;
}
.premium-cta:hover {
  background: var(--pr-accent);
  color: var(--pr-bg);
}
.premium-mobile-bar {
  border-bottom: 1px solid rgba(201, 168, 108, 0.18);
  background: rgba(10, 10, 10, 0.96);
}
.premium-mobile-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 3.1rem;
}
.premium-mobile-bar-blog {
  color: var(--pr-accent);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.premium-mobile-bar-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid var(--pr-accent);
  background: var(--pr-accent);
  color: var(--pr-bg);
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.5rem 0.95rem;
}
.premium-section {
  padding: 4.75rem 0;
  border-bottom: 1px solid rgba(201, 168, 108, 0.14);
}
.premium-kicker {
  margin: 0 0 1rem;
  color: var(--pr-accent);
  font-size: 0.74rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 500;
}
.premium-title {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: clamp(2rem, 3.6cqi, 3rem);
  line-height: 1.12;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--pr-ink);
}
.premium-lead,
.premium-body,
.premium-muted {
  color: var(--pr-muted);
}
.premium-lead {
  margin: 1.25rem 0 0;
  font-size: 1.02rem;
  line-height: 1.75;
  max-width: 36rem;
  font-weight: 300;
}
.premium-body {
  margin: 1.25rem 0 0;
  font-size: 1.02rem;
  line-height: 1.8;
  white-space: pre-wrap;
}
.premium-hero {
  position: relative;
  padding: 3.5rem 0 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse 55% 70% at 85% 40%, rgba(201, 168, 108, 0.08), transparent 55%),
    linear-gradient(180deg, #0d0d0d 0%, var(--pr-bg) 100%);
  border-bottom: none;
}
.premium-hero-grid {
  display: grid;
  gap: 2.25rem;
  align-items: end;
}
.premium-hero-copy {
  padding-bottom: 2.25rem;
  z-index: 1;
  max-width: 34rem;
}
.premium-hero-title {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: clamp(2.55rem, 5.4cqi, 4.25rem);
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #e8d5a8 0%, var(--pr-accent) 45%, #9a7a45 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.premium-hero-support {
  margin-top: 1.1rem;
  max-width: 28rem;
  font-size: 1rem;
  line-height: 1.65;
}
.premium-hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin: 1.75rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid rgba(201, 168, 108, 0.22);
  border-bottom: 1px solid rgba(201, 168, 108, 0.22);
}
.premium-hero-feature {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.85rem 1rem 0.85rem 0;
  color: var(--pr-accent);
  font-size: 0.76rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.premium-hero-feature + .premium-hero-feature {
  border-left: 1px solid rgba(201, 168, 108, 0.22);
  padding-left: 1rem;
}
.premium-hero-feature-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
  opacity: 0.88;
}
.premium-hero-signoff {
  margin-top: 2rem;
}
.premium-hero-signature {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-style: italic;
  font-size: clamp(1.85rem, 3.1cqi, 2.45rem);
  font-weight: 400;
  color: var(--pr-accent);
  letter-spacing: 0.02em;
  line-height: 1;
}
.premium-hero-credential {
  margin: 0.4rem 0 0;
  color: var(--pr-muted);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 400;
}
.premium-hero-media-wrap {
  position: relative;
  justify-self: stretch;
  isolation: isolate;
  background: #050505;
}
.premium-hero-media-wrap::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(10, 10, 10, 0.72) 0%, rgba(10, 10, 10, 0.15) 42%, transparent 62%),
    linear-gradient(180deg, transparent 55%, rgba(10, 10, 10, 0.88) 100%),
    radial-gradient(ellipse at 70% 30%, transparent 40%, rgba(10, 10, 10, 0.45) 100%);
}
.premium-media {
  width: 100%;
  border-radius: 0;
  object-fit: cover;
  object-position: center top;
  aspect-ratio: 4 / 5;
  border: none;
  display: block;
  filter: saturate(0.78) contrast(1.08) brightness(0.82);
}
.premium-hero-media {
  max-height: min(78vh, 640px);
  aspect-ratio: 3 / 4;
}
.premium-hero-seal {
  position: absolute;
  left: 0.75rem;
  bottom: 14%;
  z-index: 2;
  width: 7.4rem;
  height: 7.4rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1.5px solid var(--pr-accent);
  background: rgba(10, 10, 10, 0.72);
  box-shadow: 0 0 0 5px rgba(10, 10, 10, 0.4);
  color: var(--pr-accent);
  text-align: center;
  padding: 0.85rem;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.25;
  text-transform: uppercase;
  transform: rotate(-8deg);
}
.premium-identify {
  padding: 3rem 0 3.5rem;
  border-top: 1px solid var(--pr-accent);
  background: var(--pr-bg);
}
.premium-identify-title {
  margin: 0 0 1.75rem;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: clamp(1.55rem, 2.8cqi, 2.15rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--pr-accent);
  max-width: 28rem;
  line-height: 1.2;
}
.premium-identify-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}
.premium-identify-card {
  padding: 1.25rem 1.3rem;
  border: 1px solid rgba(201, 168, 108, 0.22);
  background: rgba(201, 168, 108, 0.04);
}
.premium-identify-card-title {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--pr-ink);
  line-height: 1.3;
}
.premium-identify-card-body {
  margin: 0.45rem 0 0;
  color: var(--pr-muted);
  font-size: 0.92rem;
  line-height: 1.55;
  font-weight: 300;
}
.premium-list {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}
.premium-grid-2,
.premium-grid-3 {
  display: grid;
  gap: 1rem;
}
.premium-item {
  background: transparent;
  border: 1px solid rgba(201, 168, 108, 0.2);
  border-radius: 0;
  padding: 1.35rem 1.4rem;
}
.premium-item-title {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.35rem;
  color: var(--pr-accent);
  font-weight: 400;
}
.premium-item-body {
  margin: 0.5rem 0 0;
  color: var(--pr-muted);
  line-height: 1.65;
  font-weight: 300;
}
.premium-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.75rem;
}
.premium-tag {
  border: 1px solid rgba(201, 168, 108, 0.35);
  color: var(--pr-accent);
  padding: 0.4rem 0.85rem;
  font-size: 0.84rem;
  border-radius: 999px;
  background: transparent;
}
.premium-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.75rem;
  border: 1px solid var(--pr-accent);
  border-radius: 999px;
  color: var(--pr-accent);
  background: transparent;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.84rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.75rem 1.25rem;
  transition: background 0.15s ease, color 0.15s ease;
}
.premium-button:hover {
  background: var(--pr-accent);
  color: var(--pr-bg);
}
.premium-footer {
  padding: 3rem 0;
  background: #050505;
  border-top: 1px solid rgba(201, 168, 108, 0.16);
}
.premium-footer-inner {
  display: grid;
  gap: 0.4rem;
}
.premium-footer-name {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.35rem;
  color: var(--pr-accent);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.premium-footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1.1rem;
  margin-top: 0.85rem;
}
.premium-footer-nav a {
  color: var(--pr-muted);
  text-decoration: none;
  font-size: 0.84rem;
}
.premium-footer-nav a:hover {
  color: var(--pr-accent);
}
.premium-footer-link {
  color: var(--pr-accent);
  text-decoration: none;
  width: fit-content;
  margin-top: 0.35rem;
}
@container site (min-width: 900px) {
  .premium-header-inner {
    grid-template-columns: 1fr auto 1fr;
  }
  .premium-nav { display: flex; }
  .premium-cta { display: inline-flex; }
  .premium-mobile-bar { display: none; }
  .site-mobile-nav { display: none; }
  .premium-hero {
    padding: 2.5rem 0 0;
  }
  .premium-hero-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 2rem 1.5rem;
    align-items: end;
  }
  .premium-hero-copy {
    padding-bottom: 3.25rem;
    max-width: none;
  }
  .premium-hero-media {
    max-height: min(82vh, 700px);
  }
  .premium-identify-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.15rem;
  }
  .premium-identify {
    padding: 3.5rem 0 4rem;
  }
  .premium-grid-2 { grid-template-columns: 1fr 1fr; }
  .premium-grid-3 { grid-template-columns: repeat(3, 1fr); }
}
`;
