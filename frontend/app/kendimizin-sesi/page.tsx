import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InterviewsBrowser } from "@/components/interviews/InterviewsBrowser";
import { interviewsApi } from "@/lib/api/interviews";
import { withFallback } from "@/lib/api/withFallback";
import { buildPageMetadata } from "@/lib/seo";
import type { InterviewDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Kəndimizin səsi",
  description: "Kənd sakinləri ilə söhbətlər və şifahi tarix qeydləri — Musaküçənin yaddaşı danışır.",
  path: "/kendimizin-sesi",
});

const FALLBACK: PagedResult<InterviewDto> = {
  items: [],
  page: 1,
  pageSize: 12,
  totalCount: 0,
  totalPages: 0,
};

export default async function KendimizinSesiPage() {
  const { data, isLive } = await withFallback(
    () => interviewsApi.getPaged({ publicationStatus: "Published", pageSize: 12 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Şifahi tarix"
          title="Kəndimizin səsi"
          description="Kəndimizin yaddaşı danışır — sakinlərimizin öz sözləri ilə xatirələr, hekayələr və ənənələr."
          className="mb-10"
        />

        <InterviewsBrowser initialData={data} initialIsLive={isLive} />
      </Container>
    </PageShell>
  );
}
