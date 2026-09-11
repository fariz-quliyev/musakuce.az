import Link from "next/link";
import { Card, CardMedia, CardBody, CardTitle, CardDescription } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { HomeSection } from "@/components/home/HomeSection";
import { withFallback } from "@/lib/api/withFallback";
import { todayUpdates as MOCK_UPDATES, type TodayUpdate } from "@/lib/mock-content";
import { fetchVillageUpdates, HOME_NEWS_COUNT } from "@/lib/villageUpdates";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import { formatDateAz } from "@/lib/relativeTime";

/**
 * "Son xəbərlər" — the three newest items of the Kəndimizdən feed (see
 * lib/villageUpdates.ts), as equal cards: photo, date · category, title,
 * one short paragraph. The full feed lives at /kendimizden.
 */
export async function LatestNews() {
  const { data: updates, isLive } = await withFallback(
    () => fetchVillageUpdates(HOME_NEWS_COUNT, HOMEPAGE_REVALIDATE_SECONDS),
    MOCK_UPDATES,
  );
  const items = updates.slice(0, HOME_NEWS_COUNT);
  if (items.length === 0) return null;

  return (
    <HomeSection title="Son xəbərlər" cta={{ label: "Bütün xəbərlər", href: "/kendimizden" }}>
      <DataSourceNote isLive={isLive} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.sourceId ?? item.title} item={item} />
        ))}
      </div>
    </HomeSection>
  );
}

function NewsCard({ item }: { item: TodayUpdate }) {
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
