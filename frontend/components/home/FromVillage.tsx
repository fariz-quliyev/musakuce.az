import Link from "next/link";
import { Card, CardMedia, CardBody, CardTitle, CardDescription } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { ArrowLink, HomeSection } from "@/components/home/HomeSection";
import { withFallback } from "@/lib/api/withFallback";
import { todayUpdates as MOCK_UPDATES, type TodayUpdate } from "@/lib/mock-content";
import { fetchVillageUpdates, HOME_UPDATES_COUNT } from "@/lib/villageUpdates";
import { fetchHomeGallery, GALLERY_MAX_PHOTOS } from "@/lib/homeGallery";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import { formatDateAz } from "@/lib/relativeTime";

/**
 * "Musaküçədən" — the newest items of the Kəndimizdən feed (see
 * lib/villageUpdates.ts). Deliberately not titled or styled as "news":
 * there is no News entity yet, and the feed is composed from photos and
 * listings, so the section mustn't suggest an editorial news desk. A
 * real News entity can take this slot later.
 *
 * Photos the gallery section is showing are left out, so no picture
 * appears twice on the homepage. The section always renders, so the
 * homepage keeps the same shape whatever the data: with nothing left to
 * show (e.g. every photo is in the gallery and there are no listings) it
 * shows a one-line empty state pointing to /kendimizden instead of cards.
 */
export async function FromVillage() {
  const [{ data: updates, isLive }, gallery] = await Promise.all([
    withFallback(
      // Over-fetch by the gallery's maximum so there are still enough
      // items left once its photos are removed.
      () => fetchVillageUpdates(HOME_UPDATES_COUNT + GALLERY_MAX_PHOTOS, HOMEPAGE_REVALIDATE_SECONDS),
      MOCK_UPDATES,
    ),
    fetchHomeGallery(),
  ]);

  const inGallery = new Set(gallery.photos.map((p) => p.id));
  const items = updates.filter((u) => !u.sourceId || !inGallery.has(u.sourceId)).slice(0, HOME_UPDATES_COUNT);

  if (items.length === 0) {
    return (
      <HomeSection title="Musaküçədən">
        <DataSourceNote isLive={isLive} />
        <div className="flex flex-col items-start gap-4 rounded-lg border border-border bg-surface-muted p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="text-base leading-relaxed text-text-muted">
            Kəndimizdən yeni məlumat, elan və görüntülər burada paylaşılacaq.
          </p>
          <ArrowLink href="/kendimizden" className="shrink-0">
            Kəndimizdən bölməsinə keç
          </ArrowLink>
        </div>
      </HomeSection>
    );
  }

  return (
    <HomeSection
      title="Musaküçədən"
      description="Kəndimizdən son yeniliklər"
      cta={{ label: "Bütün yeniliklər", href: "/kendimizden" }}
    >
      <DataSourceNote isLive={isLive} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <UpdateCard key={item.sourceId ?? item.title} item={item} />
        ))}
      </div>
    </HomeSection>
  );
}

function UpdateCard({ item }: { item: TodayUpdate }) {
  const date = item.date ? formatDateAz(item.date) : null;
  const card = (
    <Card variant="flat" className="h-full">
      <CardMedia aspect="video">
        <VillagePhoto
          src={item.image}
          alt={item.title}
          tone={item.tone ?? "warm"}
          placeholderLabel={item.category}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </CardMedia>
      <CardBody>
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-text-muted">
          {date ? (
            <>
              <time dateTime={item.date}>{date}</time>
              <span aria-hidden>·</span>
            </>
          ) : null}
          <span className="font-semibold text-primary">{item.category}</span>
        </p>
        <CardTitle className="mt-2 font-semibold">{item.title}</CardTitle>
        {/* A photo with no description falls back to its category label
            in the feed — don't print the same word twice. */}
        {item.description && item.description !== item.category ? (
          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
        ) : null}
      </CardBody>
    </Card>
  );

  return item.href ? (
    <Link href={item.href} className="block h-full">
      {card}
    </Link>
  ) : (
    card
  );
}
