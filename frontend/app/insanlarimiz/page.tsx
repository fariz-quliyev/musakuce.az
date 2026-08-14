import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardMedia, CardBody, CardTitle, CardMeta } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { peopleApi } from "@/lib/api/people";
import { withFallback } from "@/lib/api/withFallback";
import { personCategoryLabels } from "@/lib/api/labels";
import type { PagedResult, PersonDto } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "İnsanlarımız — Musaküçə",
  description: "Musaküçənin tanınmış və yadda qalan sakinləri.",
};

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
    },
  ],
  page: 1,
  pageSize: 24,
  totalCount: 2,
  totalPages: 1,
};

export default async function InsanlarimizPage() {
  const { data: people, isLive } = await withFallback(
    () => peopleApi.getPaged({ publicationStatus: "Published", pageSize: 24 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={isLive} />
        <SectionHeading
          as="h1"
          eyebrow="Arxiv"
          title="İnsanlarımız"
          description="Kəndimizin tanınmış və yadda qalan sakinləri — alimlər, müəllimlər, idmançılar və digərləri."
          className="mb-10"
        />

        {people.items.length === 0 ? (
          <EmptyState title="Hələ profil əlavə edilməyib" />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {people.items.map((person) => (
              <Card key={person.id} variant="default">
                <CardMedia aspect="portrait">
                  <VillagePhoto
                    src={person.coverImageUrl ?? undefined}
                    alt={`${person.firstName} ${person.lastName}`}
                    tone="forest"
                    placeholderLabel={`${person.firstName} ${person.lastName}`}
                  />
                </CardMedia>
                <CardBody>
                  <CardTitle className="text-base">
                    {person.firstName} {person.lastName}
                  </CardTitle>
                  {person.occupation ? (
                    <p className="mt-1 text-sm text-ink-soft">{person.occupation}</p>
                  ) : null}
                  <CardMeta>
                    <Badge tone="forest">{personCategoryLabels[person.category]}</Badge>
                  </CardMeta>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
