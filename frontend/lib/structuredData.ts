/**
 * Phase 14 §6 — Schema.org JSON-LD, added only where a type genuinely
 * fits the real data (§6 explicitly warns against inventing a type just
 * to have one — Memorial records specifically get none: schema.org has
 * no honest fit for a memorial/obituary record, and forcing Person onto
 * one would assert biographical claims the record may not actually make).
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musakuce.az";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Musaküçə",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/axtaris?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function eventJsonLd(event: { name: string; description: string; startDate: string; endDate?: string | null; location: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate ?? undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: event.location },
    url: event.url,
  };
}

export function articleJsonLd(article: { headline: string; description: string; url: string; imageUrl?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    url: article.url,
    image: article.imageUrl ?? undefined,
    publisher: { "@type": "Organization", name: "Musaküçə" },
  };
}

export function videoObjectJsonLd(video: { name: string; description: string; embedUrl: string; thumbnailUrl?: string | null; uploadDate?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    embedUrl: video.embedUrl,
    thumbnailUrl: video.thumbnailUrl ?? undefined,
    uploadDate: video.uploadDate ?? undefined,
  };
}
