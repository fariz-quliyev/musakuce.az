import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { educationApi } from "@/lib/api/education";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { educationKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structuredData";
import type { EducationEntryDto, PersonDto } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }> };

async function loadEntry(id: string): Promise<EducationEntryDto> {
  try {
    return await educationApi.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const entry = await loadEntry(id);
    return buildPageMetadata({
      title: entry.title,
      description: entry.summary ?? `${educationKindLabels[entry.kind]} — Musaküçə təhsil arxivi.`,
      path: `/tehsil/${entry.id}`,
      imageUrl: entry.coverImageUrl,
    });
  } catch {
    return buildPageMetadata({ title: "Təhsil qeydi", description: "Musaküçə təhsil arxivi.", path: `/tehsil/${id}` });
  }
}

export default async function EducationDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = await loadEntry(id);

  let relatedPerson: PersonDto | null = null;
  if (entry.relatedPersonId) {
    try {
      relatedPerson = await peopleApi.getById(entry.relatedPersonId);
    } catch {
      relatedPerson = null;
    }
  }

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbJsonLd([
              { name: "Ana səhifə", path: "/" },
              { name: "Təhsil", path: "/tehsil" },
              { name: entry.title, path: `/tehsil/${entry.id}` },
            ]),
            articleJsonLd({
              headline: entry.title,
              description: entry.summary ?? entry.content ?? educationKindLabels[entry.kind],
              url: `/tehsil/${entry.id}`,
              imageUrl: entry.coverImageUrl,
            }),
          ]),
        }}
      />
      <Container className="py-16 sm:py-20">
        <Link href="/tehsil" className="text-sm text-ink-soft hover:text-forest">
          ← Təhsil arxivinə qayıt
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          {entry.coverImageUrl ? (
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-photo">
                <VillagePhoto src={entry.coverImageUrl} alt={entry.title} tone="warm" placeholderLabel={entry.title} />
              </div>
            </div>
          ) : null}

          <div className={entry.coverImageUrl ? "lg:col-span-7" : "lg:col-span-12 max-w-2xl"}>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="terracotta">{educationKindLabels[entry.kind]}</Badge>
              {entry.period ? <Badge tone="neutral">{entry.period}</Badge> : null}
            </div>

            <h1 className="mt-3 font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
              {entry.title}
            </h1>

            {entry.summary ? <p className="mt-5 text-base leading-relaxed text-ink-soft">{entry.summary}</p> : null}
            {entry.content ? <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink-soft">{entry.content}</p> : null}

            {relatedPerson ? (
              <div className="mt-6 rounded-lg border border-stone-light bg-paper-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Əlaqəli şəxs</p>
                <p className="mt-1 font-display text-lg text-ink">
                  {relatedPerson.firstName} {relatedPerson.lastName}
                </p>
                {relatedPerson.occupation ? <p className="text-sm text-ink-soft">{relatedPerson.occupation}</p> : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-light pt-5 text-xs text-ink-faint">
              <Badge tone="neutral">{sourceStatusLabels[entry.sourceStatus]}</Badge>
              {entry.sourceReference ? <span>{entry.sourceReference}</span> : null}
            </div>
          </div>
        </div>
      </Container>
    </PageShell>
  );
}
