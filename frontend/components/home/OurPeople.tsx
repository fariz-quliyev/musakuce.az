import Link from "next/link";
import { Card, CardMedia, CardBody, CardTitle } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HomeSection } from "@/components/home/HomeSection";
import { peopleApi } from "@/lib/api/people";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PersonDto } from "@/lib/api/types";

const FALLBACK_PEOPLE: PersonDto[] = [];

/** "Musaküçənin insanları" — the four most recently published profiles:
 * portrait, name, occupation. Everything else is on the profile page. */
export async function OurPeople() {
  const { data: people } = await withFallback(
    () => peopleApi.getPaged({ publicationStatus: "Published", pageSize: 4 }, HOMEPAGE_REVALIDATE_SECONDS).then((r) => r.items),
    FALLBACK_PEOPLE,
  );

  if (people.length === 0) return null;

  return (
    <HomeSection title="Musaküçənin insanları" cta={{ label: "Bütün insanlara bax", href: "/insanlarimiz" }}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {people.map((person) => {
          const name = `${person.firstName} ${person.lastName}`;
          return (
            <Link key={person.id} href={`/insanlarimiz/${person.id}`} className="block h-full">
              <Card variant="flat" className="h-full">
                {/* Square on the one-column mobile layout so four
                    stacked portraits don't turn into a long scroll. */}
                <CardMedia aspect="portrait" className="aspect-square sm:aspect-[3/4]">
                  <VillagePhoto
                    src={person.coverImageUrl ?? undefined}
                    alt={name}
                    tone="forest"
                    placeholderLabel={name}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                </CardMedia>
                <CardBody>
                  <CardTitle className="font-semibold">{name}</CardTitle>
                  {person.occupation ? <p className="mt-1 line-clamp-1 text-sm text-text-muted">{person.occupation}</p> : null}
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}
