import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { historyApi } from "@/lib/api/history";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { HistoricalEventDto } from "@/lib/api/types";

const FALLBACK_EVENTS: HistoricalEventDto[] = [];

const ORAL_SOURCE_STATUSES = new Set(["TraditionalStory", "OralHistory"]);

/** Horizontal timeline teaser — oral-tradition entries are visually
 * marked (never presented as flat, verified fact). */
export async function OurHistory() {
  const { data: events } = await withFallback(
    () => historyApi.getPaged({ publicationStatus: "Published", pageSize: 7 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_EVENTS,
  );

  if (events.length === 0) return null;

  return (
    <div className="border-t border-stone-light bg-cream-deep">
      <Container as="section" className="py-16 sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Yaddaş"
            title="Kəndimizin tarixi"
            description="Musaküçənin yaranışından bu günə — mühüm tarixlər."
          />
          <Button href="/tariximiz" variant="ghost" size="sm">
            Tam tarixçəyə bax →
          </Button>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute top-3 right-0 left-0 hidden h-px bg-stone-light sm:block" />
          <div className="grid gap-8 sm:grid-cols-7 sm:gap-4">
            {events.map((entry) => (
              <div key={entry.id} className="relative">
                <span aria-hidden className="relative z-10 mb-3 hidden h-2.5 w-2.5 rounded-full bg-terracotta sm:block" />
                <p className="font-display text-lg text-forest">{entry.period}</p>
                <p className="mt-1 text-sm leading-snug text-ink-soft">{entry.title}</p>
                {ORAL_SOURCE_STATUSES.has(entry.sourceStatus) ? (
                  <Badge tone="terracotta" className="mt-2">
                    Rəvayət
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
