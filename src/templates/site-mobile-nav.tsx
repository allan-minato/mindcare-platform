"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { SiteNavItem } from "@/templates/shared";

export type SiteMobileNavProps = {
  items: SiteNavItem[];
  cta?: { href: string; label: string } | null;
};

const TOP_SELECTOR = ".acolhedor-top, .premium-top, .minimalista-top";

/** Menu mobile compartilhado — estilos via `siteMobileNavCss` + tokens do template. */
export function SiteMobileNav({ items, cta }: SiteMobileNavProps) {
  const [open, setOpen] = useState(false);
  const [portalHost, setPortalHost] = useState<Element | null>(null);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setPortalHost(rootRef.current?.closest(TOP_SELECTOR) ?? null);
  }, []);

  useEffect(() => {
    const top = rootRef.current?.closest(TOP_SELECTOR);
    top?.classList.toggle("has-mobile-nav-open", open);
    return () => {
      top?.classList.remove("has-mobile-nav-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (items.length === 0 && !cta) {
    return null;
  }

  const menu =
    open && portalHost
      ? createPortal(
          <>
            <div className="site-mobile-nav-sheet">
              <nav
                id={panelId}
                className="site-mobile-nav-panel"
                aria-label="Menu"
              >
                <ul className="site-mobile-nav-list">
                  {items.map((item) => (
                    <li key={`${item.label}-${item.href}`}>
                      <a href={item.href} onClick={() => setOpen(false)}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {cta ? (
                  <a
                    href={cta.href}
                    className="site-mobile-nav-cta"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    {cta.label}
                  </a>
                ) : null}
              </nav>
            </div>
            <button
              type="button"
              className="site-mobile-nav-backdrop"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
            />
          </>,
          portalHost,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={`site-mobile-nav${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="site-mobile-nav-toggle"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <svg
            className="site-mobile-nav-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            className="site-mobile-nav-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      {menu}
    </div>
  );
}

/** CSS base do menu mobile — cada template define os tokens `--site-nav-*`. */
export const siteMobileNavCss = `
.site-mobile-nav {
  position: relative;
  justify-self: end;
  z-index: 3;
}
.site-mobile-nav-toggle {
  position: relative;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1.5px solid var(--site-nav-accent, var(--site-nav-ink, currentColor));
  border-radius: 999px;
  background: #fff;
  color: var(--site-nav-accent, var(--site-nav-ink, currentColor));
  cursor: pointer;
  flex-shrink: 0;
}
.premium-root .site-mobile-nav-toggle {
  background: #121212;
}
.site-mobile-nav-icon {
  display: block;
  flex-shrink: 0;
}
.site-mobile-nav-sheet {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  background: #fff;
  border-top: 1px solid var(--site-nav-line, rgba(0, 0, 0, 0.1));
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
}
.premium-root .site-mobile-nav-sheet {
  background: #121212;
}
.site-mobile-nav-panel {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.35rem clamp(1.25rem, 5cqi, 3rem) 1rem;
  color: var(--site-nav-ink, #111);
}
.site-mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
}
.site-mobile-nav-list a {
  display: block;
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--site-nav-line, rgba(0, 0, 0, 0.1));
  color: inherit;
  text-decoration: none;
  font-size: 1.05rem;
  line-height: 1.35;
  text-align: left;
}
.site-mobile-nav-list li:last-child a {
  border-bottom: 0;
}
.site-mobile-nav-list a:hover,
.site-mobile-nav-list a:focus-visible {
  color: var(--site-nav-accent, inherit);
  outline: none;
}
.site-mobile-nav-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--site-nav-accent, currentColor);
  background: var(--site-nav-accent, currentColor);
  color: #fff;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.site-mobile-nav-backdrop {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1;
  height: 100vh;
  height: 100dvh;
  border: 0;
  padding: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
}
.acolhedor-top.has-mobile-nav-open .acolhedor-btn.acolhedor-header-blog,
.premium-top.has-mobile-nav-open .premium-mobile-bar,
.minimalista-top.has-mobile-nav-open .minimalista-mobile-bar {
  display: none !important;
}
`;
