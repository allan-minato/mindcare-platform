"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export const scrollRevealCss = `
.site-reveal {
  opacity: 0;
  transform: translate3d(0, 1.75rem, 0);
  transition:
    opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.95s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
.site-reveal.is-in {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
.site-reveal:not(.is-in) {
  /* saída mais rápida para poder revelar de novo na próxima entrada */
  transition-duration: 0.35s;
  transition-delay: 0ms !important;
}
@media (prefers-reduced-motion: reduce) {
  .site-reveal,
  .site-reveal.is-in {
    opacity: 1;
    transform: none;
    transition: none;
    will-change: auto;
  }
}
`;

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Sem espera de scroll (ex.: hero). */
  immediate?: boolean;
  /** Atraso em ms após entrar na viewport. */
  delayMs?: number;
};

export function ScrollReveal({
  children,
  className,
  immediate = false,
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const scrollRoot = closestScrollRoot(node);
    let frame = 0;

    const syncFromGeometry = () => {
      if (isElementInView(node, scrollRoot)) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(Boolean(entry?.isIntersecting));
      },
      {
        root: scrollRoot,
        threshold: [0, 0.08, 0.12, 0.2],
        rootMargin: scrollRoot ? "0px 0px -6% 0px" : "0px 0px -8% 0px",
      },
    );

    observer.observe(node);

    // Layout da página cheia (html/body) pode atrasar o 1º callback do IO.
    frame = window.requestAnimationFrame(() => {
      syncFromGeometry();
    });

    const onScrollOrResize = () => syncFromGeometry();
    const scrollTarget: Element | Window = scrollRoot ?? window;
    scrollTarget.addEventListener("scroll", onScrollOrResize, {
      passive: true,
    });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [immediate]);

  const style =
    delayMs > 0 && visible
      ? ({ transitionDelay: `${delayMs}ms` } satisfies CSSProperties)
      : undefined;

  return (
    <div
      ref={ref}
      className={`site-reveal${visible ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * Scroller aninhado (prévia ao vivo) ou null = viewport do documento.
 * Nunca usa body/html — o IO com root=body quebra a revelação na página cheia.
 */
function closestScrollRoot(node: Element): Element | null {
  const marked = node.closest("[data-site-scroll-root], .live-preview-phone");
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

  return null;
}

function isElementInView(node: Element, scrollRoot: Element | null): boolean {
  const rect = node.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }

  if (!scrollRoot) {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    return (
      rect.bottom > vh * 0.05 &&
      rect.top < vh * 0.95 &&
      rect.right > 0 &&
      rect.left < vw
    );
  }

  const rootRect = scrollRoot.getBoundingClientRect();
  return (
    rect.bottom > rootRect.top + rootRect.height * 0.05 &&
    rect.top < rootRect.bottom - rootRect.height * 0.05 &&
    rect.right > rootRect.left &&
    rect.left < rootRect.right
  );
}
