import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HistoryBrowser } from "@/components/history/HistoryBrowser";
import { historyApi } from "@/lib/api/history";
import { withFallback } from "@/lib/api/withFallback";
import { withPublicDescription } from "@/lib/historyDefaults";
import type { HistoricalEventDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Tariximiz — Musaküçə",
  description: "Musaküçənin yaranışından bu günə mühüm tarixlər.",
};

const FALLBACK: PagedResult<HistoricalEventDto> = {
  items: [
    {
      id: "mock-1",
      title: "İlk məskunlaşma rəvayəti",
      period: "1200–1210",
      eventDate: null,
      description: "Yerli rəvayətə görə kəndin ilk sakinləri bu dövrdə məskunlaşıb.",
      detailedText: null,
      sourceStatus: "TraditionalStory",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      displayOrder: 1,
      publicationStatus: "Published",
      coverMediaAssetId: null,
      coverImageUrl: null,
      showInTimeline: true,
      isDefault: false,
      additionalImages: [],
    },
    {
      id: "mock-2",
      title: "Məscid tikilib başa çatır",
      period: "1903",
      eventDate: null,
      description: "Musaküçə kənd məscidinin inşası başa çatır.",
      detailedText: null,
      sourceStatus: "LocalResearch",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      displayOrder: 2,
      publicationStatus: "Published",
      coverMediaAssetId: null,
      coverImageUrl: null,
      showInTimeline: true,
      isDefault: false,
      additionalImages: [],
    },
    {
      id: "mock-3",
      title: "İlk məktəb açılır",
      period: "1928",
      eventDate: null,
      description: "Kənddə ilk məktəb fəaliyyətə başlayır.",
      detailedText: null,
      sourceStatus: "LocalResearch",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      displayOrder: 3,
      publicationStatus: "Published",
      coverMediaAssetId: null,
      coverImageUrl: null,
      showInTimeline: true,
      isDefault: false,
      additionalImages: [],
    },
  ],
  page: 1,
  pageSize: 20,
  totalCount: 3,
  totalPages: 1,
};

export default async function TariximizPage() {
  const { data: events, isLive } = await withFallback(
    () => historyApi.getPaged({ publicationStatus: "Published", pageSize: 20 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Yaddaş"
          title="Kəndimizin tarixi"
          description="Musaküçənin yaranışından bu günə — mühüm tarixlər."
          className="mb-10"
        />

        <HistoryBrowser initialData={{ ...events, items: events.items.map(withPublicDescription) }} initialIsLive={isLive} />
      </Container>
    </PageShell>
  );
}
