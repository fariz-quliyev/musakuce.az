import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { photosApi } from "@/lib/api/photos";
import { listingsApi } from "@/lib/api/listings";
import { withFallback } from "@/lib/api/withFallback";
import { photoCategoryLabels, classifiedCategoryLabels } from "@/lib/api/labels";
import { todayUpdates as MOCK_UPDATES, type TodayUpdate } from "@/lib/mock-content";
import { formatRelativeTimeAz } from "@/lib/relativeTime";

export const metadata: Metadata = {
  title: "Kəndimizdən — Musaküçə",
  description: "Kənddə baş verənlər — abadlıq işlərindən məktəb nailiyyətlərinə qədər.",
};

const PAGE_SIZE = 12;

/**
 * There is no separate "village update/news" backend entity by design
 * (see TodayInVillage.tsx) — this composes the same real content types
 * (published Photos + active Listings) that homepage's "Bu gün kənddə"
 * teaser already draws from, just with a larger page and no featured/
 * rest split. Falls back to the placeholder bulletin only if the API is
 * unreachable.
 */
export default async function KendimizdenPage() {
  const { data: updates, isLive } = await withFallback(async () => {
    const [photos, listings] = await Promise.all([
      photosApi.getPaged({ publicationStatus: "Published", pageSize: PAGE_SIZE }),
      listingsApi.getPaged({ listingStatus: "Active", pageSize: PAGE_SIZE }),
    ]);

    const fromPhotos: TodayUpdate[] = photos.items.map((p) => ({
      title: p.title,
      description: p.description ?? p.story ?? photoCategoryLabels[p.category],
      category: photoCategoryLabels[p.category],
      kind: "photo",
      tone: "warm",
      image: p.imageUrl,
    }));
    const fromListings: TodayUpdate[] = listings.items.map((l) => ({
      title: l.title,
      description: l.description,
      category: classifiedCategoryLabels[l.category],
      kind: l.imageUrls[0] ? "photo" : "text",
      tone: "forest",
      image: l.imageUrls[0],
      date: l.postedAt,
    }));

    // An empty result here is real, live data — not a failure. See
    // TodayInVillage.tsx for the same reasoning.
    return [...fromPhotos, ...fromListings];
  }, MOCK_UPDATES);

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={isLive} />
        <SectionHeading
          as="h1"
          eyebrow="Kənd gündəliyi"
          title="Kəndimizdən"
          description="Kəndimizdə baş verənlər — abadlıq işlərindən məktəb nailiyyətlərinə qədər."
          className="mb-10"
        />

        {updates.length === 0 ? (
          <p className="text-ink-soft">Hələ heç bir yenilik yoxdur.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {updates.map((item) => {
              const itemTime = item.date ? formatRelativeTimeAz(item.date) : null;
              return (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-lg border border-stone-light bg-paper shadow-sm"
                >
                  {item.kind === "photo" ? (
                    <div className="aspect-video w-full">
                      <VillagePhoto
                        src={item.image}
                        alt={item.title}
                        tone={item.tone ?? "warm"}
                        placeholderLabel={item.title}
                        sizes="(min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{item.category}</Badge>
                      {itemTime ? <span className="text-xs text-ink-faint">{itemTime}</span> : null}
                    </div>
                    <h3 className="font-display text-lg text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
