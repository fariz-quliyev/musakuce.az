import { Container } from "@/components/ui/Container";
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
 * "Zaman xəttində Musaküçə" — /kendimiz's interactive history timeline,
 * sourced from the same real, admin-managed HistoricalEvent records as
 * /tariximiz (already ordered by DisplayOrder server-side, so no
 * client-side re-sorting is needed) plus the singleton TimelineSettings
 * row (/admin/tarix/timeline) for the section's title/subtitle/on-off/
 * event cap/default selection. Renders nothing when settings.isActive is
 * false, or when there are no Published events with showInTimeline set —
 * same "hide rather than invent" convention as the homepage's OurHistory
 * teaser: sample/example history is exactly the kind of content that
 * must never be mistaken for a verified fact about the village. (In
 * practice this never renders empty: the AddHistoryTimelineFeature
 * migration seeds 6 placeholder events precisely so it doesn't.)
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
    <div className="border-y border-stone-light bg-cream-deep">
      <Container as="section" className="py-10 sm:py-14">
        <SectionHeading eyebrow="Kəndin tarixi" title={settings.title} description={settings.subtitle} className="mb-8" />
        <HistoryTimeline events={cappedEvents.map(withPublicDescription)} initialActiveIndex={initialActiveIndex} />
      </Container>
    </div>
  );
}
