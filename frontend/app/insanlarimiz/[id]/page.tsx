import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { PersonPhotoAlbum } from "@/components/people/PersonPhotoAlbum";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { personCategoryLabels, sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript } from "@/lib/structuredData";
import { richTextToPlainText, sanitizeRichText } from "@/lib/richText";
import { cn } from "@/lib/cn";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await loadPerson(id);
    const fullName = `${person.firstName} ${person.lastName}`;
    return buildPageMetadata({
      title: fullName,
      description: person.occupation || richTextToPlainText(person.biography).slice(0, 160) || personCategoryLabels[person.category],
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
              description: person.occupation || richTextToPlainText(person.biography),
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
            <h1 className="font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
              {fullName}
            </h1>

            {person.occupation ? (
              <p className="mt-2 text-lg leading-relaxed text-ink-soft">{person.occupation}</p>
            ) : null}

            <div
              className={cn(
                "mt-5 max-w-2xl text-base leading-relaxed text-ink-soft",
                "[&_p]:my-3 first:[&_p]:mt-0 last:[&_p]:mb-0",
                "[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink",
                "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink",
                "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1",
                "[&_a]:text-forest [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-forest-dark",
                "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-stone [&_blockquote]:pl-4 [&_blockquote]:italic",
                "[&_img]:my-3 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md",
              )}
              // Biography is sanitized (DOMPurify, fixed tag allowlist)
              // just above — the only safe way to render admin-authored
              // rich text here; never render person.biography directly.
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(person.biography) }}
            />

            {person.additionalImages.length > 0 ? (
              <div className="mt-8 max-w-2xl">
                <h2 className="mb-3 font-display text-lg font-semibold text-ink">Fotoalbom</h2>
                <PersonPhotoAlbum images={person.additionalImages} personName={fullName} />
              </div>
            ) : null}

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
