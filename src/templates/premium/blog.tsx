import type { ReactNode } from "react";

import { Markdown } from "@/lib/markdown";
import type {
  SiteDocument,
  SiteDocumentBlogPost,
} from "@/lib/sites/document";
import { PremiumShell } from "@/templates/premium/shell";
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

export function PremiumBlogList({
  document,
  banner,
  basePath = "",
}: BlogProps) {
  const blog = document.blog;
  return (
    <PremiumShell document={document} banner={banner} basePath={basePath}>
      <style>{css}</style>
      <section className="premium-section">
        <div className="premium-wrap">
          <p className="premium-kicker">Blog</p>
          <h1 className="premium-title">{blog.title}</h1>
          {blog.intro ? <p className="premium-lead">{blog.intro}</p> : null}
        </div>
      </section>
      <section className="premium-section">
        <div className="premium-wrap pr-blog-list">
          {blog.posts.map((post, index) => (
            <ScrollReveal key={post.slug} delayMs={Math.min(index * 40, 160)}>
              <a
                href={siteHref(`/blog/${post.slug}`, basePath)}
                className="pr-blog-card"
              >
                <h2>{post.title}</h2>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </PremiumShell>
  );
}

export function PremiumBlogPost({
  document,
  post,
  banner,
  basePath = "",
}: BlogPostProps) {
  return (
    <PremiumShell document={document} banner={banner} basePath={basePath}>
      <style>{css}</style>
      <article className="premium-section">
        <div className="premium-wrap" style={{ maxWidth: 720 }}>
          <p className="premium-kicker">
            <a href={siteHref("/blog", basePath)}>Blog</a>
          </p>
          <h1 className="premium-title">{post.title}</h1>
          <div className="pr-blog-body">
            <Markdown source={post.body_markdown} />
          </div>
          <p className="pr-blog-back">
            <a href={siteHref("/blog", basePath)}>← Voltar ao blog</a>
          </p>
        </div>
      </article>
    </PremiumShell>
  );
}

const css = `
.pr-blog-list { display: grid; gap: 0; }
.pr-blog-card {
  display: grid; gap: 0.55rem; padding: 1.85rem 0;
  border-top: 1px solid var(--pr-line); text-decoration: none; color: inherit;
}
.pr-blog-card h2 {
  margin: 0; font-family: var(--font-premium-display), Georgia, serif;
  font-size: 1.65rem; font-weight: 400;
}
.pr-blog-card p { margin: 0; color: var(--pr-muted); line-height: 1.7; }
.pr-blog-card:hover h2 { color: var(--pr-accent); }
.pr-blog-body { margin-top: 2rem; }
.pr-blog-body p, .pr-blog-body li { color: var(--pr-muted); line-height: 1.8; margin: 0.8rem 0; }
.pr-blog-body ul { padding-left: 1.2rem; list-style: disc; }
.pr-blog-back { margin-top: 2.5rem; }
.pr-blog-back a { color: var(--pr-accent); }
`;
