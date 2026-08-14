import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { memorialApi } from "@/lib/api/memorial";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { memorialCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/structuredData";
import type { MemorialRecordDto, PersonDto } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }> };

async function loadRecord(id: string): Promise<MemorialRecordDto> {
  try {
    return await memorialApi.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const record = await loadRecord(id);
    return buildPageMetadata({
      title: record.fullName,
      description: `${memorialCategoryLabels[record.category]} — Musaküçə xatirə arxivi.`,
      path: `/xatire/${record.id}`,
      imageUrl: record.coverImageUrl,
    });
  } catch {
    return buildPageMetadata({ title: "Xatirə", description: "Musaküçə xatirə arxivi.", path: `/xatire/${id}` });
  }
}

function formatYear(date: string | null): string | null {
  if (!date) return null;
  return String(new Date(date).getFullYear());
}

export default async function MemorialDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await loadRecord(id);

  let relatedPerson: PersonDto | null = null;
  if (record.relatedPersonId) {
    try {
      relatedPerson = await peopleApi.getById(record.relatedPersonId);
    } catch {
      relatedPerson = null;
    }
  }

  const birthYear = formatYear(record.birthDate);
  const deathYear = formatYear(record.deathDate);

  return (
    <PageShell>
      {/* Breadcrumb only — Phase 14 §6 explicitly avoids inventing a
          schema.org type for memorial records (no honest Person/Memorial fit). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: "Ana səhifə", path: "/" },
              { name: "Xatirə", path: "/xatire" },
              { name: record.fullName, path: `/xatire/${record.id}` },
            ]),
          ),
        }}
      />
      <div className="bg-memorial-bg">
        <Container className="py-16 sm:py-20">
          <Link href="/xatire" className="text-sm text-memorial-accent hover:underline">
            ← Xatirə arxivinə qayıt
          </Link>

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full shadow-sm">
              <VillagePhoto src={record.coverImageUrl ?? undefined} alt={record.fullName} tone="memorial" placeholderLabel="" />
            </div>

            <Badge tone="memorial" className="mt-5">
              {memorialCategoryLabels[record.category]}
            </Badge>

            <h1 className="mt-3 font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-memorial-ink">
              {record.fullName}
            </h1>
            {record.fatherName ? <p className="mt-1 text-sm text-memorial-accent">{record.fatherName}</p> : null}

            {birthYear || deathYear ? (
              <p className="mt-2 text-sm text-memorial-ink/70">
                {birthYear ?? "?"} {deathYear ? `– ${deathYear}` : ""}
              </p>
            ) : null}

            {record.biography ? (
              <p className="mt-6 text-left text-base leading-relaxed text-memorial-ink/90">{record.biography}</p>
            ) : null}

            {record.achievements ? (
              <div className="mt-6 rounded-lg border border-memorial-line bg-memorial-surface p-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-memorial-accent">Nailiyyətlər</p>
                <p className="mt-2 text-sm leading-relaxed text-memorial-ink/90">{record.achievements}</p>
              </div>
            ) : null}

            {relatedPerson ? (
              <div className="mt-6 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-memorial-accent">İnsanlarımız profili</p>
                <p className="mt-1 font-display text-lg text-memorial-ink">
                  {relatedPerson.firstName} {relatedPerson.lastName}
                </p>
                {relatedPerson.occupation ? <p className="text-sm text-memorial-ink/70">{relatedPerson.occupation}</p> : null}
              </div>
            ) : null}

            <p className="mt-8 border-t border-memorial-line pt-4 text-xs text-memorial-ink/60">
              {sourceStatusLabels[record.sourceStatus]}
            </p>
          </div>
        </Container>
      </div>
    </PageShell>
  );
}
