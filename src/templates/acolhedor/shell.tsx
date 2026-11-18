import { Fraunces, Source_Sans_3 } from "next/font/google";

import {
  formatCouncil,
  previewBannerCss,
  professionalDisplayName,
  whatsappHref,
  type TemplateShellProps,
} from "@/templates/shared";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-acolhedor-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-acolhedor-body",
});

export function AcolhedorShell({
  document,
  banner,
  children,
}: TemplateShellProps) {
  const name = professionalDisplayName(document.professional);
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const council = formatCouncil(document.professional);

  return (
    <div
      className={`${display.variable} ${body.variable} acolhedor-root min-h-full`}
    >
      <style>{`${previewBannerCss}${acolhedorCss}`}</style>
      {banner}
      <header className="acolhedor-header">
        <div className="acolhedor-wrap acolhedor-header-inner">
          <a href="#inicio" className="acolhedor-brand">
            {name}
          </a>
          <nav className="acolhedor-nav" aria-label="Seções">
            <a href="#sobre">Sobre</a>
            <a href="#servicos">Serviços</a>
            <a href="#contato">Contato</a>
          </nav>
          {whatsapp ? (
            <a
              href={whatsapp}
              className="acolhedor-cta"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </header>
      <main>{children}</main>
      <footer className="acolhedor-footer">
        <div className="acolhedor-wrap acolhedor-footer-inner">
          <p className="acolhedor-footer-name">{name}</p>
          {council ? <p className="acolhedor-muted">{council}</p> : null}
          {whatsapp ? (
            <a
              href={whatsapp}
              className="acolhedor-footer-link"
              target="_blank"
              rel="noreferrer"
            >
              Falar no WhatsApp
            </a>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

const acolhedorCss = `
.acolhedor-root {
  --ac-bg: #f3f7f5;
  --ac-surface: #ffffff;
  --ac-ink: #1a2e28;
  --ac-muted: #5b6f67;
  --ac-line: #d5e2db;
  --ac-accent: #2f6f5e;
  --ac-accent-soft: #e4f0eb;
  --ac-hero: linear-gradient(165deg, #1f4d42 0%, #2f6f5e 48%, #6fa892 100%);
  background: var(--ac-bg);
  color: var(--ac-ink);
  font-family: var(--font-acolhedor-body), "Segoe UI", sans-serif;
}
.acolhedor-wrap {
  width: min(1120px, calc(100% - 2.5rem));
  margin-inline: auto;
}
.acolhedor-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--ac-bg) 88%, transparent);
  border-bottom: 1px solid var(--ac-line);
}
.acolhedor-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4rem;
}
.acolhedor-brand {
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ac-ink);
  text-decoration: none;
}
.acolhedor-nav {
  display: none;
  gap: 1.25rem;
}
.acolhedor-nav a {
  color: var(--ac-muted);
  text-decoration: none;
  font-size: 0.95rem;
}
.acolhedor-nav a:hover {
  color: var(--ac-ink);
}
.acolhedor-cta,
.acolhedor-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--ac-accent);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  padding: 0.65rem 1.15rem;
}
.acolhedor-cta:hover,
.acolhedor-button:hover {
  filter: brightness(1.05);
}
.acolhedor-section {
  padding: 4.5rem 0;
}
.acolhedor-section + .acolhedor-section {
  border-top: 1px solid var(--ac-line);
}
.acolhedor-kicker {
  margin: 0 0 0.75rem;
  color: var(--ac-accent);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.acolhedor-title {
  margin: 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
}
.acolhedor-lead,
.acolhedor-body,
.acolhedor-muted {
  color: var(--ac-muted);
}
.acolhedor-lead {
  margin: 1rem 0 0;
  font-size: 1.1rem;
  line-height: 1.7;
  max-width: 40rem;
}
.acolhedor-body {
  margin: 1rem 0 0;
  font-size: 1.05rem;
  line-height: 1.75;
  white-space: pre-wrap;
}
.acolhedor-grid-2 {
  display: grid;
  gap: 1.5rem;
}
.acolhedor-grid-3 {
  display: grid;
  gap: 1.25rem;
}
.acolhedor-list {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}
.acolhedor-item-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}
.acolhedor-item-body {
  margin: 0.4rem 0 0;
  color: var(--ac-muted);
  line-height: 1.65;
}
.acolhedor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.5rem;
}
.acolhedor-tag {
  border: 1px solid var(--ac-line);
  background: var(--ac-surface);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.92rem;
}
.acolhedor-hero {
  background: var(--ac-hero);
  color: #f7fbf9;
  padding: 5rem 0 4.5rem;
}
.acolhedor-hero .acolhedor-lead,
.acolhedor-hero .acolhedor-muted {
  color: color-mix(in srgb, #f7fbf9 82%, transparent);
}
.acolhedor-hero-grid {
  display: grid;
  gap: 2rem;
  align-items: center;
}
.acolhedor-hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.4rem;
}
.acolhedor-badge {
  border: 1px solid color-mix(in srgb, #fff 35%, transparent);
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
}
.acolhedor-media {
  width: 100%;
  border-radius: 1.25rem;
  object-fit: cover;
  aspect-ratio: 4 / 5;
  background: var(--ac-accent-soft);
}
.acolhedor-about-grid {
  display: grid;
  gap: 2rem;
  align-items: center;
}
.acolhedor-credential {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: var(--ac-accent-soft);
  color: var(--ac-accent);
  font-size: 0.9rem;
  font-weight: 600;
}
.acolhedor-footer {
  border-top: 1px solid var(--ac-line);
  background: #eaf2ee;
  padding: 2.5rem 0;
}
.acolhedor-footer-inner {
  display: grid;
  gap: 0.4rem;
}
.acolhedor-footer-name {
  margin: 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: 1.25rem;
}
.acolhedor-footer-link {
  color: var(--ac-accent);
  font-weight: 600;
  text-decoration: none;
  margin-top: 0.5rem;
  width: fit-content;
}
@media (min-width: 768px) {
  .acolhedor-nav { display: flex; }
  .acolhedor-hero-grid,
  .acolhedor-about-grid,
  .acolhedor-grid-2 { grid-template-columns: 1.1fr 0.9fr; }
  .acolhedor-grid-3 { grid-template-columns: repeat(3, 1fr); }
}
`;
