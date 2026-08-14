import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventsBrowser } from "@/components/events/EventsBrowser";
import { eventsApi } from "@/lib/api/events";
import { withFallback } from "@/lib/api/withFallback";
import type { EventDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Təqvim — Musaküçə",
  description: "Kənd təqvimi: görüş, tədbir və mərasimlər.",
};

const now = new Date();
const FALLBACK: PagedResult<EventDto> = {
  items: [
    {
      id: "mock-1",
      title: "Kənd məclisi",
      description: "Kənd sakinlərinin iştirakı ilə ümumi yığıncaq.",
      category: "Meeting",
      startsAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
      endsAt: null,
      location: "Mədəniyyət evi",
      placeId: null,
      organizerName: null,
      coverMediaAssetId: null,
      coverImageUrl: null,
      publicationStatus: "Published",
    },
    {
      id: "mock-2",
      title: "Uşaqlar üçün idman yarışı",
      description: "Məktəb həyətində keçiriləcək dostluq yarışı.",
      category: "Sports",
      startsAt: new Date(now.getTime() + 3 * 86400000).toISOString(),
      endsAt: null,
      location: "Məktəb həyəti",
      placeId: null,
      organizerName: null,
      coverMediaAssetId: null,
      coverImageUrl: null,
      publicationStatus: "Published",
    },
  ],
  page: 1,
  pageSize: 12,
  totalCount: 2,
  totalPages: 1,
};

export default async function TeqvimPage() {
  const { data: events, isLive } = await withFallback(
    () => eventsApi.getPaged({ publicationStatus: "Published", from: now.toISOString(), pageSize: 12 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Kənd meydanı"
          title="Kənd təqvimi"
          description="Bu həftə və gələcəkdə kənddə keçiriləcək tədbirlər."
          className="mb-10"
        />
        <EventsBrowser initialData={events} initialIsLive={isLive} />
      </Container>
    </PageShell>
  );
}
