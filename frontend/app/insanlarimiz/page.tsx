import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PeopleBrowser } from "@/components/people/PeopleBrowser";
import { peopleApi } from "@/lib/api/people";
import { withFallback } from "@/lib/api/withFallback";
import { buildPageMetadata } from "@/lib/seo";
import { RelatedSections } from "@/components/ui/RelatedSections";
import type { PagedResult, PersonDto } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "İnsanlarımız",
  description: "Musaküçənin tanınmış və yadda qalan sakinləri.",
  path: "/insanlarimiz",
});

const FALLBACK: PagedResult<PersonDto> = {
  items: [
    {
      id: "mock-1",
      firstName: "Zeynəb",
      lastName: "müəllimə",
      fatherName: null,
      birthDate: null,
      deathDate: null,
      category: "Teacher",
      occupation: "Müəllim",
      biography: "Uzun illər kənd məktəbində dərs deyib.",
      coverMediaAssetId: null,
      coverImageUrl: null,
      sourceStatus: "UnderResearch",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      slug: "zeyneb-muellime",
      publicationStatus: "Published",
      additionalImages: [],
    },
    {
      id: "mock-2",
      firstName: "Kərim",
      lastName: "baba",
      fatherName: null,
      birthDate: null,
      deathDate: null,
      category: "AgriculturalWorker",
      occupation: "Əmək veterani",
      biography: "Sovxoz dövründə uzun illər zəhmət çəkib.",
      coverMediaAssetId: null,
      coverImageUrl: null,
      sourceStatus: "UnderResearch",
      sourceReference: null,
      editorialNote: null,
      originalSourceText: null,
      slug: "kerim-baba",
      publicationStatus: "Published",
      additionalImages: [],
    },
  ],
  page: 1,
  pageSize: 16,
  totalCount: 2,
  totalPages: 1,
};

export default async function InsanlarimizPage() {
  const { data: people, isLive } = await withFallback(
    () => peopleApi.getPaged({ publicationStatus: "Published", pageSize: 16 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Arxiv"
          title="İnsanlarımız"
          description="Kəndimizin tanınmış və yadda qalan sakinləri — alimlər, müəllimlər, idmançılar və digərləri."
          className="mb-10"
        />

        <PeopleBrowser initialData={people} initialIsLive={isLive} />

        <RelatedSections
          sections={[
            { href: "/tehsil", label: "Təhsil", description: "Məktəb tarixi, müəllimlər və məzunlar" },
            { href: "/tariximiz", label: "Tariximiz", description: "Kəndin yaranışından bu günə mühüm tarixlər" },
            { href: "/xatire", label: "Xatirə", description: "Aramızdan ayrılan sakinlərimizi xatırladığımız arxiv" },
          ]}
        />
      </Container>
    </PageShell>
  );
}
