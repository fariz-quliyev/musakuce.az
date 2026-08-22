/**
 * Phase 14 §6 — Schema.org JSON-LD, added only where a type genuinely
 * fits the real data (§6 explicitly warns against inventing a type just
 * to have one — Memorial records specifically get none: schema.org has
 * no honest fit for a memorial/obituary record, and forcing Person onto
 * one would assert biographical claims the record may not actually make).
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musakuce.az";

/**
 * `<script type="application/ld+json">` content is parsed by the HTML
 * tokenizer as raw text up to the first literal `</script` (case-
 * insensitive) — `JSON.stringify` alone does not escape that sequence, so
 * DB-sourced text (a listing title, a memorial name, ...) containing
 * `</script><script>...` can close the tag early and inject real,
 * executing markup (stored XSS). Escaping every `<`, `>`, and `&` to its
 * `\uXXXX` JSON escape removes all literal angle brackets/ampersands from
 * the emitted HTML while leaving the JSON value itself unchanged —
 * `JSON.parse` (and every schema.org/JSON-LD consumer) decodes `<`
 * back to `<` losslessly, so semantics are preserved. This must be the
 * only place any JSON-LD payload is serialized in this app; every
 * `<script type="application/ld+json">` should call this, never
 * `JSON.stringify` directly.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

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

/** For a biography/profile page (İnsanlarımız) — the semantically
 * correct schema.org type for "this page is about a real person",
 * unlike the generic Article type it replaced here. Not used for
 * Memorial (/xatire) records — Phase 14 §6 already established that a
 * memorial/obituary record has no honest Person fit (it would assert
 * biographical claims the record may not actually make); this is only
 * for İnsanlarımız's own living-archive profiles. */
export function personJsonLd(person: { name: string; description: string; url: string; imageUrl?: string | null; jobTitle?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    description: person.description,
    url: person.url,
    image: person.imageUrl ?? undefined,
    jobTitle: person.jobTitle ?? undefined,
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
