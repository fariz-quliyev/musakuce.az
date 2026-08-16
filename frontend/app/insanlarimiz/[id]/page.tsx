import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { personCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript } from "@/lib/structuredData";
import type { PersonDto } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }> };

async function loadPerson(id: string): Promise<PersonDto> {
  try {
    return await peopleApi.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

/** "1930 – 2005" / "1930" / "v. 2005" — only ever built from fields that
 * are actually present, never invented. */
function lifeSpan(person: PersonDto): string | null {
  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;
  if (birthYear && deathYear) return `${birthYear} – ${deathYear}`;
  if (birthYear) return `${birthYear}`;
  if (deathYear) return `v. ${deathYear}`;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await loadPerson(id);
    const fullName = `${person.firstName} ${person.lastName}`;
    return buildPageMetadata({
      title: fullName,
      description: person.occupation ?? personCategoryLabels[person.category],
      path: `/insanlarimiz/${person.id}`,
      imageUrl: person.coverImageUrl,
    });
  } catch {
    return buildPageMetadata({ title: "Şəxs", description: "Musaküçə insanlar arxivi.", path: `/insanlarimiz/${id}` });
  }
}

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;
  const person = await loadPerson(id);
  const fullName = [person.firstName, person.fatherName, person.lastName].filter(Boolean).join(" ");
  const span = lifeSpan(person);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbJsonLd([
              { name: "Ana səhifə", path: "/" },
              { name: "İnsanlarımız", path: "/insanlarimiz" },
              { name: fullName, path: `/insanlarimiz/${person.id}` },
            ]),
            articleJsonLd({
              headline: fullName,
              description: person.occupation ?? person.biography,
              url: `/insanlarimiz/${person.id}`,
              imageUrl: person.coverImageUrl,
            }),
          ]),
        }}
      />
      <Container className="py-16 sm:py-20">
        <Link href="/insanlarimiz" className="text-sm text-ink-soft hover:text-forest">
          ← İnsanlarımıza qayıt
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="aspect-[3/4] overflow-hidden rounded-xl shadow-photo">
              <VillagePhoto
                src={person.coverImageUrl ?? undefined}
                alt={fullName}
                tone="forest"
                placeholderLabel={fullName}
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="forest">{personCategoryLabels[person.category]}</Badge>
              {span ? <Badge tone="neutral">{span}</Badge> : null}
            </div>

            <h1 className="mt-3 font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
              {fullName}
            </h1>

            {person.occupation ? (
              <p className="mt-2 text-lg leading-relaxed text-ink-soft">{person.occupation}</p>
            ) : null}

            <p className="mt-5 max-w-2xl text-base leading-relaxed whitespace-pre-line text-ink-soft">
              {person.biography}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-light pt-5 text-xs text-ink-faint">
              <Badge tone="neutral">{sourceStatusLabels[person.sourceStatus]}</Badge>
              {person.sourceReference ? <span>{person.sourceReference}</span> : null}
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
