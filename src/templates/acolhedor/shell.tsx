import { Cormorant_Garamond, Outfit } from "next/font/google";

import {
  attendanceSummary,
  footerBrandBlurb,
  footerNavItems,
  formatCouncil,
  formatPhoneDisplay,
  instagramHref,
  instagramLabel,
  previewBannerCss,
  professionalDisplayName,
  scrollRevealCss,
  siteHref,
  siteNavItems,
  whatsappHref,
  type TemplateShellProps,
} from "@/templates/shared";
import { CurrentYear } from "@/templates/current-year";
import { SmoothAnchors } from "@/templates/smooth-anchors";

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
  basePath = "",
  children,
}: TemplateShellProps) {
  const professional = document.professional;
  const name = professionalDisplayName(professional);
  const whatsapp = whatsappHref(professional.whatsapp);
  const whatsappLabel = formatPhoneDisplay(professional.whatsapp);
  const council = formatCouncil(professional);
  const specialty = professional.specialty?.trim();
  const brandRole = [specialty || "Psicólogo", council]
    .filter(Boolean)
    .join(" · ");
  const navItems = siteNavItems(document, basePath);
  const footerNav = footerNavItems(document, basePath);
  const brandBlurb = footerBrandBlurb(professional);
  const igHref = instagramHref(professional.social_links);
  const igLabel = instagramLabel(professional.social_links);
  const placeLine = attendanceSummary(professional);
  const copyrightBits = [name, specialty || "Psicólogo", council]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={`${display.variable} ${body.variable} acolhedor-root min-h-full`}
    >
      <style>{`${previewBannerCss}${scrollRevealCss}${acolhedorCss}`}</style>
      <SmoothAnchors />
      {banner}
      <header className="acolhedor-header">
        <div className="acolhedor-wrap acolhedor-header-inner">
          <a href={siteHref("/", basePath)} className="acolhedor-brand">
            <span className="acolhedor-brand-name">{name}</span>
            <span className="acolhedor-brand-role">{brandRole}</span>
          </a>
          {navItems.length > 0 ? (
            <nav className="acolhedor-nav" aria-label="Seções">
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
              className="acolhedor-btn acolhedor-header-cta"
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
        <div className="acolhedor-wrap">
          <div className="acolhedor-footer-grid">
            <div className="acolhedor-footer-brand">
              <p className="acolhedor-footer-name">{name}</p>
              <p className="acolhedor-footer-blurb">{brandBlurb}</p>
            </div>

            <div className="acolhedor-footer-col">
              <h3>Navegação</h3>
              <ul>
                {footerNav.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="acolhedor-footer-col">
              <h3>Contato</h3>
              <ul>
                {whatsapp ? (
                  <li>
                    <a href={whatsapp} target="_blank" rel="noreferrer">
                      <FooterIconWhatsApp />
                      {whatsappLabel || "WhatsApp"}
                    </a>
                  </li>
                ) : null}
                {igHref && igLabel ? (
                  <li>
                    <a href={igHref} target="_blank" rel="noreferrer">
                      <FooterIconInstagram />
                      {igLabel}
                    </a>
                  </li>
                ) : null}
                {placeLine ? (
                  <li className="acolhedor-footer-plain">
                    <FooterIconPin />
                    {placeLine}
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <div className="acolhedor-footer-bottom">
            <p>
              © <CurrentYear /> {copyrightBits}.
            </p>
            <div className="acolhedor-footer-social">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <FooterIconWhatsApp />
                </a>
              ) : null}
              {igHref ? (
                <a
                  href={igHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <FooterIconInstagram />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterIconWhatsApp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 01-12.2 7.5L3 21l2-5.8A8.5 8.5 0 1121 11.5z" />
    </svg>
  );
}

function FooterIconInstagram() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FooterIconPin() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const acolhedorCss = `
.acolhedor-root {
  container-type: inline-size;
  container-name: site;
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
  --ac-step--1: clamp(0.83rem, 0.78rem + 0.2cqi, 0.95rem);
  --ac-step-0: clamp(1rem, 0.95rem + 0.25cqi, 1.13rem);
  --ac-step-1: clamp(1.2rem, 1.1rem + 0.5cqi, 1.5rem);
  --ac-step-2: clamp(1.6rem, 1.4rem + 1cqi, 2.25rem);
  --ac-step-3: clamp(2.2rem, 1.8rem + 2cqi, 3.4rem);
  --ac-step-4: clamp(2.9rem, 2.2rem + 3.5cqi, 5.5rem);
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
  padding-inline: clamp(1.25rem, 5cqi, 3rem);
}
.acolhedor-wrap-narrow {
  width: 100%;
  max-width: 760px;
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 5cqi, 3rem);
}
.acolhedor-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding-top: calc(1rem + var(--site-safe-top, env(safe-area-inset-top, 0px)));
  padding-bottom: 1rem;
  /* Fundo sólido: backdrop-filter + CSS zoom na prévia mobile gera véu branco. */
  background: var(--ac-paper);
  box-shadow: 0 1px 0 var(--ac-line);
}
.acolhedor-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}
.acolhedor-header-cta {
  flex-shrink: 0;
}
.acolhedor-brand {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1;
  text-decoration: none;
  color: var(--ac-ink);
}
.acolhedor-brand-name {
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.acolhedor-brand-role {
  margin-top: 0.25rem;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--ac-gold-deep);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.acolhedor-nav {
  display: none;
  align-items: center;
  gap: clamp(1.2rem, 2.5cqi, 2.4rem);
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
  padding-block: clamp(4rem, 8cqi, 8rem);
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
  min-height: var(--site-vh, 100vh);
  display: flex;
  align-items: flex-start;
  padding: 15.5rem 0 4.5rem;
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
  width: min(60cqi, 720px);
  height: min(60cqi, 720px);
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
  padding-block: clamp(4rem, 8cqi, 8rem);
  background: var(--ac-paper);
}
.acolhedor-cta-inner {
  position: relative;
  text-align: center;
  padding: clamp(3.5rem, 7cqi, 6rem) clamp(1.5rem, 5cqi, 4rem);
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
  padding: 4rem 0 2.5rem;
}
.acolhedor-footer-grid {
  display: grid;
  gap: 2.5rem;
}
.acolhedor-footer-brand {
  display: grid;
  gap: 0.85rem;
  max-width: 28rem;
}
.acolhedor-footer-name {
  margin: 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-2);
  font-weight: 500;
  letter-spacing: -0.02em;
}
.acolhedor-footer-blurb {
  margin: 0;
  color: var(--ac-muted-dark);
  font-size: var(--ac-step--1);
  font-weight: 300;
  line-height: 1.7;
}
.acolhedor-footer-col h3 {
  margin: 0 0 1rem;
  color: var(--ac-gold);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.acolhedor-footer-col ul {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.acolhedor-footer-col a,
.acolhedor-footer-plain {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--ac-muted-dark);
  font-size: var(--ac-step--1);
  font-weight: 300;
  text-decoration: none;
  transition: color 0.25s var(--ac-ease);
}
.acolhedor-footer-col a:hover {
  color: var(--ac-paper);
}
.acolhedor-footer-col svg {
  flex-shrink: 0;
  opacity: 0.75;
}
.acolhedor-footer-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ac-line-light);
}
.acolhedor-footer-bottom p {
  margin: 0;
  color: var(--ac-muted-dark);
  font-size: 0.8rem;
  font-weight: 300;
}
.acolhedor-footer-social {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.acolhedor-footer-social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--ac-line-light);
  border-radius: 999px;
  color: var(--ac-muted-dark);
  transition: color 0.25s var(--ac-ease), border-color 0.25s var(--ac-ease);
}
.acolhedor-footer-social a:hover {
  color: var(--ac-gold);
  border-color: var(--ac-gold);
}
@container site (max-width: 767px) {
  .acolhedor-header-cta { display: none; }
  .acolhedor-brand-name { font-size: 1.2rem; }
  .acolhedor-brand-role {
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    max-width: 100%;
  }
  .acolhedor-btn {
    padding: 0.85rem 1.25rem;
  }
  .acolhedor-hero {
    padding-top: 3.25rem;
    padding-bottom: 3rem;
    align-items: flex-start;
  }
}
@container site (min-width: 768px) {
  .acolhedor-nav { display: flex; }
  .acolhedor-hero-grid { grid-template-columns: 1.15fr 0.85fr; gap: 4rem; }
  .acolhedor-about-grid { grid-template-columns: 0.9fr 1.1fr; }
  .acolhedor-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .acolhedor-grid-3,
  .acolhedor-list-cards.acolhedor-grid-3,
  .acolhedor-steps { grid-template-columns: repeat(3, 1fr); }
  .acolhedor-footer-grid {
    grid-template-columns: 1.4fr 0.8fr 1fr;
    gap: 3rem;
    align-items: start;
  }
}
`;
