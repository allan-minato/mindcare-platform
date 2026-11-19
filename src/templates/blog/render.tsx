import type { ReactNode } from "react";

import type { SiteDocument, SiteDocumentBlogPost } from "@/lib/sites/document";
import { AcolhedorBlogList, AcolhedorBlogPost } from "@/templates/acolhedor/blog";
import {
  MinimalistaBlogList,
  MinimalistaBlogPost,
} from "@/templates/minimalista/blog";
import { PremiumBlogList, PremiumBlogPost } from "@/templates/premium/blog";
import { PREVIEW_BANNER_CLASS } from "@/templates/shared";

type BlogListProps = {
  document: SiteDocument;
  mode?: "preview" | "public";
  basePath?: string;
  banner?: ReactNode;
};

type BlogPostProps = {
  document: SiteDocument;
  post: SiteDocumentBlogPost;
  mode?: "preview" | "public";
  basePath?: string;
  banner?: ReactNode;
};

function PreviewBanner() {
  return <div className={PREVIEW_BANNER_CLASS}>Prévia · não indexada</div>;
}

export function BlogListRenderer({
  document,
  mode = "public",
  basePath = "",
  banner,
}: BlogListProps) {
  const previewBanner =
    banner ?? (mode === "preview" ? <PreviewBanner /> : null);

  switch (document.site.template.key) {
    case "minimalista":
      return (
        <MinimalistaBlogList
          document={document}
          banner={previewBanner}
          basePath={basePath}
        />
      );
    case "premium":
      return (
        <PremiumBlogList
          document={document}
          banner={previewBanner}
          basePath={basePath}
        />
      );
    case "acolhedor":
    default:
      return (
        <AcolhedorBlogList
          document={document}
          banner={previewBanner}
          basePath={basePath}
        />
      );
  }
}

export function BlogPostRenderer({
  document,
  post,
  mode = "public",
  basePath = "",
  banner,
}: BlogPostProps) {
  const previewBanner =
    banner ?? (mode === "preview" ? <PreviewBanner /> : null);

  switch (document.site.template.key) {
    case "minimalista":
      return (
        <MinimalistaBlogPost
          document={document}
          post={post}
          banner={previewBanner}
          basePath={basePath}
        />
      );
    case "premium":
      return (
        <PremiumBlogPost
          document={document}
          post={post}
          banner={previewBanner}
          basePath={basePath}
        />
      );
    case "acolhedor":
    default:
      return (
        <AcolhedorBlogPost
          document={document}
          post={post}
          banner={previewBanner}
          basePath={basePath}
        />
      );
  }
}
