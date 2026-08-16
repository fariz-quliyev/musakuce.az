import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LocalInfoBrowser } from "@/components/localInfo/LocalInfoBrowser";
import { localInfoApi } from "@/lib/api/localInfo";
import { withFallback } from "@/lib/api/withFallback";
import type { LocalInfoEntryDto, LocalInfoKind, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Faydalı məlumatlar — Musaküçə",
  description: "Yerli xidmətlər, faydalı əlaqələr və tövsiyələr — elektrik ustası, aptek, taksi və digərləri.",
};

const FALLBACK: PagedResult<LocalInfoEntryDto> = {
  items: [
    {
      id: "mock-1",
      name: "Vaqif — Elektrik ustası",
      kind: "Service",
      category: "Elektrik",
      description: "Ev və təsərrüfat elektrik işləri.",
      contactInfo: null,
      areaServed: "Musaküçə",
      photoMediaAssetId: null,
      photoUrl: null,
      attachedToEntryId: null,
      publicationStatus: "Published",
    },
    {
      id: "mock-2",
      name: "Mərkəz aptek",
      kind: "Contact",
      category: "Səhiyyə",
      description: null,
      contactInfo: null,
      areaServed: null,
      photoMediaAssetId: null,
      photoUrl: null,
      attachedToEntryId: null,
      publicationStatus: "Published",
    },
    {
      id: "mock-3",
      name: "Aygün — Tikiş ustası",
      kind: "Craftsman",
      category: "Tikiş",
      description: null,
      contactInfo: null,
      areaServed: null,
      photoMediaAssetId: null,
      photoUrl: null,
      attachedToEntryId: null,
      publicationStatus: "Published",
    },
  ],
  page: 1,
  pageSize: 24,
  totalCount: 3,
  totalPages: 1,
};

type Props = { searchParams: Promise<{ kind?: string }> };

export default async function FaydaliMelumatlarPage({ searchParams }: Props) {
  const { kind } = await searchParams;
  const activeKind = (kind as LocalInfoKind | undefined) ?? undefined;

  const { data: entries, isLive } = await withFallback(
    () => localInfoApi.getPaged({ publicationStatus: "Published", kind: activeKind, pageSize: 24 }),
    activeKind ? { ...FALLBACK, items: FALLBACK.items.filter((e) => e.kind === activeKind) } : FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Kənd meydanı"
          title="Faydalı məlumatlar"
          description="Yerli xidmətlər, faydalı əlaqələr, ustalar və tövsiyələr — Yerli Faydalı Məlumatlar arxivindən."
          className="mb-8"
        />

        <LocalInfoBrowser initialData={entries} initialIsLive={isLive} initialKind={activeKind} />
      </Container>
    </PageShell>
  );
}
