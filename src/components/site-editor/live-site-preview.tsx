"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { SiteDocument } from "@/lib/sites/document";
import { TemplateRenderer } from "@/templates/render";

export type PreviewDevice = "desktop" | "mobile";

type LiveSitePreviewProps = {
  document: SiteDocument;
  fullPreviewHref?: string;
  focusSectionKey?: string | null;
  badge?: string;
  className?: string;
};

/** iPhone 14/15 logical viewport */
const MOBILE = {
  width: 390,
  height: 844,
  bezel: 12,
} as const;

const DESKTOP_WIDTH = 1280;

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.25;
const ZOOM_STEP = 0.1;

export function LiveSitePreview({
  document,
  fullPreviewHref,
  focusSectionKey,
  badge = "Ao vivo · não salvo",
  className,
}: LiveSitePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [fitScale, setFitScale] = useState(0.4);
  const [zoom, setZoom] = useState(1);
  const [desktopFrameH, setDesktopFrameH] = useState(720);
  const deferredDocument = useDeferredValue(document);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const phoneOuterWidth = MOBILE.width + MOBILE.bezel * 2;
  const phoneOuterHeight = MOBILE.height + MOBILE.bezel * 2;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const updateScale = () => {
      const pad = device === "mobile" ? 32 : 16;
      const availableW = Math.max(160, frame.clientWidth - pad);
      const availableH = Math.max(200, frame.clientHeight - pad);

      if (device === "mobile") {
        const byW = availableW / phoneOuterWidth;
        const byH = availableH / phoneOuterHeight;
        setFitScale(Math.min(1, Math.max(0.28, Math.min(byW, byH))));
        return;
      }

      setDesktopFrameH(availableH);
      setFitScale(
        Math.min(1, Math.max(0.25, availableW / DESKTOP_WIDTH)),
      );
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [device, phoneOuterHeight, phoneOuterWidth]);

  useEffect(() => {
    if (!focusSectionKey) {
      return;
    }
    const root = contentRef.current;
    const scrollBox = scrollRef.current;
    if (!root || !scrollBox) {
      return;
    }
    const target = root.querySelector<HTMLElement>(
      `#${CSS.escape(focusSectionKey)}`,
    );
    if (!target) {
      return;
    }
    const top =
      target.getBoundingClientRect().top -
      scrollBox.getBoundingClientRect().top +
      scrollBox.scrollTop -
      72;
    scrollBox.scrollTo({ top, behavior: "smooth" });
  }, [focusSectionKey, deferredDocument, device, zoom]);

  // Links absolutos do site (/blog, /) saem do editor — redireciona para a prévia cheia.
  useEffect(() => {
    const root = contentRef.current;
    if (!root || !fullPreviewHref) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      const previewUrl = resolvePreviewHref(href, fullPreviewHref);
      if (!previewUrl) {
        return;
      }

      event.preventDefault();
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [fullPreviewHref, deferredDocument, device]);

  const scale = fitScale * zoom;
  const zoomPercent = Math.round(zoom * 100);
  const desktopSiteVh = Math.round(desktopFrameH / scale);

  return (
    <div className={`flex h-full min-h-0 flex-col gap-2 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {badge}
          </span>
          <div className="flex rounded-md border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
            <DeviceButton
              active={device === "desktop"}
              onClick={() => setDevice("desktop")}
            >
              Desktop
            </DeviceButton>
            <DeviceButton
              active={device === "mobile"}
              onClick={() => setDevice("mobile")}
            >
              Mobile
            </DeviceButton>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
            <ZoomButton
              label="Diminuir zoom"
              disabled={zoom <= ZOOM_MIN + 0.001}
              onClick={() =>
                setZoom((current) =>
                  Math.max(ZOOM_MIN, roundZoom(current - ZOOM_STEP)),
                )
              }
            >
              −
            </ZoomButton>
            <button
              type="button"
              title="Ajustar à tela"
              onClick={() => setZoom(1)}
              className="min-w-12 rounded px-1.5 py-1 font-medium tabular-nums text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {zoomPercent}%
            </button>
            <ZoomButton
              label="Aumentar zoom"
              disabled={zoom >= ZOOM_MAX - 0.001}
              onClick={() =>
                setZoom((current) =>
                  Math.min(ZOOM_MAX, roundZoom(current + ZOOM_STEP)),
                )
              }
            >
              +
            </ZoomButton>
          </div>
        </div>
        {fullPreviewHref ? (
          <Link
            href={fullPreviewHref}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            Abrir em tela cheia
          </Link>
        ) : null}
      </div>

      <div
        ref={frameRef}
        className={`relative min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 ${
          device === "mobile"
            ? "overflow-auto bg-[radial-gradient(ellipse_at_center,#3f3f46_0%,#18181b_55%,#09090b_100%)]"
            : "bg-zinc-100 p-2 dark:bg-zinc-950"
        }`}
      >
        {device === "mobile" ? (
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="overflow-hidden"
              style={{
                width: phoneOuterWidth * scale,
                height: phoneOuterHeight * scale,
              }}
            >
              {/* zoom (não transform) para o header sticky continuar funcionando */}
              <div
                style={
                  {
                    width: phoneOuterWidth,
                    height: phoneOuterHeight,
                    zoom: scale,
                  } as CSSProperties
                }
              >
                <PhoneShell>
                  <div className="relative h-full w-full">
                    <div
                      ref={scrollRef}
                      className="live-preview-phone h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      style={
                        {
                          width: MOBILE.width,
                          height: MOBILE.height,
                          ["--site-vh" as string]: `${MOBILE.height}px`,
                          ["--site-safe-top" as string]: "52px",
                          ["--site-safe-bottom" as string]: "20px",
                        } satisfies CSSProperties
                      }
                    >
                      <div ref={contentRef}>
                        <TemplateRenderer
                          document={deferredDocument}
                          basePath={fullPreviewHref}
                        />
                      </div>
                    </div>
                    <PhoneStatusBar />
                    <PhoneHomeIndicator />
                  </div>
                </PhoneShell>
              </div>
            </div>
          </div>
        ) : (
          /*
            Desktop: CSS zoom (não transform). Sticky/fixed respeitam o
            scrollport da prévia — igual à tela cheia no Chromium.
          */
          <div
            ref={scrollRef}
            className="mx-auto h-full max-w-full overflow-auto rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 [scrollbar-width:thin]"
            style={
              {
                zoom: scale,
                ["--site-vh" as string]: `${desktopSiteVh}px`,
              } as CSSProperties
            }
          >
            <div ref={contentRef} style={{ width: DESKTOP_WIDTH }}>
              <TemplateRenderer
                document={deferredDocument}
                basePath={fullPreviewHref}
                banner={
                  <div className="bg-zinc-900 px-3 py-2 text-center text-xs tracking-wide text-zinc-100">
                    Prévia ao vivo · desktop 1280px
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative box-border rounded-[3rem] bg-zinc-950 p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75),inset_0_0_0_1px_rgba(255,255,255,0.08)]"
      style={{
        width: MOBILE.width + MOBILE.bezel * 2,
        height: MOBILE.height + MOBILE.bezel * 2,
      }}
    >
      <div className="h-full w-full overflow-hidden rounded-[2.35rem] bg-black ring-1 ring-white/10">
        {children}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[22px] z-40 h-[28px] w-[110px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
    </div>
  );
}

function PhoneStatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-11 items-end justify-between px-7 pb-1.5 text-[12px] font-semibold tracking-tight text-zinc-900 mix-blend-difference">
      <span>9:41</span>
      <span className="flex items-center gap-1.5 opacity-90">
        <span className="inline-block h-2.5 w-[17px] rounded-sm border border-current" />
        <span className="inline-block h-2.5 w-1.5 rounded-[1px] bg-current" />
      </span>
    </div>
  );
}

function PhoneHomeIndicator() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex h-6 items-end justify-center pb-2">
      <div className="h-1 w-32 rounded-full bg-zinc-900/80" />
    </div>
  );
}

function roundZoom(value: number) {
  return Math.round(value * 100) / 100;
}

/** Mapeia caminhos do site público para a prévia `/preview/{id}/…`. */
function resolvePreviewHref(href: string, previewBase: string): string | null {
  const base = previewBase.replace(/\/$/, "");
  if (href === "/" || href === base) {
    return base;
  }
  if (href.startsWith("/#")) {
    return `${base}${href.slice(1)}`;
  }
  if (href.startsWith("/blog")) {
    return `${base}${href}`;
  }
  if (
    href === base ||
    href.startsWith(`${base}/`) ||
    href.startsWith(`${base}#`)
  ) {
    return href;
  }
  return null;
}

function DeviceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2.5 py-1 font-medium transition ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function ZoomButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded px-2.5 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}
