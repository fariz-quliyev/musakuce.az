import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardMedia, CardBody, CardTitle, CardMeta } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { peopleApi } from "@/lib/api/people";
import { withFallback } from "@/lib/api/withFallback";
import { personCategoryLabels } from "@/lib/api/labels";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PersonDto } from "@/lib/api/types";

const FALLBACK_PEOPLE: PersonDto[] = [];

/** Encyclopedia + family-album feel — portrait photos, quiet cards, no
 * social-media styling. Shows the most recently published profiles. */
export async function OurPeople() {
  const { data: people } = await withFallback(
    () => peopleApi.getPaged({ publicationStatus: "Published", pageSize: 4 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_PEOPLE,
  );

  if (people.length === 0) return null;

  return (
    <Container as="section" className="py-16 sm:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Arxiv"
          title="İnsanlarımız"
          description="Kəndimizin tanınmış və yadda qalan sakinləri."
        />
        <Button href="/insanlarimiz" variant="ghost" size="sm">
          Hamısına bax →
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {people.map((person) => (
          <Card key={person.id} variant="default">
            <CardMedia aspect="portrait">
              <VillagePhoto
                src={person.coverImageUrl ?? undefined}
                alt={`${person.firstName} ${person.lastName}`}
                tone="forest"
                placeholderLabel={`${person.firstName} ${person.lastName}`}
                sizes="(min-width: 640px) 25vw, 50vw"
              />
            </CardMedia>
            <CardBody>
              <CardTitle className="text-base">
                {person.firstName} {person.lastName}
              </CardTitle>
              {person.occupation ? <p className="mt-1 text-sm text-ink-soft">{person.occupation}</p> : null}
              <CardMeta>
                <Badge tone="forest">{personCategoryLabels[person.category]}</Badge>
              </CardMeta>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}
