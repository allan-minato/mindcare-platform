import type { ReactNode } from "react";

import { Markdown } from "@/lib/markdown";
import type {
  SiteDocument,
  SiteDocumentBlogPost,
} from "@/lib/sites/document";
import { AcolhedorShell } from "@/templates/acolhedor/shell";
import {
  professionalDisplayName,
  siteHref,
  whatsappHref,
} from "@/templates/shared";
import { ScrollReveal } from "@/templates/scroll-reveal";

type BlogProps = {
  document: SiteDocument;
  banner?: ReactNode;
  basePath?: string;
};

type BlogPostProps = BlogProps & {
  post: SiteDocumentBlogPost;
};

export function AcolhedorBlogList({
  document,
  banner,
  basePath = "",
}: BlogProps) {
  const blog = document.blog;
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const instagram = instagramHandle(document.professional.social_links);
  const name = professionalDisplayName(document.professional);

  return (
    <AcolhedorShell document={document} banner={banner} basePath={basePath}>
      <style>{acolhedorBlogCss}</style>

      <section className="acolhedor-blog-hero">
        <div className="acolhedor-wrap">
          <nav className="acolhedor-blog-breadcrumb" aria-label="Trilha">
            <a href={siteHref("/", basePath)}>Início</a>
            <span>/</span>
            <span>Blog</span>
          </nav>
          <p className="acolhedor-kicker">Blog</p>
          <h1 className="acolhedor-blog-hero-title">
            {titleWithEmphasis(blog.title)}
          </h1>
          {blog.intro ? (
            <p className="acolhedor-lead acolhedor-blog-hero-lead">{blog.intro}</p>
          ) : null}
        </div>
      </section>

      <section className="acolhedor-blog-section">
        <div className="acolhedor-wrap">
          <div className="acolhedor-blog-grid">
            {blog.posts.map((post, index) => (
              <ScrollReveal
                key={post.slug}
                className="acolhedor-blog-grid-item"
                delayMs={Math.min(index * 70, 280)}
              >
                <a
                  href={siteHref(`/blog/${post.slug}`, basePath)}
                  className="acolhedor-post-card"
                >
                  <div className="acolhedor-post-card-media" aria-hidden="true">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.cover_image_url} alt="" />
                    ) : (
                      <span>{post.title}</span>
                    )}
                  </div>
                  <div className="acolhedor-post-card-body">
                    <div className="acolhedor-post-card-meta">
                      <span>{postCategory(post)}</span>
                      <span>{readingTimeLabel(post.body_markdown)}</span>
                    </div>
                    <h3>{post.title}</h3>
                    {post.excerpt ? <p>{post.excerpt}</p> : null}
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>

          <p className="acolhedor-blog-footnote">
            Novos artigos em breve.
            {instagram ? (
              <>
                {" "}
                Acompanhe também no Instagram{" "}
                <a
                  className="acolhedor-blog-text-link"
                  href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {instagram.startsWith("@") ? instagram : `@${instagram}`}
                </a>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="acolhedor-cta">
        <div className="acolhedor-wrap">
          <div className="acolhedor-cta-inner">
            <p className="acolhedor-kicker">Contato</p>
            <h2 className="acolhedor-title acolhedor-title-wide">
              Cuidar de você começa <em>agora</em>
            </h2>
            <p className="acolhedor-lead">
              Mais do que ler sobre bem-estar, você pode vivê-lo. Vamos
              conversar?
            </p>
            <div className="acolhedor-hero-actions">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  className="acolhedor-btn acolhedor-btn-light"
                  target="_blank"
                  rel="noreferrer"
                >
                  Agendar pelo WhatsApp
                </a>
              ) : null}
              <a
                href={siteHref("/#sobre", basePath)}
                className="acolhedor-btn acolhedor-btn-ghost"
              >
                Conhecer {name.split(" ")[0]}
              </a>
            </div>
          </div>
        </div>
      </section>
    </AcolhedorShell>
  );
}

