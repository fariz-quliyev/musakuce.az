import Link from "next/link";
import { Card, CardMedia, CardBody, CardTitle } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { HomeSection } from "@/components/home/HomeSection";
import { cn } from "@/lib/cn";
import { peopleApi } from "@/lib/api/people";
import { withFallback } from "@/lib/api/withFallback";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepageCache";
import type { PersonDto } from "@/lib/api/types";

const FALLBACK_PEOPLE: PersonDto[] = [];

// Desktop: one column per person, each exactly as wide as a column of the
// full four-up grid (container minus three 1.5rem gaps, divided by four),
// and the row centred — so two people read as two normal cards, not a
// half-empty grid or two stretched ones.
const DESKTOP_COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-1 lg:max-w-[calc((100%_-_4.5rem)/4)]",
  2: "lg:grid-cols-2 lg:max-w-[calc((100%_-_4.5rem)/2_+_1.5rem)]",
  3: "lg:grid-cols-3 lg:max-w-[calc((100%_-_4.5rem)*3/4_+_3rem)]",
  4: "lg:grid-cols-4",
};

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
      <div className={cn("grid grid-cols-2 gap-6 lg:mx-auto", DESKTOP_COLUMNS[people.length])}>
        {people.map((person) => {
          const name = `${person.firstName} ${person.lastName}`;
          return (
            <Link key={person.id} href={`/insanlarimiz/${person.id}`} className="block h-full">
              <Card variant="flat" className="h-full">
                <CardMedia aspect="portrait">
                  <VillagePhoto
                    src={person.coverImageUrl ?? undefined}
                    alt={name}
                    tone="forest"
                    placeholderLabel={name}
                    sizes="(min-width: 1024px) 25vw, 50vw"
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
