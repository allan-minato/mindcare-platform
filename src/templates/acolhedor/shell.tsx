import { Cormorant_Garamond, Outfit } from "next/font/google";

import {
  formatCouncil,
  previewBannerCss,
  professionalDisplayName,
  whatsappHref,
  type TemplateShellProps,
} from "@/templates/shared";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-acolhedor-display",
});

const body = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
  const specialty = document.professional.specialty?.trim();
  const brandRole = [specialty || "Psicólogo", council]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={`${display.variable} ${body.variable} acolhedor-root min-h-full`}
    >
      <style>{`${previewBannerCss}${acolhedorCss}`}</style>
      {banner}
      <header className="acolhedor-header">
        <div className="acolhedor-wrap acolhedor-header-inner">
          <a href="#inicio" className="acolhedor-brand">
            <span className="acolhedor-brand-name">{name}</span>
            <span className="acolhedor-brand-role">{brandRole}</span>
          </a>
          <nav className="acolhedor-nav" aria-label="Seções">
            <a href="#sobre">Sobre</a>
            <a href="#servicos">Serviços</a>
            <a href="#contato">Contato</a>
          </nav>
          {whatsapp ? (
            <a
              href={whatsapp}
              className="acolhedor-btn"
              target="_blank"
              rel="noreferrer"
            >
              Entrar em contato
            </a>
          ) : null}
        </div>
      </header>
      <main>{children}</main>
      <footer className="acolhedor-footer">
        <div className="acolhedor-wrap acolhedor-footer-inner">
          <p className="acolhedor-footer-name">{name}</p>
          {council ? <p className="acolhedor-footer-muted">{council}</p> : null}
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
  --ac-ink: #121212;
  --ac-ink-soft: #1d1d1d;
  --ac-paper: #fafafa;
  --ac-paper-warm: #f3efe7;
  --ac-gold: #b89a6a;
  --ac-gold-deep: #7a6440;
  --ac-gold-soft: rgba(184, 154, 106, 0.12);
  --ac-line: rgba(18, 18, 18, 0.12);
  --ac-line-light: rgba(250, 250, 250, 0.14);
  --ac-muted: #5c5751;
  --ac-muted-dark: rgba(250, 250, 250, 0.62);
  --ac-radius: 4px;
  --ac-radius-lg: 14px;
  --ac-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ac-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ac-shadow: 0 18px 50px -24px rgba(18, 18, 18, 0.4);
  --ac-step--1: clamp(0.83rem, 0.78rem + 0.2vw, 0.95rem);
  --ac-step-0: clamp(1rem, 0.95rem + 0.25vw, 1.13rem);
  --ac-step-1: clamp(1.2rem, 1.1rem + 0.5vw, 1.5rem);
  --ac-step-2: clamp(1.6rem, 1.4rem + 1vw, 2.25rem);
  --ac-step-3: clamp(2.2rem, 1.8rem + 2vw, 3.4rem);
  --ac-step-4: clamp(2.9rem, 2.2rem + 3.5vw, 5.5rem);
  background: var(--ac-paper);
  color: var(--ac-ink);
  font-family: var(--font-acolhedor-body), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: var(--ac-step-0);
  font-weight: 300;
  letter-spacing: 0.01em;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