export function AcolhedorBlogPost({
  document,
  post,
  banner,
  basePath = "",
}: BlogPostProps) {
  const name = professionalDisplayName(document.professional);
  const dateLabel = formatPostDate(post.published_at);
  const whatsapp = whatsappHref(document.professional.whatsapp);

  return (
    <AcolhedorShell document={document} banner={banner} basePath={basePath}>
      <style>{acolhedorBlogCss}</style>
      <article className="acolhedor-blog-article">
        <div className="acolhedor-wrap acolhedor-blog-article-inner">
          <nav className="acolhedor-blog-breadcrumb" aria-label="Trilha">
            <a href={siteHref("/", basePath)}>Início</a>
            <span>/</span>
            <a href={siteHref("/blog", basePath)}>Blog</a>
            <span>/</span>
            <span>{post.title}</span>
          </nav>
          <p className="acolhedor-kicker">{postCategory(post)}</p>
          <h1 className="acolhedor-blog-article-title">{post.title}</h1>
          <p className="acolhedor-blog-meta">
            {name}
            {dateLabel ? ` · ${dateLabel}` : null}
            {" · "}
            {readingTimeLabel(post.body_markdown)}
          </p>
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt=""
              className="acolhedor-blog-cover"
            />
          ) : (
            <div className="acolhedor-blog-article-banner" aria-hidden="true">
              <span>{post.title}</span>
            </div>
          )}
          <div className="acolhedor-blog-body">
            <Markdown source={post.body_markdown} />
          </div>
          <div className="acolhedor-blog-article-foot">
            <a
              href={siteHref("/blog", basePath)}
              className="acolhedor-blog-text-link"
            >
              ← Voltar ao blog
            </a>
            {whatsapp ? (
              <a
                href={whatsapp}
                className="acolhedor-btn"
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </article>
    </AcolhedorShell>
  );
}

function titleWithEmphasis(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length < 3) {
    return title;
  }
  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");
  return (
    <>
      {head} <em>{tail}</em>
    </>
  );
}

function postCategory(post: SiteDocumentBlogPost) {
  const fromSeo = post.seo.category;
  if (typeof fromSeo === "string" && fromSeo.trim()) {
    return fromSeo.trim();
  }
  const title = post.title.toLowerCase();
  if (title.includes("depress")) return "Depressão";
  if (title.includes("ansied") || title.includes("tag")) return "Ansiedade";
  if (title.includes("tcc") || title.includes("pensamento")) return "TCC";
  return "Saúde mental";
}

function readingTimeLabel(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min de leitura`;
}

function instagramHandle(social: unknown): string | null {
  if (!social || typeof social !== "object" || Array.isArray(social)) {
    return null;
  }
  const value = (social as Record<string, unknown>).instagram;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatPostDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

const acolhedorBlogCss = `
.acolhedor-blog-hero {
  position: relative;
  padding: 5.5rem 0 3rem;
  overflow: hidden;
}
.acolhedor-blog-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: radial-gradient(circle at 1px 1px, var(--ac-line) 1px, transparent 0);
  background-size: 38px 38px;
  opacity: 0.4;
  mask-image: linear-gradient(180deg, #000, transparent);
  pointer-events: none;
}
.acolhedor-blog-hero > .acolhedor-wrap {
  position: relative;
  z-index: 1;
}
.acolhedor-blog-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 1.25rem;
  font-size: var(--ac-step--1);
  color: var(--ac-muted);
}
.acolhedor-blog-breadcrumb a {
  color: var(--ac-muted);
  text-decoration: none;
}
.acolhedor-blog-breadcrumb a:hover {
  color: var(--ac-ink);
}
.acolhedor-blog-hero-title {
  margin: 1.1rem 0 0;
  max-width: 16ch;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-4);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--ac-ink);
}
.acolhedor-blog-hero-title em {
  font-style: italic;
  color: var(--ac-gold-deep);
}
.acolhedor-blog-hero-lead {
  max-width: 42rem;
}
.acolhedor-blog-section {
  padding: 0 0 4rem;
}
.acolhedor-blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 2rem;
}
.acolhedor-blog-grid-item {
  display: flex;
  height: 100%;
}
.acolhedor-blog-grid-item > .acolhedor-post-card {
  width: 100%;
}
.acolhedor-post-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ac-line);
  border-radius: var(--ac-radius-lg);
  background: var(--ac-paper);
  text-decoration: none;
  color: inherit;
  transition: transform 0.45s var(--ac-ease-out), box-shadow 0.35s var(--ac-ease);
}
.acolhedor-post-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--ac-shadow);
}
.acolhedor-post-card-media {
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--ac-ink), var(--ac-ink-soft));
}
.acolhedor-post-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.acolhedor-post-card-media span {
  padding: 1.5rem;
  color: var(--ac-gold);
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: clamp(1rem, 2cqi, 1.25rem);
  font-weight: 500;
  font-style: italic;
  line-height: 1.4;
  text-align: center;
  transition: transform 0.6s var(--ac-ease-out);
}
.acolhedor-post-card:hover .acolhedor-post-card-media span {
  transform: scale(1.03);
}
.acolhedor-post-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.75rem;
}
.acolhedor-post-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.9rem;
  color: var(--ac-gold-deep);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.acolhedor-post-card-meta span + span::before {
  content: "·";
  margin-right: 1rem;
  color: var(--ac-line);
}
.acolhedor-post-card h3 {
  margin: 0 0 0.75rem;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-1);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.25;
}
.acolhedor-post-card p {
  margin: 0;
  color: var(--ac-muted);
  font-size: var(--ac-step--1);
  font-weight: 300;
  line-height: 1.65;
}
.acolhedor-blog-footnote {
  margin: 3rem 0 0;
  color: var(--ac-muted);
  font-size: var(--ac-step--1);
  text-align: center;
}
.acolhedor-blog-text-link {
  color: var(--ac-gold-deep);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}
