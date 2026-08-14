import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { photosApi } from "@/lib/api/photos";
import { withFallback } from "@/lib/api/withFallback";
import { photoCategoryLabels } from "@/lib/api/labels";
import type { PagedResult, PhotoDto } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Fotoalbom — Musaküçə",
  description: "Musaküçə fotoarxivi — köhnə şəkillərdən bugünkü kənd həyatına.",
};

const FALLBACK: PagedResult<PhotoDto> = {
  items: [
    {
      id: "mock-1",
      title: "1962 — məktəbin ilk məzunları",
      takenDate: "1962-06-01",
      location: null,
      description: null,
      story: "Yeni məktəb binasının açılışından bir il sonra çəkilib.",
      category: "Mezunlar",
      sourceStatus: "FamilyArchive",
      uploaderName: null,
      mediaAssetId: "mock-media-1",
      imageUrl: "",
      altText: null,
      publicationStatus: "Published",
    },
  ],
  page: 1,
  pageSize: 30,
  totalCount: 1,
  totalPages: 1,
};

export default async function FotoalbomPage() {
  const { data: photos, isLive } = await withFallback(
    () => photosApi.getPaged({ publicationStatus: "Published", pageSize: 30 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={isLive} />
        <SectionHeading
          as="h1"
          eyebrow="Fotoarxiv"
          title="Fotoalbom"
          description="Köhnə Musaküçədən bugünkü kənd həyatına — hər foto bir hekayə daşıyır."
          className="mb-10"
        />

        {photos.items.length === 0 ? (
          <EmptyState title="Hələ foto əlavə edilməyib" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {photos.items.map((photo) => (
              <div key={photo.id} className="group">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <VillagePhoto
                    src={photo.imageUrl || undefined}
                    alt={photo.title}
                    tone="warm"
                    placeholderLabel={photo.title}
                    sizes="(min-width: 640px) 25vw, 50vw"
                  />
                </div>
                <p className="mt-2 truncate text-sm font-medium text-ink">{photo.title}</p>
                <Badge tone="neutral" className="mt-1">
                  {photoCategoryLabels[photo.category]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