.acolhedor-wrap {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 5vw, 3rem);
}
.acolhedor-wrap-narrow {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 5vw, 3rem);
}
.acolhedor-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  padding-block: 1.25rem;
  background: rgba(250, 250, 250, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 1px 0 var(--ac-line);
}
.acolhedor-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.acolhedor-brand {
  display: flex;
  flex-direction: column;
  line-height: 1;
  text-decoration: none;
  color: var(--ac-ink);
}
.acolhedor-brand-name {
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.acolhedor-brand-role {
  margin-top: 0.25rem;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--ac-gold-deep);
}
.acolhedor-nav {
  display: none;
  align-items: center;
  gap: clamp(1.2rem, 2.5vw, 2.4rem);
}
.acolhedor-nav a {
  position: relative;
  color: var(--ac-ink);
  text-decoration: none;
  font-size: var(--ac-step--1);
  padding-block: 0.25rem;
}
.acolhedor-nav a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--ac-gold);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s var(--ac-ease);
}
.acolhedor-nav a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
.acolhedor-btn {
  --btn-bg: var(--ac-ink);
  --btn-fg: var(--ac-paper);
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.9rem;
  isolation: isolate;
  overflow: hidden;
  border-radius: var(--ac-radius);
  border: 1px solid var(--btn-bg);
  background: var(--btn-bg);
  color: var(--btn-fg);
  text-decoration: none;
  font-size: var(--ac-step--1);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: color 0.3s var(--ac-ease), border-color 0.3s var(--ac-ease);
}
.acolhedor-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--ac-gold);
  transform: translateY(101%);
  transition: transform 0.3s var(--ac-ease-out);
}
.acolhedor-btn:hover {
  color: var(--ac-ink);
  border-color: var(--ac-gold);
}
.acolhedor-btn:hover::after {
  transform: translateY(0);
}
.acolhedor-btn-ghost {
  --btn-bg: transparent;
  --btn-fg: var(--ac-ink);
  background: transparent;
  border-color: var(--ac-line);
}
.acolhedor-btn-ghost::after {
  background: var(--ac-gold-soft);
}
.acolhedor-btn-light {
  --btn-bg: var(--ac-paper);
  --btn-fg: var(--ac-ink);
  background: var(--ac-paper);
  border-color: var(--ac-paper);
}
.acolhedor-btn-on-dark {
  --btn-bg: transparent;
  --btn-fg: var(--ac-paper);
  background: transparent;
  border-color: var(--ac-line-light);
}
.acolhedor-btn-on-dark:hover {
  color: var(--ac-ink);
  border-color: var(--ac-gold);
}
.acolhedor-section {
  padding-block: clamp(4rem, 8vw, 8rem);
  background: var(--ac-paper);
}
.acolhedor-section-warm {
  background: var(--ac-paper-warm);
}
.acolhedor-section-dark {
  background: var(--ac-ink);
  color: var(--ac-paper);
}
.acolhedor-section-dark .acolhedor-title {
  color: var(--ac-paper);
}
.acolhedor-section-dark .acolhedor-lead,
.acolhedor-section-dark .acolhedor-body,
.acolhedor-section-dark .acolhedor-item-body {
  color: var(--ac-muted-dark);
}
.acolhedor-section-dark .acolhedor-kicker {
  color: var(--ac-gold);
}
.acolhedor-section-dark .acolhedor-kicker::before {
  background: var(--ac-gold);
}
.acolhedor-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1rem;
  color: var(--ac-gold-deep);
  font-size: var(--ac-step--1);
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.acolhedor-kicker::before {
  content: "";
  width: 28px;
  height: 1px;
  background: var(--ac-gold);
}
.acolhedor-title {
  margin: 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-3);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -0.01em;
  max-width: 18ch;
  color: var(--ac-ink);
}
.acolhedor-title-wide {
  max-width: 22ch;
}
.acolhedor-lead {
  margin: 1.25rem 0 0;
  max-width: 56ch;
  color: var(--ac-muted);
  font-size: var(--ac-step-1);
  font-weight: 300;
  line-height: 1.55;
}
.acolhedor-body {
  margin: 1.1rem 0 0;
  max-width: 56ch;
  color: var(--ac-muted);
  font-size: var(--ac-step-0);
  font-weight: 300;
  line-height: 1.75;
  white-space: pre-wrap;
}
.acolhedor-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 7.5rem 0 4rem;
  overflow: hidden;
  background: var(--ac-paper);
}
.acolhedor-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, var(--ac-line) 1px, transparent 0);
  background-size: 40px 40px;
  opacity: 0.45;
  mask-image: radial-gradient(ellipse 80% 60% at 70% 40%, #000, transparent);
  pointer-events: none;
}
.acolhedor-hero::after {
  content: "";
  position: absolute;
  width: min(60vw, 720px);
  height: min(60vw, 720px);
  right: -10%;
  top: 10%;
  background: radial-gradient(circle, var(--ac-gold-soft), transparent 65%);
  filter: blur(10px);
  pointer-events: none;
}
.acolhedor-hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 3rem;
  align-items: center;
}
.acolhedor-hero .acolhedor-title {
  font-size: var(--ac-step-4);
  max-width: 14ch;
}
.acolhedor-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2.5rem;
}
.acolhedor-hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  margin-top: 3rem;
  padding-top: 0;
  border: 0;
}
.acolhedor-badge {
  display: flex;
  flex-direction: column;
}
.acolhedor-badge-label {
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-2);
  font-weight: 600;
  color: var(--ac-ink);
}
.acolhedor-badge-detail {
  font-size: var(--ac-step--1);
  color: var(--ac-muted);
  letter-spacing: 0.04em;
}
.acolhedor-media-frame {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: var(--ac-radius-lg);
  overflow: hidden;
  background: linear-gradient(160deg, var(--ac-ink), var(--ac-ink-soft));
  box-shadow: var(--ac-shadow);
}
.acolhedor-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.acolhedor-about-grid {
  display: grid;
  gap: 3rem;
  align-items: start;
}
.acolhedor-about-visual {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--ac-radius-lg);
  overflow: hidden;
  background: var(--ac-paper-warm);
  border: 1px solid var(--ac-line);
}
.acolhedor-credential {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: var(--ac-step--1);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ac-muted);
}
.acolhedor-list {
  list-style: none;
  margin: 2rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}