.acolhedor-blog-article {
  padding: 4.5rem 0 5rem;
}
.acolhedor-blog-article-inner {
  max-width: 760px;
}
.acolhedor-blog-article-title {
  margin: 1rem 0 0;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: clamp(2rem, 1.4rem + 2.5cqi, 3.4rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.acolhedor-blog-meta {
  margin: 1rem 0 0;
  color: var(--ac-muted);
  font-size: var(--ac-step--1);
}
.acolhedor-blog-cover,
.acolhedor-blog-article-banner {
  display: block;
  width: 100%;
  margin: 2rem 0 0;
  border-radius: var(--ac-radius-lg);
}
.acolhedor-blog-cover {
  max-height: 440px;
  object-fit: cover;
}
.acolhedor-blog-article-banner {
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ac-ink), var(--ac-ink-soft));
}
.acolhedor-blog-article-banner span {
  max-width: 22ch;
  padding: 1.5rem;
  color: var(--ac-gold);
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: clamp(1.2rem, 3cqi, 1.8rem);
  font-style: italic;
  text-align: center;
  line-height: 1.3;
}
.acolhedor-blog-body {
  margin-top: 2.5rem;
}
.acolhedor-blog-body h2 {
  margin: 2rem 0 0.75rem;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-2);
  font-weight: 500;
}
.acolhedor-blog-body h3 {
  margin: 1.5rem 0 0.5rem;
  font-family: var(--font-acolhedor-display), Georgia, serif;
  font-size: var(--ac-step-1);
  font-weight: 500;
}
.acolhedor-blog-body p,
.acolhedor-blog-body li {
  margin: 0.85rem 0;
  color: var(--ac-muted);
  font-size: var(--ac-step-0);
  font-weight: 300;
  line-height: 1.8;
}
.acolhedor-blog-body ul { padding-left: 1.25rem; list-style: disc; }
.acolhedor-blog-body ol { padding-left: 1.25rem; list-style: decimal; }
.acolhedor-blog-body blockquote {
  margin: 1.25rem 0;
  padding-left: 1rem;
  border-left: 2px solid var(--ac-gold);
  color: var(--ac-ink);
}
.acolhedor-blog-body a { color: var(--ac-gold-deep); }
.acolhedor-blog-article-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--ac-line);
}
.acolhedor-cta-inner em {
  font-style: italic;
  color: var(--ac-gold);
}
@container site (max-width: 767px) {
  .acolhedor-blog-hero { padding-top: 3.5rem; }
  .acolhedor-blog-hero-title { max-width: 100%; }
  .acolhedor-blog-grid { grid-template-columns: 1fr; gap: 1.35rem; }
}
`;
