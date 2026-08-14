import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CulturalHeritageBrowser } from "@/components/culturalHeritage/CulturalHeritageBrowser";
import { culturalHeritageApi } from "@/lib/api/culturalHeritage";
import { withFallback } from "@/lib/api/withFallback";
import { buildPageMetadata } from "@/lib/seo";
import type { CulturalHeritageItemDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Mədəni irs",
  description: "Kəndin adət-ənənələri, sənətkarlığı, folkloru və mədəni irsi.",
  path: "/medeniyyet",
});

const FALLBACK: PagedResult<CulturalHeritageItemDto> = {
  items: [],
  page: 1,
  pageSize: 60,
  totalCount: 0,
  totalPages: 0,
};

export default async function MedeniyyetPage() {
  const { data } = await withFallback(
    () => culturalHeritageApi.getPaged({ publicationStatus: "Published", pageSize: 60 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Mədəni irs"
          title="Mədəni irs"
          description="Ənənələr, sənətkarlıq, folklor, mətbəx və adətlər — nəsildən-nəslə keçən yerli bilik."
          className="mb-10"
        />
        <CulturalHeritageBrowser initialData={data} />
      </Container>
    </PageShell>
  );
}