.acolhedor-list-plain > li {
  position: relative;
  padding-left: 1.5rem;
  line-height: 1.65;
}
.acolhedor-list-plain > li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ac-gold);
}
.acolhedor-section-dark .acolhedor-list-plain > li {
  color: var(--ac-muted-dark);
}
.acolhedor-section-dark .acolhedor-list-plain > li strong {
  color: var(--ac-paper);
  font-weight: 500;
}
.acolhedor-list-rows {
  gap: 0;
  margin-top: 2.5rem;
}
.acolhedor-list-rows > li {
  display: grid;
  gap: 0.25rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--ac-line);
}
.acolhedor-list-rows > li:last-child {
  border-bottom: none;
}
.acolhedor-section-dark .acolhedor-list-rows > li {
  border-bottom-color: var(--ac-line-light);
}
.acolhedor-list-cards {
  margin-top: 3rem;
  gap: 1.5rem;
}
.acolhedor-list-cards > li {
  position: relative;
  padding: 2.5rem 2.25rem;
  border-radius: var(--ac-radius-lg);
  background: var(--ac-ink-soft);
  border: 1px solid var(--ac-line-light);
  overflow: hidden;
  transition: transform 0.3s var(--ac-ease-out), border-color 0.3s var(--ac-ease);
}
.acolhedor-list-cards > li:hover {
  transform: translateY(-6px);
  border-color: rgba(184, 154, 106, 0.5);
}
.acolhedor-item-title {
  margin: 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-2);
  font-weight: 500;
  letter-spacing: -0.01em;
}
.acolhedor-list-rows .acolhedor-item-title {
  font-family: var(--font-acolhedor-body), sans-serif;
  font-size: var(--ac-step-0);
  font-weight: 500;
  letter-spacing: 0;
}
.acolhedor-item-body {
  margin: 0.4rem 0 0;
  color: var(--ac-muted);
  font-size: var(--ac-step--1);
  line-height: 1.65;
}
.acolhedor-list-cards .acolhedor-item-title {
  color: var(--ac-paper);
}
.acolhedor-list-cards .acolhedor-item-body {
  margin-top: 1rem;
  color: var(--ac-muted-dark);
  font-size: var(--ac-step-0);
}
.acolhedor-grid-2,
.acolhedor-grid-3 {
  display: grid;
  gap: 1.5rem;
}
.acolhedor-steps {
  margin-top: 3rem;
  display: grid;
  gap: 2rem;
  counter-reset: step;
}
.acolhedor-steps > li {
  position: relative;
  padding-top: 4rem;
}
.acolhedor-steps > li::before {
  counter-increment: step;
  content: "0" counter(step);
  position: absolute;
  top: -1rem;
  left: 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-3);
  color: var(--ac-gold);
  opacity: 0.4;
}
.acolhedor-steps > li::after {
  content: "";
  position: absolute;
  top: 0.4rem;
  left: 0;
  width: 40px;
  height: 1px;
  background: var(--ac-gold);
}
.acolhedor-steps .acolhedor-item-title {
  font-size: var(--ac-step-1);
  margin-bottom: 0.4rem;
}
.acolhedor-specialty-grid {
  margin-top: 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1px;
  background: var(--ac-line);
  border: 1px solid var(--ac-line);
  border-radius: var(--ac-radius-lg);
  overflow: hidden;
}
.acolhedor-specialty {
  background: var(--ac-paper);
  padding: 2rem;
  font-family: var(--font-acolhedor-body), sans-serif;
  font-size: var(--ac-step-0);
  font-weight: 500;
}
.acolhedor-specialty:hover {
  background: var(--ac-paper-warm);
}
.acolhedor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.75rem;
}
.acolhedor-tag {
  border: 1px solid var(--ac-line);
  border-radius: 999px;
  padding: 0.5rem 0.95rem;
  font-size: 0.88rem;
  color: var(--ac-ink);
  text-decoration: none;
}
.acolhedor-cta {
  padding-block: clamp(4rem, 8vw, 8rem);
  background: var(--ac-paper);
}
.acolhedor-cta-inner {
  position: relative;
  text-align: center;
  padding: clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 5vw, 4rem);
  border-radius: var(--ac-radius-lg);
  background: var(--ac-ink);
  color: var(--ac-paper);
  overflow: hidden;
}
.acolhedor-cta-inner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 50% 80% at 50% 120%, var(--ac-gold-soft), transparent 70%);
  pointer-events: none;
}
.acolhedor-cta-inner > * {
  position: relative;
}
.acolhedor-cta-inner .acolhedor-title {
  margin-inline: auto;
  color: var(--ac-paper);
  max-width: 20ch;
}
.acolhedor-cta-inner .acolhedor-lead,
.acolhedor-cta-inner .acolhedor-body {
  margin-inline: auto;
  color: var(--ac-muted-dark);
}
.acolhedor-cta-inner .acolhedor-kicker {
  color: var(--ac-gold);
}
.acolhedor-cta-inner .acolhedor-kicker::before {
  background: var(--ac-gold);
}
.acolhedor-cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}
.acolhedor-footer {
  background: var(--ac-ink);
  color: var(--ac-paper);
  padding: 3.5rem 0;
}
.acolhedor-footer-inner {
  display: grid;
  gap: 0.45rem;
}
.acolhedor-footer-name {
  margin: 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-2);
  font-weight: 500;
}
.acolhedor-footer-muted {
  margin: 0;
  color: var(--ac-muted-dark);
}
.acolhedor-footer-link {
  margin-top: 0.85rem;
  width: fit-content;
  color: var(--ac-gold);
  font-size: var(--ac-step--1);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
}
@media (min-width: 768px) {
  .acolhedor-nav { display: flex; }
  .acolhedor-hero-grid { grid-template-columns: 1.15fr 0.85fr; gap: 4rem; }
  .acolhedor-about-grid { grid-template-columns: 0.9fr 1.1fr; }
  .acolhedor-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .acolhedor-grid-3,
  .acolhedor-list-cards.acolhedor-grid-3,
  .acolhedor-steps { grid-template-columns: repeat(3, 1fr); }
}
`;
