import "server-only";

import { requireSiteEditor } from "@/lib/auth/site-access";
import {
  type SitePost,
  type SitePostStatus,
} from "@/lib/sites/posts";
import { createClient } from "@/lib/supabase/server";

type PostRow = {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  seo: unknown;
  position: number;
  created_at: string;
  updated_at: string;
};

function mapPost(row: PostRow): SitePost {
  return {
    id: row.id,
    site_id: row.site_id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body_markdown: row.body_markdown,
    cover_image_url: row.cover_image_url,
    status: row.status as SitePostStatus,
    published_at: row.published_at,
    seo:
      row.seo && typeof row.seo === "object" && !Array.isArray(row.seo)
        ? (row.seo as Record<string, unknown>)
        : {},
    position: row.position,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listSitePosts(siteId: string): Promise<SitePost[]> {
  await requireSiteEditor(siteId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_posts")
    .select(
      "id, site_id, slug, title, excerpt, body_markdown, cover_image_url, status, published_at, seo, position, created_at, updated_at",
    )
    .eq("site_id", siteId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar os posts do blog.");
  }

  return ((data ?? []) as PostRow[]).map(mapPost);
}

export async function getSitePost(
  siteId: string,
  postId: string,
): Promise<SitePost | null> {
  await requireSiteEditor(siteId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_posts")
    .select(
      "id, site_id, slug, title, excerpt, body_markdown, cover_image_url, status, published_at, seo, position, created_at, updated_at",
    )
    .eq("site_id", siteId)
    .eq("id", postId)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o post.");
  }

  return data ? mapPost(data as PostRow) : null;
}

export function blogSettingsFromSiteSeo(seo: Record<string, unknown>): {
  title: string;
  intro: string;
} {
  const blog =
    seo.blog && typeof seo.blog === "object" && !Array.isArray(seo.blog)
      ? (seo.blog as Record<string, unknown>)
      : {};
  return {
    title:
      typeof blog.title === "string" && blog.title.trim()
        ? blog.title.trim()
        : "Reflexões sobre saúde mental",
    intro: typeof blog.intro === "string" ? blog.intro : "",
  };
}
