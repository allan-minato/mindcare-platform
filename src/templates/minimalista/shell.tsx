import { Instrument_Sans, Instrument_Serif } from "next/font/google";

import {
  formatCouncil,
  previewBannerCss,
  professionalDisplayName,
  scrollRevealCss,
  siteNavItems,
  whatsappHref,
  type TemplateShellProps,
} from "@/templates/shared";
import { SmoothAnchors } from "@/templates/smooth-anchors";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-minimalista-display",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-minimalista-body",
});

export function MinimalistaShell({
  document,
  banner,
  children,
}: TemplateShellProps) {
  const name = professionalDisplayName(document.professional);
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const council = formatCouncil(document.professional);
  const navItems = siteNavItems(document);

  return (
    <div
      className={`${display.variable} ${body.variable} minimalista-root min-h-full`}
    >
      <style>{`${previewBannerCss}${scrollRevealCss}${minimalistaCss}`}</style>
      <SmoothAnchors />
      {banner}
      <header className="minimalista-header">
        <div className="minimalista-wrap minimalista-header-inner">
          <a href="#inicio" className="minimalista-brand">
            {name}
          </a>
          {navItems.length > 0 ? (
            <nav className="minimalista-nav" aria-label="Seções">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              className="minimalista-cta"
              target="_blank"
              rel="noreferrer"
            >
              Contato
            </a>
          ) : null}
        </div>
      </header>
      <main>{children}</main>
      <footer className="minimalista-footer">
        <div className="minimalista-wrap minimalista-footer-inner">
          <p className="minimalista-footer-name">{name}</p>
          {council ? <p className="minimalista-muted">{council}</p> : null}
        </div>
      </footer>
    </div>
  );
}

const minimalistaCss = `
.minimalista-root {
  container-type: inline-size;
  container-name: site;
  --mn-bg: #fafafa;
  --mn-ink: #171717;
  --mn-muted: #737373;
  --mn-line: #e5e5e5;
  --mn-accent: #262626;
  background: var(--mn-bg);
  color: var(--mn-ink);
  font-family: var(--font-minimalista-body), "Segoe UI", sans-serif;
}
.minimalista-wrap {
  width: min(720px, calc(100% - 2.5rem));
  margin-inline: auto;
}
.minimalista-header {
  border-bottom: 1px solid var(--mn-line);
  background: var(--mn-bg);
  padding-top: var(--site-safe-top, env(safe-area-inset-top, 0px));
}
.minimalista-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.5rem;
}
.minimalista-brand {
  font-family: var(--font-minimalista-display), Georgia, serif;
  font-size: 1.35rem;
  color: var(--mn-ink);
  text-decoration: none;
  letter-spacing: -0.02em;
}
.minimalista-nav {
  display: none;
  gap: 1.5rem;
}
.minimalista-nav a {
  color: var(--mn-muted);
  text-decoration: none;
  font-size: 0.9rem;
}
.minimalista-cta {
  color: var(--mn-ink);
  text-decoration: none;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--mn-ink);
  padding-bottom: 0.1rem;
}
.minimalista-section {
  padding: 5rem 0;
  border-bottom: 1px solid var(--mn-line);
}
.minimalista-kicker {
  margin: 0 0 1rem;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mn-muted);
}
.minimalista-title {
  margin: 0;
  font-family: var(--font-minimalista-display), Georgia, serif;
  font-size: clamp(2rem, 4cqi, 3rem);
  line-height: 1.15;
  font-weight: 400;
  letter-spacing: -0.03em;
}
.minimalista-lead,
.minimalista-body,
.minimalista-muted {
  color: var(--mn-muted);
}
.minimalista-lead {
  margin: 1.25rem 0 0;
  font-size: 1.125rem;
  line-height: 1.7;
  max-width: 36rem;
}
.minimalista-body {
  margin: 1.25rem 0 0;
  font-size: 1.05rem;
  line-height: 1.8;
  white-space: pre-wrap;
}
.minimalista-hero {
  padding: 6rem 0 5rem;
  border-bottom: 1px solid var(--mn-line);
}
.minimalista-hero-media {
  margin-top: 2.5rem;
  width: 100%;
  max-height: 28rem;
  object-fit: cover;
  filter: grayscale(1);
}
.minimalista-list {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: grid;
  gap: 1.75rem;
}
.minimalista-item-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}
.minimalista-item-body {
  margin: 0.35rem 0 0;
  color: var(--mn-muted);
  line-height: 1.65;
}
.minimalista-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  margin-top: 1.75rem;
}
.minimalista-tag {
  font-size: 0.95rem;
  color: var(--mn-ink);
  border-bottom: 1px solid var(--mn-line);
  padding-bottom: 0.15rem;
}
.minimalista-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: var(--mn-ink);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid var(--mn-ink);
}
.minimalista-footer {
  padding: 3rem 0;
}
.minimalista-footer-inner {
  display: grid;
  gap: 0.35rem;
}
.minimalista-footer-name {
  margin: 0;
  font-family: var(--font-minimalista-display), Georgia, serif;
  font-size: 1.25rem;
}
@container site (min-width: 768px) {
  .minimalista-nav { display: flex; }
}
`;
