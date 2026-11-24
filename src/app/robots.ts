import type { MetadataRoute } from "next";

import { resolvePlatformRoot } from "@/lib/sites/host";

/** Robots da plataforma (marketing + portal). Sites públicos têm robots próprios. */
export default function robots(): MetadataRoute.Robots {
  const root = resolvePlatformRoot();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/app/", "/preview/", "/login", "/_public/"],
      },
    ],
    host: root ? `https://${root}` : undefined,
  };
}
