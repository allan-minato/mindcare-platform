"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

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
      setVisible(isElementInView(node, scrollRoot));
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
