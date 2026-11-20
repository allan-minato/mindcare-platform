import type { SiteDocumentBlogPost } from "@/lib/sites/document";

export type LiveBlogPostFields = {
  title: string;
  slug: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string;
  seo_title: string;
  seo_description: string;
};

export function buildLiveBlogPost(
  fields: LiveBlogPostFields,
  base?: SiteDocumentBlogPost | null,
): SiteDocumentBlogPost {
  const cover = fields.cover_image_url.trim();
  const coverOk = cover.length === 0 || /^https:\/\//i.test(cover);

  const seoTitle = fields.seo_title.trim();
  const seoDescription = fields.seo_description.trim();

  return {
    slug: fields.slug.trim() || "rascunho",
    title: fields.title.trim() || "Sem título",
    excerpt: fields.excerpt,
    body_markdown: fields.body_markdown,
    cover_image_url: coverOk && cover.length > 0 ? cover : null,
    published_at: base?.published_at ?? new Date().toISOString(),
    seo: {
      ...(typeof base?.seo === "object" && base.seo ? base.seo : {}),
      ...(seoTitle ? { title: seoTitle } : {}),
      ...(seoDescription ? { description: seoDescription } : {}),
    },
  };
}
