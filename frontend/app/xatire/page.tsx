import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MemorialBrowser } from "@/components/memorial/MemorialBrowser";
import { memorialApi } from "@/lib/api/memorial";
import { withFallback } from "@/lib/api/withFallback";
import { buildPageMetadata } from "@/lib/seo";
import type { MemorialRecordDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Xatirə",
  description: "Aramızdan ayrılan kənd sakinlərimizi ehtiramla xatırladığımız arxiv.",
  path: "/xatire",
});

const FALLBACK: PagedResult<MemorialRecordDto> = {
  items: [],
  page: 1,
  pageSize: 60,
  totalCount: 0,
  totalPages: 0,
};

/** Deliberately the calmest page on the site — memorial design tokens
 * throughout (see globals.css), no lively terracotta/gold accents. */
export default async function XatirePage() {
  const { data, isLive } = await withFallback(() => memorialApi.getPaged({ publicationStatus: "Published", pageSize: 60 }), FALLBACK);

  return (
    <PageShell>
      <div className="bg-memorial-bg">
        <Container className="py-16 sm:py-20">
          <SectionHeading
            as="h1"
            eyebrow="Ehtiramla xatırlayırıq"
            title="Xatirə"
            description="Aramızdan ayrılan, müharibədə iştirak etmiş və kəndimizə əməyi keçmiş sakinlərimizin xatirəsi."
            tone="memorial"
            className="mb-10"
          />
          <MemorialBrowser initialData={data} initialIsLive={isLive} />
        </Container>
      </div>
    </PageShell>
  );
}
