import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { videosApi } from "@/lib/api/videos";
import { withFallback } from "@/lib/api/withFallback";
import type { PagedResult, VideoDto } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Videolar — Musaküçə",
  description: "Musaküçə video arxivi — kənd həyatından görüntülər və söhbətlər.",
};

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
  pageSize: 30,
  totalCount: 1,
  totalPages: 1,
};

export default async function VideolarPage() {
  const { data: videos, isLive } = await withFallback(
    () => videosApi.getPaged({ publicationStatus: "Published", pageSize: 30 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={isLive} />
        <SectionHeading
          as="h1"
          eyebrow="Video arxivi"
          title="Videolar"
          description="Kənd həyatından görüntülər, söhbətlər və xatirələr."
          className="mb-10"
        />

        {videos.items.length === 0 ? (
          <EmptyState title="Hələ video əlavə edilməyib" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.items.map((video) => {
              const isPlayable = video.embedUrlOrKey.startsWith("http");
              const Wrapper = isPlayable ? "a" : "div";
              return (
                <Wrapper
                  key={video.id}
                  {...(isPlayable
                    ? { href: video.embedUrlOrKey, target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="group block"
                >
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <VillagePhoto
                      src={video.thumbnailUrl ?? undefined}
                      alt={video.title}
                      tone="warm"
                      placeholderLabel={video.title}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <p className="mt-2 font-medium text-ink">{video.title}</p>
                  {video.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{video.description}</p>
                  ) : null}
                  {video.category ? (
                    <Badge tone="neutral" className="mt-2">
                      {video.category}
                    </Badge>
                  ) : null}
                </Wrapper>
              );
            })}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
