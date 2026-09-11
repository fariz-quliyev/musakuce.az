import { photosApi } from "@/lib/api/photos";
import { listingsApi } from "@/lib/api/listings";
import { photoCategoryLabels, classifiedCategoryLabels } from "@/lib/api/labels";
import type { TodayUpdate } from "@/lib/mock-content";

/** How many feed items the homepage's "Musaküçədən" section shows. */
export const HOME_UPDATES_COUNT = 3;

/**
 * The "Kəndimizdən" feed. There is no News entity (yet); the feed is
 * composed from the two real content types that carry recent village
 * activity: published Photos, then active Listings. Shared by
 * /kendimizden and the homepage's "Musaküçədən" section so both agree
 * on what "latest" means.
 *
 * An empty result is real, live data (the API answered, nothing recent
 * yet) and is returned as-is; only a fetch failure throws, which is what
 * lets callers' `withFallback` tell an outage from a quiet week.
 */
export async function fetchVillageUpdates(pageSize: number, revalidate?: number): Promise<TodayUpdate[]> {
  const [photos, listings] = await Promise.all([
    photosApi.getPaged({ publicationStatus: "Published", pageSize }, revalidate),
    listingsApi.getPaged({ listingStatus: "Active", pageSize }, revalidate),
  ]);

  const fromPhotos: TodayUpdate[] = photos.items.map((p) => ({
    title: p.title,
    description: p.description ?? p.story ?? photoCategoryLabels[p.category],
    category: photoCategoryLabels[p.category],
    kind: "photo",
    tone: "warm",
    image: p.imageUrl,
    sourceId: p.id,
    href: "/fotoalbom",
  }));
  const fromListings: TodayUpdate[] = listings.items.map((l) => ({
    title: l.title,
    description: l.description,
    category: classifiedCategoryLabels[l.category],
    kind: l.imageUrls[0] ? "photo" : "text",
    tone: "forest",
    image: l.imageUrls[0],
    // Listings carry a real `postedAt`. Photos only carry `takenDate`
    // (when the picture was taken, not when it was added), which isn't a
    // recency signal, so photo items deliberately get no date.
    date: l.postedAt,
    sourceId: l.id,
    href: `/elanlar/${l.id}`,
  }));

  return [...fromPhotos, ...fromListings];
}
