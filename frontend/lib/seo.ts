import type { Metadata } from "next";

/**
 * Shared metadata builder for the Phase 13 public archive pages —
 * title/description + Open Graph + canonical URL, per §13. Never pass
 * editorial-only fields (EditorialNote/OriginalSourceText) into this;
 * every DTO already nulls them out for unprivileged callers, but this
 * helper only ever receives the public-facing title/description/image
 * fields by design.
 */
export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
  /** "article" for a single content piece (a person, a listing, an
   * education entry, ...); "website" (default) for a list/hub page. */
  type?: "website" | "article";
}): Metadata {
  const { title, description, path, imageUrl, type = "website" } = options;
  const fullTitle = `${title} — Musaküçə`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      type,
      // Falls back to the site-wide default set in the root layout
      // (RootLayout's own generateMetadata) when this page has no
      // image of its own — Next.js only overrides an inherited
      // openGraph.images when a child route actually provides one.
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      locale: "az_AZ",
      siteName: "Musaküçə",
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
