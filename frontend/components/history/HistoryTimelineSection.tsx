import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HistoryTimeline } from "./HistoryTimeline";
import { historyApi } from "@/lib/api/history";
import { withFallback } from "@/lib/api/withFallback";
import type { HistoricalEventDto } from "@/lib/api/types";

const FALLBACK_EVENTS: HistoricalEventDto[] = [];

/**
 * "Zaman xəttində Musaküçə" — /kendimiz's interactive history timeline,
 * sourced from the same real, admin-managed HistoricalEvent records as
 * /tariximiz (already ordered by DisplayOrder server-side, so no
 * client-side re-sorting is needed). Renders nothing until at least one
 * event is actually published — same "hide rather than invent"
 * convention as the homepage's OurHistory teaser: sample/example
 * history is exactly the kind of content that must never be mistaken
 * for a verified fact about the village.
 */
export async function HistoryTimelineSection() {
  const { data: events } = await withFallback(
    () => historyApi.getPaged({ publicationStatus: "Published", pageSize: 30 }).then((r) => r.items),
    FALLBACK_EVENTS,
  );

  if (events.length === 0) return null;

  return (
    <div className="border-y border-stone-light bg-cream-deep">
      <Container as="section" className="py-10 sm:py-14">
        <SectionHeading
          eyebrow="Kəndin tarixi"
          title="Zaman xəttində Musaküçə"
          description="Nəsildən-nəslə ötürülən xatirələr, hadisələr və insanların zəhməti ilə bu günümüzə gəlib çatan Musaküçənin tarixi."
          className="mb-8"
        />
        <HistoryTimeline events={events} />
      </Container>
    </div>
  );
}
