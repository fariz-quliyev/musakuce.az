import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideosBrowser } from "@/components/videos/VideosBrowser";
import { videosApi } from "@/lib/api/videos";
import { withFallback } from "@/lib/api/withFallback";
import { buildPageMetadata } from "@/lib/seo";
import type { PagedResult, VideoDto } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Videolar",
  description: "Musaküçə video arxivi — kənd həyatından görüntülər və söhbətlər.",
  path: "/videolar",
});

const FALLBACK: PagedResult<VideoDto> = {
  items: [
    {
      id: "mock-1",
      title: "Kəndin qış mənzərələri",
      description: "Musaküçənin qış aylarında çəkilmiş qısa görüntülər.",
      embedProvider: "YouTube",
      embedUrlOrKey: "",
      thumbnailMediaAssetId: null,
      thumbnailUrl: null,
      category: "Kənd həyatı",
      recordedDate: null,
      sourceStatus: "FamilyArchive",
      publicationStatus: "Published",
    },
  ],
  page: 1,
  pageSize: 18,
  totalCount: 1,
  totalPages: 1,
};

export default async function VideolarPage() {
  const { data: videos, isLive } = await withFallback(
    () => videosApi.getPaged({ publicationStatus: "Published", pageSize: 18 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Video arxivi"
          title="Videolar"
          description="Kənd həyatından görüntülər, söhbətlər və xatirələr."
          className="mb-10"
        />

        <VideosBrowser initialData={videos} initialIsLive={isLive} />
      </Container>
    </PageShell>
  );
}
