import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";

import {
  formatCouncil,
  previewBannerCss,
  professionalDisplayName,
  whatsappHref,
  type TemplateShellProps,
} from "@/templates/shared";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-premium-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-premium-body",
});

export function PremiumShell({
  document,
  banner,
  children,
}: TemplateShellProps) {
  const name = professionalDisplayName(document.professional);
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const council = formatCouncil(document.professional);

  return (
    <div
      className={`${display.variable} ${body.variable} premium-root min-h-full`}
    >
      <style>{`${previewBannerCss}${premiumCss}`}</style>
      {banner}
      <header className="premium-header">
        <div className="premium-wrap premium-header-inner">
          <a href="#inicio" className="premium-brand">
            {name}
          </a>
          <nav className="premium-nav" aria-label="Seções">
            <a href="#sobre">Sobre</a>
            <a href="#servicos">Serviços</a>
            <a href="#contato">Contato</a>
          </nav>
          {whatsapp ? (
            <a
              href={whatsapp}
              className="premium-cta"
              target="_blank"
              rel="noreferrer"
            >
              Agendar
            </a>
          ) : null}
        </div>
      </header>
      <main>{children}</main>
      <footer className="premium-footer">
        <div className="premium-wrap premium-footer-inner">
          <p className="premium-footer-name">{name}</p>
          {council ? <p className="premium-muted">{council}</p> : null}
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
  --pr-bg: #0f1419;
  --pr-surface: #171e26;
  --pr-ink: #f2ebe3;
  --pr-muted: #b7aea3;
  --pr-line: #2a3340;
  --pr-accent: #c4a574;
  background: var(--pr-bg);
  color: var(--pr-ink);
  font-family: var(--font-premium-body), "Segoe UI", sans-serif;
}
.premium-wrap {
  width: min(1080px, calc(100% - 2.5rem));
  margin-inline: auto;
}
.premium-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--pr-bg) 88%, transparent);
  border-bottom: 1px solid var(--pr-line);
}
.premium-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.25rem;
}
.premium-brand {
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--pr-ink);
  text-decoration: none;
  letter-spacing: -0.02em;
}
.premium-nav {
  display: none;
  gap: 1.4rem;
}
.premium-nav a {
  color: var(--pr-muted);
  text-decoration: none;
  font-size: 0.92rem;
}
.premium-cta {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--pr-accent);
  color: var(--pr-accent);
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.55rem 1rem;
}
.premium-section {
  padding: 5rem 0;
  border-bottom: 1px solid var(--pr-line);
}
.premium-kicker {
  margin: 0 0 1rem;
  color: var(--pr-accent);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.premium-title {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  line-height: 1.1;
  font-weight: 400;
  letter-spacing: -0.03em;
}
.premium-lead,
.premium-body,
.premium-muted {
  color: var(--pr-muted);
}
.premium-lead {
  margin: 1.25rem 0 0;
  font-size: 1.15rem;
  line-height: 1.75;
  max-width: 38rem;
}
.premium-body {
  margin: 1.25rem 0 0;
  font-size: 1.05rem;
  line-height: 1.8;
  white-space: pre-wrap;
}
.premium-hero {
  padding: 6.5rem 0 5.5rem;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(196, 165, 116, 0.18), transparent 45%),
    linear-gradient(180deg, #121820 0%, var(--pr-bg) 100%);
  border-bottom: 1px solid var(--pr-line);
}
.premium-hero-grid {
  display: grid;
  gap: 2.5rem;
  align-items: center;
}
.premium-media {
  width: 100%;
  border-radius: 0.25rem;
  object-fit: cover;
  aspect-ratio: 4 / 5;
  border: 1px solid var(--pr-line);
}
.premium-list {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
}
.premium-grid-2,
.premium-grid-3 {
  display: grid;
  gap: 1.25rem;
}
.premium-item {
  background: var(--pr-surface);
  border: 1px solid var(--pr-line);
  padding: 1.25rem 1.35rem;
}
.premium-item-title {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.35rem;
}
.premium-item-body {
  margin: 0.45rem 0 0;
  color: var(--pr-muted);
  line-height: 1.65;
}
.premium-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.75rem;
}
.premium-tag {
  border: 1px solid var(--pr-line);
  color: var(--pr-ink);
  padding: 0.4rem 0.85rem;
  font-size: 0.9rem;
}
.premium-button {
  display: inline-flex;
  margin-top: 1.75rem;
  border: 1px solid var(--pr-accent);
  color: var(--pr-bg);
  background: var(--pr-accent);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  padding: 0.75rem 1.25rem;
}
.premium-footer {
  padding: 3rem 0;
  background: #0b1015;
}
.premium-footer-inner {
  display: grid;
  gap: 0.4rem;
}
.premium-footer-name {
  margin: 0;
  font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.4rem;
}
.premium-footer-link {
  color: var(--pr-accent);
  text-decoration: none;
  width: fit-content;
  margin-top: 0.35rem;
}
@media (min-width: 768px) {
  .premium-nav { display: flex; }
  .premium-hero-grid { grid-template-columns: 1.15fr 0.85fr; }
  .premium-grid-2 { grid-template-columns: 1fr 1fr; }
  .premium-grid-3 { grid-template-columns: repeat(3, 1fr); }
}
`;
