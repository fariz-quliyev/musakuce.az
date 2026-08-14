import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { historyApi } from "@/lib/api/history";
import { withFallback } from "@/lib/api/withFallback";
import { sourceStatusLabels } from "@/lib/api/labels";
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
      sourceStatus: "TraditionalStory",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      displayOrder: 1,
      publicationStatus: "Published",
    },
    {
      id: "mock-2",
      title: "Məscid tikilib başa çatır",
      period: "1903",
      eventDate: null,
      description: "Musaküçə kənd məscidinin inşası başa çatır.",
      sourceStatus: "LocalResearch",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      displayOrder: 2,
      publicationStatus: "Published",
    },
    {
      id: "mock-3",
      title: "İlk məktəb açılır",
      period: "1928",
      eventDate: null,
      description: "Kənddə ilk məktəb fəaliyyətə başlayır.",
      sourceStatus: "LocalResearch",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      displayOrder: 3,
      publicationStatus: "Published",
    },
  ],
  page: 1,
  pageSize: 50,
  totalCount: 3,
  totalPages: 1,
};

export default async function TariximizPage() {
  const { data: events, isLive } = await withFallback(
    () => historyApi.getPaged({ publicationStatus: "Published", pageSize: 50 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={isLive} />
        <SectionHeading
          as="h1"
          eyebrow="Yaddaş"
          title="Kəndimizin tarixi"
          description="Musaküçənin yaranışından bu günə — mühüm tarixlər."
          className="mb-10"
        />

        {events.items.length === 0 ? (
          <EmptyState title="Hələ tarixi məlumat əlavə edilməyib" />
        ) : (
          <ol className="relative space-y-8 border-l border-stone-light pl-8">
            {events.items.map((event) => (
              <li key={event.id} className="relative">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[calc(2rem+2.5px)] h-2.5 w-2.5 rounded-full bg-terracotta"
                />
                <p className="font-display text-xl text-forest">{event.period}</p>
                <h3 className="mt-1 font-display text-lg text-ink">{event.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  {event.description}
                </p>
                <Badge tone="terracotta" className="mt-2">
                  {sourceStatusLabels[event.sourceStatus]}
                </Badge>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </PageShell>
  );
}
