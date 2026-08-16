import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotosBrowser } from "@/components/photos/PhotosBrowser";
import { photosApi } from "@/lib/api/photos";
import { withFallback } from "@/lib/api/withFallback";
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
  pageSize: 24,
  totalCount: 1,
  totalPages: 1,
};

export default async function FotoalbomPage() {
  const { data: photos, isLive } = await withFallback(
    () => photosApi.getPaged({ publicationStatus: "Published", pageSize: 24 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Fotoarxiv"
          title="Fotoalbom"
          description="Köhnə Musaküçədən bugünkü kənd həyatına — hər foto bir hekayə daşıyır."
          className="mb-10"
        />

        <PhotosBrowser initialData={photos} initialIsLive={isLive} />
      </Container>
    </PageShell>
  );
}
