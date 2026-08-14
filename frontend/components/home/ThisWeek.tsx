import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { eventsApi } from "@/lib/api/events";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { EventDto } from "@/lib/api/types";

const DAY_LABELS = ["Baz", "B.e", "Ç.a", "Çər", "C.a", "Cüm", "Şən"]; // Date.getDay(): 0=Bazar..6=Şənbə

const FALLBACK_EVENTS: EventDto[] = [];

/**
 * "Bu həftə kənddə" — a connected timeline strip sourced from the real
 * upcoming events (Təqvim). Wraps into a filled row on wider screens (so
 * events never leave a half-empty container) and becomes a
 * horizontal-scroll strip only on narrow mobile viewports.
 */
export async function ThisWeek() {
  // Rounded to the minute rather than the exact instant — an exact
  // `now` would make the fetch URL unique on every request and defeat
  // the revalidate cache below (worst case with the rounding: an event
  // that started up to 60s ago briefly still appears, which is fine).
  const from = new Date();
  from.setSeconds(0, 0);

  const { data: events } = await withFallback(
    () => eventsApi.getPaged({ pageSize: 5, from: from.toISOString() }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_EVENTS,
  );

  if (events.length === 0) return null;

  return (
    <Container as="section" className="py-16 sm:py-20">
      <SectionHeading
        eyebrow="Təqvim"
        title="Bu həftə kənddə"
        description="Kənddə keçiriləcək görüş, tədbir və mərasimlər."
        className="mb-8"
      />
      <div className="relative">
        <div aria-hidden className="absolute top-8 right-4 left-4 hidden h-px bg-stone-light sm:block" />
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {events.map((event) => {
            const startsAt = new Date(event.startsAt);
            return (
              <article
                key={event.id}
                className="relative flex w-64 shrink-0 flex-col items-start gap-3 rounded-lg border border-stone-light bg-paper p-4 shadow-sm sm:w-[calc(20%-0.8rem)] sm:min-w-52"
              >
                <div className="relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-forest text-cream">
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
                    {DAY_LABELS[startsAt.getDay()]}
                  </span>
                  <span className="font-display text-lg leading-none">{startsAt.getDate()}</span>
                </div>
                <div>
                  <h3 className="font-display text-base leading-snug text-ink">{event.title}</h3>
                  <p className="mt-1 text-xs text-ink-faint">{event.location}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
