import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { SuggestionCta } from "@/components/forms/SuggestionCta";
import { educationApi } from "@/lib/api/education";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { educationKindLabels, sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript } from "@/lib/structuredData";
import { richTextToPlainText, sanitizeRichText } from "@/lib/richText";
import { cn } from "@/lib/cn";
import type { EducationEntryDto, EducationKind, PersonDto } from "@/lib/api/types";

type Props = { params: Promise<{ id: string }> };

// Narrative entries (a school's full history, a written-out story) run
// long and tend to carry several embedded photos in their content — the
// short-entry layout's fixed 5/7 split left a tall gap under the (short)
// cover image next to a much longer text column. These kinds get a
// single-column article layout instead; bio-style kinds (teacher/
// graduate/date entries, usually a short summary plus a portrait) keep
// the side-by-side layout, which suits them better.
const LONG_FORM_KINDS: EducationKind[] = ["Story", "SchoolHistory"];

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

  const isLongForm = LONG_FORM_KINDS.includes(entry.kind);

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="terracotta">{educationKindLabels[entry.kind]}</Badge>
        {entry.period ? <Badge tone="neutral">{entry.period}</Badge> : null}
      </div>

      <h1 className="mt-3 font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
        {entry.title}
      </h1>

      {entry.summary ? <p className="mt-5 text-base leading-relaxed text-ink-soft">{entry.summary}</p> : null}
      {entry.content ? (
        <div
          className={cn(
            "mt-4 text-base leading-relaxed text-ink-soft",
            "[&_p]:my-3 first:[&_p]:mt-0 last:[&_p]:mb-0",
            "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink",
            "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink",
            "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1",
            "[&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-forest-dark",
            "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-stone [&_blockquote]:pl-4 [&_blockquote]:italic",
            isLongForm
              ? "[&_img]:my-4 [&_img]:mx-auto [&_img]:max-h-[360px] [&_img]:max-w-full [&_img]:w-auto [&_img]:h-auto [&_img]:rounded-md [&_img]:shadow-sm"
              : "[&_img]:my-3 [&_img]:max-h-[420px] [&_img]:max-w-full [&_img]:w-auto [&_img]:h-auto [&_img]:rounded-md",
            "[&_table]:my-3 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse",
            "[&_th]:border [&_th]:border-stone-light [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold",
            "[&_td]:border [&_td]:border-stone-light [&_td]:px-2 [&_td]:py-1 [&_td]:align-top",
          )}
          // Content is sanitized (DOMPurify, fixed tag allowlist)
          // just above — the only safe way to render admin-authored
          // rich text here; never render entry.content directly.
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(entry.content) }}
        />
      ) : null}

      {relatedPerson ? (
        <Link
          href={`/insanlarimiz/${relatedPerson.id}`}
          className="mt-6 flex items-center gap-4 rounded-lg border border-stone-light bg-paper-soft p-4 transition-colors hover:border-forest-light/60 hover:bg-paper"
        >
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <VillagePhoto
              src={relatedPerson.coverImageUrl ?? undefined}
              alt={`${relatedPerson.firstName} ${relatedPerson.lastName}`}
              tone="forest"
              placeholderLabel={`${relatedPerson.firstName} ${relatedPerson.lastName}`}
              sizes="64px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Əlaqəli şəxs</p>
            <p className="mt-1 font-display text-lg text-ink">
              {relatedPerson.firstName} {relatedPerson.lastName}
            </p>
            {relatedPerson.occupation ? <p className="text-sm text-ink-soft">{relatedPerson.occupation}</p> : null}
          </div>
        </Link>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-light pt-5 text-xs text-ink-faint">
        <Badge tone="neutral">{sourceStatusLabels[entry.sourceStatus]}</Badge>
        {entry.sourceReference ? <span>{entry.sourceReference}</span> : null}
      </div>

      <div className="mt-6">
        <SuggestionCta targetEntityType="EducationEntry" targetEntityId={entry.id} />
      </div>
    </>
  );

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbJsonLd([
              { name: "Ana səhifə", path: "/" },
              { name: "Təhsil", path: "/tehsil" },
              { name: entry.title, path: `/tehsil/${entry.id}` },
            ]),
            articleJsonLd({
              headline: entry.title,
              description: entry.summary ?? (entry.content ? richTextToPlainText(entry.content) : educationKindLabels[entry.kind]),
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

        {isLongForm ? (
          <div className="mx-auto mt-6 max-w-3xl">
            {entry.coverImageUrl ? (
              <div className="aspect-[16/9] overflow-hidden rounded-xl shadow-photo">
                <VillagePhoto src={entry.coverImageUrl} alt={entry.title} tone="warm" placeholderLabel={entry.title} sizes="768px" />
              </div>
            ) : null}
            <div className={entry.coverImageUrl ? "mt-8" : undefined}>{body}</div>
          </div>
        ) : (
          <div className="mt-6 grid gap-10 lg:grid-cols-12">
            {entry.coverImageUrl ? (
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-24 aspect-[4/3] overflow-hidden rounded-xl shadow-photo">
                  <VillagePhoto src={entry.coverImageUrl} alt={entry.title} tone="warm" placeholderLabel={entry.title} />
                </div>
              </div>
            ) : null}

            <div className={entry.coverImageUrl ? "lg:col-span-7" : "lg:col-span-12 max-w-2xl"}>{body}</div>
          </div>
        )}
      </Container>
    </PageShell>
  );
}
