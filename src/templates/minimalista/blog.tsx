import type { ReactNode } from "react";

import { Markdown } from "@/lib/markdown";
import type {
  SiteDocument,
  SiteDocumentBlogPost,
} from "@/lib/sites/document";
import { MinimalistaShell } from "@/templates/minimalista/shell";
import { ScrollReveal } from "@/templates/scroll-reveal";
import { siteHref } from "@/templates/shared";

type BlogProps = {
  document: SiteDocument;
  banner?: ReactNode;
  basePath?: string;
};

type BlogPostProps = BlogProps & {
  post: SiteDocumentBlogPost;
};

export function MinimalistaBlogList({
  document,
  banner,
  basePath = "",
}: BlogProps) {
  const blog = document.blog;
  return (
    <MinimalistaShell document={document} banner={banner} basePath={basePath}>
      <style>{css}</style>
      <section className="minimalista-section mn-blog-hero">
        <div className="minimalista-wrap">
          <p className="minimalista-kicker">Blog</p>
          <h1 className="minimalista-title">{blog.title}</h1>
          {blog.intro ? <p className="minimalista-lead">{blog.intro}</p> : null}
        </div>
      </section>
      <section className="minimalista-section">
        <div className="minimalista-wrap mn-blog-list">
          {blog.posts.map((post, index) => (
            <ScrollReveal key={post.slug} delayMs={Math.min(index * 40, 160)}>
              <a
                href={siteHref(`/blog/${post.slug}`, basePath)}
                className="mn-blog-card"
              >
                <h2>{post.title}</h2>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </MinimalistaShell>
  );
}

export function MinimalistaBlogPost({
  document,
  post,
  banner,
  basePath = "",
}: BlogPostProps) {
  return (
    <MinimalistaShell document={document} banner={banner} basePath={basePath}>
      <style>{css}</style>
      <article className="minimalista-section">
        <div className="minimalista-wrap">
          <p className="minimalista-kicker">
            <a href={siteHref("/blog", basePath)}>Blog</a>
          </p>
          <h1 className="minimalista-title">{post.title}</h1>
          <div className="mn-blog-body">
            <Markdown source={post.body_markdown} />
          </div>
          <p className="mn-blog-back">
            <a href={siteHref("/blog", basePath)}>← Voltar ao blog</a>
          </p>
        </div>
      </article>
    </MinimalistaShell>
  );
}

const css = `
.mn-blog-list { display: grid; gap: 0; }
.mn-blog-card {
  display: grid; gap: 0.5rem; padding: 1.75rem 0;
  border-top: 1px solid var(--mn-line); text-decoration: none; color: inherit;
}
.mn-blog-card h2 {
  margin: 0; font-family: var(--font-minimalista-display), Georgia, serif;
  font-size: 1.5rem; font-weight: 400;
}
.mn-blog-card p { margin: 0; color: var(--mn-muted); line-height: 1.65; }
.mn-blog-card:hover h2 { text-decoration: underline; text-underline-offset: 0.15em; }
.mn-blog-body { margin-top: 2rem; }
.mn-blog-body p, .mn-blog-body li { color: var(--mn-muted); line-height: 1.75; margin: 0.75rem 0; }
.mn-blog-body ul { padding-left: 1.2rem; list-style: disc; }
.mn-blog-back { margin-top: 2.5rem; }
.mn-blog-back a { color: var(--mn-ink); }
`;
