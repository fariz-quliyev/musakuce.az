import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { XeriteMapView } from "@/components/map/XeriteMapView";
import { placesApi } from "@/lib/api/places";
import { withFallback } from "@/lib/api/withFallback";
import type { PagedResult, PlaceDto } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Xəritə — Musaküçə",
  description: "Musaküçə xəritədə — məscid, ocaq, məktəb və digər mühüm yerlər.",
};

const FALLBACK: PagedResult<PlaceDto> = {
  items: [
    {
      id: "mock-1",
      name: "Musaküçə kənd məscidi",
      slug: "musakuce-kend-mescidi",
      kind: "Historical",
      category: "Mosque",
      description: "1903-cü ildə tikilib.",
      historicalBackground: null,
      latitude: 39.0086,
      longitude: 48.6989,
      coverMediaAssetId: null,
      coverImageUrl: null,
      sourceStatus: "LocalResearch",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      publicationStatus: "Published",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "mock-2",
      name: "Molla Musa ocağı",
      slug: "molla-musa-ocagi",
      kind: "Historical",
      category: "Shrine",
      description: null,
      historicalBackground: null,
      latitude: 39.006,
      longitude: 48.701,
      coverMediaAssetId: null,
      coverImageUrl: null,
      sourceStatus: "TraditionalStory",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      publicationStatus: "Published",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ],
  page: 1,
  pageSize: 100,
  totalCount: 2,
  totalPages: 1,
};

/**
 * The API caps pageSize at 50 (PagedQuery.MaxPageSize) — fetch every page
 * so the map shows all published places rather than silently truncating
 * at 50. A village realistically has far fewer than that, so this loop
 * runs once in practice; the cap just guards against runaway requests.
 */
async function fetchAllPublishedPlaces(): Promise<PagedResult<PlaceDto>> {
  const first = await placesApi.getPaged({ publicationStatus: "Published", pageSize: 50, page: 1 });
  if (first.totalPages <= 1) return first;

  const restPages = await Promise.all(
    Array.from({ length: Math.min(first.totalPages, 5) - 1 }, (_, i) =>
      placesApi.getPaged({ publicationStatus: "Published", pageSize: 50, page: i + 2 }),
    ),
  );

  return { ...first, items: [...first.items, ...restPages.flatMap((p) => p.items)] };
}

export default async function XeritePage() {
  const { data: places, isLive } = await withFallback(fetchAllPublishedPlaces, FALLBACK);

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Xəritə"
          title="Musaküçə xəritədə"
          description="Məscid, ocaq, məktəb, kitabxana və digər mühüm yerlər — xəritədə."
          className="mb-8"
        />
        <XeriteMapView places={places.items} isLive={isLive} />
      </Container>
    </PageShell>
  );
}
