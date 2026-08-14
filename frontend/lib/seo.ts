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
}): Metadata {
  const { title, description, path, imageUrl } = options;
  return {
    title: `${title} — Musaküçə`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} — Musaküçə`,
      description,
      url: path,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      locale: "az_AZ",
      siteName: "Musaküçə",
    },
  };
}
