import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musakuce.az";

/**
 * Phase 14 §8 — previously absent entirely (no robots.txt existed).
 * Admin and API routes were already correctly kept out of search
 * results via `robots: { index: false }` on /admin's layout metadata,
 * but that only stops *indexing* — it doesn't stop crawlers from
 * spending crawl budget requesting those paths, which Disallow does.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
