import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { photosApi } from "@/lib/api/photos";
import { listingsApi } from "@/lib/api/listings";
import { withFallback } from "@/lib/api/withFallback";
import { photoCategoryLabels, classifiedCategoryLabels } from "@/lib/api/labels";
import { todayUpdates as MOCK_UPDATES, type TodayUpdate } from "@/lib/mock-content";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import { formatRelativeTimeAz } from "@/lib/relativeTime";

/**
 * "Bu gün kənddə" — a warm bulletin built from the most recent published
 * Photos and active Listings (there is no separate "village update/news"
 * entity — Phase 12 deliberately doesn't add one; this reuses the two
 * real content types that already carry recent, dated activity). Falls
 * back to the placeholder bulletin only if the API is unreachable.
 */
export async function TodayInVillage() {
  const { data: updates, isLive } = await withFallback(async () => {
    const [photos, listings] = await Promise.all([
      photosApi.getPaged({ publicationStatus: "Published", pageSize: 3 }, HOMEPAGE_REVALIDATE_SECONDS),
      listingsApi.getPaged({ listingStatus: "Active", pageSize: 3 }, HOMEPAGE_REVALIDATE_SECONDS),
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
      // Listings carry a real `postedAt` — Photos only carry `takenDate`
      // (when the photo was taken, not added), which isn't a meaningful
      // "recency" signal, so photo items intentionally get no date here.
      date: l.postedAt,
    }));

    // An empty result here is real, live data (the API answered — there
    // just happens to be nothing recent yet), not a failure. Throwing on
    // it would misreport a genuine empty state as an outage and silently
    // substitute the mock bulletin below with no indicator that it's
    // fabricated — exactly the P0-2 content-integrity bug this guards
    // against. Only an actual fetch failure (network/API error) should
    // reach the `withFallback` catch and mark `isLive: false`.
    return [...fromPhotos, ...fromListings];
  }, MOCK_UPDATES);

  if (updates.length === 0) return null;

  const [featured, ...rest] = updates;
  if (!featured) return null;

  const featuredTime = featured.date ? formatRelativeTimeAz(featured.date) : null;

  return (
    <Container as="section" id="bu-gun-kendde" className="scroll-mt-20 py-16 sm:py-20">
      <DataSourceNote isLive={isLive} />
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Kənd gündəliyi"
          title="Bu gün kənddə"
          description="Bu gün Musaküçədə nə baş verir? Abadlıq işlərindən məktəb nailiyyətlərinə qədər — kəndimizdə baş verənlər burada."
        />
        <Button href="/kendimizden" variant="outline" size="sm">
          Hamısına bax →
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-stone-light bg-paper shadow-md lg:col-span-7">
          <div className="aspect-[16/10] w-full">
            <VillagePhoto
              src={featured.image}
              alt={`${featured.title} (müvəqqəti demo foto)`}
              tone={featured.tone ?? "warm"}
              placeholderLabel={featured.title}
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="terracotta">{featured.category}</Badge>
              {featuredTime ? <span className="text-xs text-ink-faint">{featuredTime}</span> : null}
            </div>
            <h3 className="mt-3 line-clamp-2 font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-ink">
              {featured.title}
            </h3>
            <p className="mt-2 max-w-lg text-base leading-relaxed text-ink-soft">{featured.description}</p>
          </div>
        </div>

        {rest.length > 0 ? (
          <div className="flex flex-col divide-y divide-stone-light rounded-xl border border-stone-light bg-paper lg:col-span-5">
            {rest.map((item) => {
              const itemTime = item.date ? formatRelativeTimeAz(item.date) : null;
              return (
                <article key={item.title} className="flex gap-4 p-5">
                  {item.kind === "photo" ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                      <VillagePhoto
                        src={item.image}
                        alt={`${item.title} (müvəqqəti demo foto)`}
                        tone={item.tone ?? "warm"}
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest-light" />
                  )}
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{item.category}</Badge>
                      {itemTime ? <span className="text-[11px] text-ink-faint">{itemTime}</span> : null}
                    </div>
                    <h4 className="line-clamp-2 font-display text-[length:var(--text-h4)] leading-snug text-ink">{item.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </Container>
  );
}
