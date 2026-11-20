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

import type {
  SiteDocument,
  SiteDocumentBlogPost,
} from "@/lib/sites/document";
import { BlogPostRenderer } from "@/templates/blog/render";
import { TemplateRenderer } from "@/templates/render";

export type PreviewDevice = "desktop" | "mobile";

type LiveSitePreviewProps = {
  document: SiteDocument;
  /** Quando informado, renderiza o artigo do blog em vez da home do site. */
  post?: SiteDocumentBlogPost | null;
  /** Base `/preview/{siteId}` para links do template. Padrão: `fullPreviewHref`. */
  previewBasePath?: string;
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
  post = null,
  previewBasePath,
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
  const deferredPost = useDeferredValue(post);
  const linkBasePath = previewBasePath ?? fullPreviewHref;
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
  }, [focusSectionKey, deferredDocument, deferredPost, device, zoom]);

  // Links absolutos do site (/blog, /) saem do editor — redireciona para a prévia cheia.
  useEffect(() => {
    const root = contentRef.current;
    if (!root || !linkBasePath) {
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

      const previewUrl = resolvePreviewHref(href, linkBasePath);
      if (!previewUrl) {
        return;
      }

      event.preventDefault();
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [linkBasePath, deferredDocument, deferredPost, device]);

  const scale = fitScale * zoom;
  const zoomPercent = Math.round(zoom * 100);
  const desktopSiteVh = Math.round(desktopFrameH / scale);

  return (
    <div className={`flex h-full min-h-0 flex-col gap-2 ${className ?? ""}`}>
      <div className="live-preview-chrome flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900">
            {badge}
          </span>
          <div className="flex rounded-md border border-[#d6d0c6] bg-[#fffcf8] p-0.5 text-xs">
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
          <div className="flex items-center gap-1 rounded-md border border-[#d6d0c6] bg-[#fffcf8] p-0.5 text-xs">
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
              className="min-w-12 rounded px-1.5 py-1 font-medium tabular-nums text-[#2a2622] hover:bg-[#efeae2]"
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
            className="text-xs font-semibold text-[#2a2622] underline-offset-4 hover:underline"
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
                    <style>{phonePreviewCss}</style>
                    <div
                      ref={scrollRef}
                      className="live-preview-phone isolate z-0 h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                        <PreviewContent
                          document={deferredDocument}
                          post={deferredPost}
                          basePath={linkBasePath}
                        />
                      </div>
                    </div>
                    <PhoneNotch />
                    <PhoneStatusBar />
                    <PhoneHomeIndicator />
                  </div>
                </PhoneShell>
              </div>
            </div>
          </div>
        ) : (
          /*
            Desktop: canvas fixo 1280px + CSS zoom. O wrapper externo usa
            width/height já escalados para o zoom não “encolher” o container
            e deixar faixa vazia à direita.
          */
          <div className="flex h-full min-h-0 w-full items-start justify-center overflow-auto">
            <div
              className="overflow-hidden rounded-lg shadow-sm ring-1 ring-zinc-200"
              style={{
                width: DESKTOP_WIDTH * scale,
                height: desktopFrameH,
              }}
            >
              <div
                ref={scrollRef}
                className="overflow-x-hidden overflow-y-auto bg-white [scrollbar-width:thin]"
                style={
                  {
                    width: DESKTOP_WIDTH,
                    height: desktopSiteVh,
                    zoom: scale,
                    ["--site-vh" as string]: `${desktopSiteVh}px`,
                  } as CSSProperties
                }
              >
                <div ref={contentRef} style={{ width: DESKTOP_WIDTH }}>
                  <PreviewContent
                    document={deferredDocument}
                    post={deferredPost}
                    basePath={linkBasePath}
                    banner={
                      <div
                        className="px-3 py-2 text-center text-xs tracking-wide"
                        style={{ background: "#141210", color: "#fffcf8" }}
                      >
                        Prévia ao vivo · desktop 1280px
                      </div>
                    }
                  />
                </div>
              </div>
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
    </div>
  );
}

function PhoneNotch() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[10px] z-[100] h-[28px] w-[110px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
      aria-hidden
    />
  );
}

function PhoneStatusBar() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[100] flex h-11 items-end justify-between px-7 pb-1.5 text-[12px] font-semibold tracking-tight text-zinc-900"
      aria-hidden
    >
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-[17px] rounded-sm border border-current" />
        <span className="inline-block h-2.5 w-1.5 rounded-[1px] bg-current" />
      </span>
    </div>
  );
}

function PhoneHomeIndicator() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[100] flex h-6 items-end justify-center pb-2"
      aria-hidden
    >
      <div className="h-1 w-32 rounded-full bg-zinc-900/80" />
    </div>
  );
}

function PreviewContent({
  document,
  post,
  basePath,
  banner,
}: {
  document: SiteDocument;
  post: SiteDocumentBlogPost | null | undefined;
  basePath?: string;
  banner?: ReactNode;
}) {
  if (post) {
    return (
      <BlogPostRenderer
        document={document}
        post={post}
        mode="preview"
        basePath={basePath}
        banner={banner ?? null}
      />
    );
  }

  return (
    <TemplateRenderer
      document={document}
      basePath={basePath}
      banner={banner}
    />
  );
}

/** Evita véu branco de backdrop-filter dentro do zoom da prévia. */
const phonePreviewCss = `
.live-preview-phone header,
.live-preview-phone [class*="-header"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
`;

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
      className="rounded px-2.5 py-1 font-semibold transition"
      style={
        active
          ? { background: "#141210", color: "#fffcf8" }
          : { background: "transparent", color: "#5c564e" }
      }
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
      className="rounded px-2.5 py-1 text-sm font-semibold text-[#2a2622] transition hover:bg-[#efeae2] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
