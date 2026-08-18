import { SectionHeading } from "@/components/ui/SectionHeading";
import { HistoryTimeline } from "./HistoryTimeline";
import { historyApi } from "@/lib/api/history";
import { timelineSettingsApi } from "@/lib/api/timelineSettings";
import { withFallback } from "@/lib/api/withFallback";
import { withPublicDescription } from "@/lib/historyDefaults";
import type { HistoricalEventDto, TimelineSettingsDto } from "@/lib/api/types";

const FALLBACK_EVENTS: HistoricalEventDto[] = [];

// Same defaults the AddHistoryTimelineFeature migration seeds — used only
// if the settings API itself is unreachable, so the section still has a
// sensible heading rather than disappearing over an unrelated API hiccup.
const FALLBACK_SETTINGS: TimelineSettingsDto = {
  id: "mock",
  title: "Zaman xəttində Musaküçə",
  subtitle:
    "Nəsildən-nəslə ötürülən xatirələr, hadisələr və insanların zəhməti ilə bu günümüzə gəlib çatan Musaküçənin tarixi.",
  isActive: true,
  maxEventsDesktop: null,
  defaultSelection: "First",
  mobileBehavior: "HorizontalScroll",
};

/**
 * "Zaman xəttində Musaküçə" — /kendimiz's primary top-of-page visual
 * (rendered immediately after the site header, before the rest of the
 * page's own intro), sourced from the same real, admin-managed
 * HistoricalEvent records as /tariximiz (already ordered by DisplayOrder
 * server-side, so no client-side re-sorting is needed) plus the singleton
 * TimelineSettings row (/admin/tarix/timeline) for the section's
 * title/subtitle/on-off/event cap/default selection. Deliberately wider
 * than the site's standard `Container` (max-w-6xl) — a "museum wall"
 * band is the whole point here — but keeps the same safe side padding.
 * Renders nothing when settings.isActive is false, or when there are no
 * Published events with showInTimeline set — same "hide rather than
 * invent" convention as the homepage's OurHistory teaser: sample/example
 * history is exactly the kind of content that must never be mistaken
 * for a verified fact about the village. (In practice this never renders
 * empty: the AddHistoryTimelineFeature migration seeds 6 placeholder
 * events precisely so it doesn't.)
 */
export async function HistoryTimelineSection() {
  const [{ data: events }, { data: settings }] = await Promise.all([
    withFallback(() => historyApi.getPaged({ publicationStatus: "Published", pageSize: 30 }).then((r) => r.items), FALLBACK_EVENTS),
    withFallback(() => timelineSettingsApi.get(), FALLBACK_SETTINGS),
  ]);

  if (!settings.isActive) return null;

  const visibleEvents = events.filter((e) => e.showInTimeline);
  const cappedEvents = settings.maxEventsDesktop ? visibleEvents.slice(0, settings.maxEventsDesktop) : visibleEvents;

  if (cappedEvents.length === 0) return null;

  const initialActiveIndex = settings.defaultSelection === "Last" ? cappedEvents.length - 1 : 0;

  return (
    <div className="border-b border-stone-light bg-cream-deep">
      <section className="mx-auto w-full max-w-[100rem] px-5 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10 lg:px-12">
        <SectionHeading eyebrow="Kəndin tarixi" title={settings.title} description={settings.subtitle} className="mb-6" />
        <HistoryTimeline events={cappedEvents.map(withPublicDescription)} initialActiveIndex={initialActiveIndex} />
      </section>
    </div>
  );
}
