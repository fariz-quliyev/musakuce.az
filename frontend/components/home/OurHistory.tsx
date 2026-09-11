import { Badge } from "@/components/ui/Badge";
import { HomeSection } from "@/components/home/HomeSection";
import { historyApi } from "@/lib/api/history";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { HistoricalEventDto } from "@/lib/api/types";

const FALLBACK_EVENTS: HistoricalEventDto[] = [];
const SHOWN = 3;

const ORAL_SOURCE_STATUSES = new Set(["TraditionalStory", "OralHistory"]);

/**
 * Three moments spread evenly across the curated timeline (first, middle,
 * last in display order) so the homepage spans the village's whole story
 * rather than its first three entries. There is no "featured" flag on
 * HistoricalEvent, so this is the one deterministic reading of "the
 * important ones" the data supports. Admin `showInTimeline` curation is
 * respected; if nothing is curated yet, every published event counts.
 */
function pickSpread<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  return Array.from({ length: count }, (_, i) => items[Math.round((i * (items.length - 1)) / (count - 1))]);
}

/** "Tariximiz" teaser — the full interactive timeline stays on /tariximiz.
 * Oral-tradition entries keep their "Rəvayət" marker so they're never
 * presented as verified fact. */
export async function OurHistory() {
  const { data: events } = await withFallback(
    () => historyApi.getPaged({ publicationStatus: "Published", pageSize: 50 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_EVENTS,
  );

  const curated = events.filter((e) => e.showInTimeline);
  const moments = pickSpread([...(curated.length > 0 ? curated : events)].sort((a, b) => a.displayOrder - b.displayOrder), SHOWN);
  if (moments.length === 0) return null;

  return (
    <HomeSection band="muted" title="Tariximiz" cta={{ label: "Musaküçənin tarixini öyrən", href: "/tariximiz" }}>
      <ol className="grid gap-5 md:grid-cols-3">
        {moments.map((entry) => (
          <li key={entry.id} className="flex flex-col rounded-lg border border-border border-t-primary border-t-2 bg-surface p-6">
            <p className="font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] font-semibold text-primary">
              {entry.period}
            </p>
            <p className="mt-2 text-base leading-snug font-medium text-text">{entry.title.trim()}</p>
            {ORAL_SOURCE_STATUSES.has(entry.sourceStatus) ? (
              <Badge tone="neutral" className="mt-4 w-fit">
                Rəvayət
              </Badge>
            ) : null}
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
