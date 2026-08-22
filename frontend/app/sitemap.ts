import type { MetadataRoute } from "next";
import { listingsApi } from "@/lib/api/listings";
import { eventsApi } from "@/lib/api/events";
import { memorialApi } from "@/lib/api/memorial";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import { interviewsApi } from "@/lib/api/interviews";
import { educationApi } from "@/lib/api/education";
import { peopleApi } from "@/lib/api/people";
import type { PagedResult } from "@/lib/api/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://musakuce.az";

// Sitemap freshness isn't user-facing the way the homepage is — an hour
// of staleness here is invisible to visitors and just saves the crawler
// (and our backend) from a full re-fetch on every single sitemap request.
const SITEMAP_REVALIDATE_SECONDS = 3600;

// Content-bearing public pages with no [id] (History/Photos/Videos/
// Places are list-only — no detail route exists for them yet, see
// Phase 13/14 notes — so they appear here, not in the dynamic loop
// below). People *does* have a detail route (/insanlarimiz/[id]) — see
// the dynamic loop.
const STATIC_PAGES = [
  "",
  "/kendimiz",
  "/kendimizden",
  "/tariximiz",
  "/tehsil",
  "/insanlarimiz",
  "/xatire",
  "/medeniyyet",
  "/kendimizin-sesi",
  "/fotoalbom",
  "/videolar",
  "/xerite",
  "/elanlar",
  "/teqvim",
  "/faydali-melumatlar",
  "/paylas",
  "/mexfilik-siyaseti",
];

/** Paginates through every Published page (bounded at 10 pages/500
 * items — a generous ceiling for this site's real content volume) so
 * the sitemap never silently truncates at the API's 50-per-page cap. */
async function fetchAllPublished<T>(fetchPage: (page: number) => Promise<PagedResult<T>>): Promise<T[]> {
  try {
    const first = await fetchPage(1);
    if (first.totalPages <= 1) return first.items;
    const pageCount = Math.min(first.totalPages, 10);
    const rest = await Promise.all(Array.from({ length: pageCount - 1 }, (_, i) => fetchPage(i + 2)));
    return [...first.items, ...rest.flatMap((p) => p.items)];
  } catch {
    // The sitemap must still return the static pages even if the API
    // is briefly unreachable — never a 500 for a crawler.
    return [];
  }
}

/**
 * Phase 14 §7 — previously absent entirely. Only Published content
 * appears (every fetch below explicitly filters publicationStatus:
 * "Published"); Draft/Archived records and /admin/* are never listed
 * here (and /admin is additionally Disallowed in robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, events, memorial, culturalHeritage, interviews, education, people] = await Promise.all([
    fetchAllPublished((page) => listingsApi.getPaged({ listingStatus: "Active", pageSize: 50, page }, SITEMAP_REVALIDATE_SECONDS)),
    fetchAllPublished((page) =>
      eventsApi.getPaged({ publicationStatus: "Published", pageSize: 50, page }, SITEMAP_REVALIDATE_SECONDS),
    ),
    fetchAllPublished((page) =>
      memorialApi.getPaged({ publicationStatus: "Published", pageSize: 50, page }, SITEMAP_REVALIDATE_SECONDS),
    ),
    fetchAllPublished((page) =>
      culturalHeritageApi.getPaged({ publicationStatus: "Published", pageSize: 50, page }, SITEMAP_REVALIDATE_SECONDS),
    ),
    fetchAllPublished((page) =>
      interviewsApi.getPaged({ publicationStatus: "Published", pageSize: 50, page }, SITEMAP_REVALIDATE_SECONDS),
    ),
    fetchAllPublished((page) =>
      educationApi.getPaged({ publicationStatus: "Published", pageSize: 50, page }, SITEMAP_REVALIDATE_SECONDS),
    ),
    fetchAllPublished((page) =>
      peopleApi.getPaged({ publicationStatus: "Published", pageSize: 50, page }, SITEMAP_REVALIDATE_SECONDS),
    ),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...listings.map((l) => ({ url: `${siteUrl}/elanlar/${l.id}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...events.map((e) => ({ url: `${siteUrl}/teqvim/${e.id}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...memorial.map((m) => ({ url: `${siteUrl}/xatire/${m.id}`, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...culturalHeritage.map((c) => ({ url: `${siteUrl}/medeniyyet/${c.id}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...interviews.map((i) => ({ url: `${siteUrl}/kendimizin-sesi/${i.id}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...education.map((e) => ({ url: `${siteUrl}/tehsil/${e.id}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...people.map((p) => ({ url: `${siteUrl}/insanlarimiz/${p.id}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
