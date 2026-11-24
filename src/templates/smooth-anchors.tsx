"use client";

import { useEffect } from "react";

const HEADER_SELECTORS = [
  ".acolhedor-top",
  ".premium-top",
  ".minimalista-top",
  ".acolhedor-header",
  ".premium-header",
  ".minimalista-header",
].join(", ");

/** Intercepta âncoras internas e rola com animação lenta até a seção. */
export function SmoothAnchors() {
  useEffect(() => {
    const scrollToHash = (hash: string, behavior: "smooth" | "auto" = "smooth") => {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      if (!id) {
        return false;
      }

      const root =
        document.querySelector(
          ".acolhedor-root, .premium-root, .minimalista-root",
        ) ?? document;
      const target = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!target) {
        return false;
      }

      const scrollParent = getScrollParent(target);
      const header =
        root instanceof Element
          ? root.querySelector<HTMLElement>(HEADER_SELECTORS)
          : document.querySelector<HTMLElement>(HEADER_SELECTORS);
      const offset = (header?.offsetHeight ?? 72) + 12;
      const nextTop = absoluteTopWithin(scrollParent, target) - offset;

      if (behavior === "auto") {
        if (scrollParent === window) {
          window.scrollTo(0, Math.max(0, nextTop));
        } else {
          (scrollParent as HTMLElement).scrollTop = Math.max(0, nextTop);
        }
        return true;
      }

      animateScroll(scrollParent, Math.max(0, nextTop), 900);
      return true;
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      const hash = resolveSamePageHash(href);
      if (!hash) {
        return;
      }

      const id = decodeURIComponent(hash.slice(1));
      if (!id) {
        return;
      }

      const root =
        anchor.closest(
          ".acolhedor-root, .premium-root, .minimalista-root",
        ) ?? document;
      const target = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (!target) {
        // Fora da home (ex.: /blog) — deixa navegar para a home com âncora.
        return;
      }

      event.preventDefault();
      scrollToHash(hash, "smooth");

      const inLivePreview = Boolean(
        anchor.closest("[data-site-scroll-root], .live-preview-phone"),
      );
      if (!inLivePreview && history.replaceState) {
        history.replaceState(null, "", hash);
      }
    };

    document.addEventListener("click", onClick);

    // Entrada direta com /rota#seção (produção / Ver prévia).
    if (window.location.hash.length > 1) {
      requestAnimationFrame(() => {
        scrollToHash(window.location.hash, "smooth");
      });
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

/** `#id` ou `/#id` (e variantes com basePath) na mesma página. */
function resolveSamePageHash(href: string): string | null {
  if (href.startsWith("#")) {
    return href;
  }

  try {
    const url = new URL(href, window.location.href);
    if (!url.hash || url.hash === "#") {
      return null;
    }
    if (url.origin !== window.location.origin) {
      return null;
    }
    // Mesmo path → âncora local. Path diferente (ex. /blog → /#sobre) → navega.
    if (url.pathname !== window.location.pathname) {
      return null;
    }
    return url.hash;
  } catch {
    return null;
  }
}

function getScrollParent(node: Element): HTMLElement | Window {
  const marked = node.closest(
    "[data-site-scroll-root], .live-preview-phone",
  ) as HTMLElement | null;
  if (marked) {
    return marked;
  }

  let current = node.parentElement;
  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    const style = getComputedStyle(current);
    const overflowY = style.overflowY;
    const scrollableY =
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay";
    if (scrollableY && current.scrollHeight > current.clientHeight + 1) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

function absoluteTopWithin(
  scrollParent: HTMLElement | Window,
  target: HTMLElement,
): number {
  if (scrollParent === window) {
    return target.getBoundingClientRect().top + window.scrollY;
  }

  const parent = scrollParent as HTMLElement;
  return (
    target.getBoundingClientRect().top -
    parent.getBoundingClientRect().top +
    parent.scrollTop
  );
}

function animateScroll(
  scrollParent: HTMLElement | Window,
  to: number,
  duration: number,
) {
  const from =
    scrollParent === window
      ? window.scrollY
      : (scrollParent as HTMLElement).scrollTop;
  const delta = to - from;
  if (Math.abs(delta) < 1) {
    return;
  }

  const start = performance.now();
  const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const value = from + delta * easeOutCubic(progress);
    if (scrollParent === window) {
      window.scrollTo(0, value);
    } else {
      (scrollParent as HTMLElement).scrollTop = value;
    }
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}
