import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { InterviewEmbed, extractVimeoId, extractYouTubeId } from "@/components/interviews/InterviewEmbed";
import { interviewsApi } from "@/lib/api/interviews";
import { peopleApi } from "@/lib/api/people";
import { ApiError } from "@/lib/api/client";
import { sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScript, videoObjectJsonLd } from "@/lib/structuredData";
import type { InterviewDto, PersonDto } from "@/lib/api/types";

function interviewEmbedUrl(interview: InterviewDto): string | null {
  if (interview.embedProvider === "YouTube") {
    return `https://www.youtube-nocookie.com/embed/${extractYouTubeId(interview.embedUrlOrKey)}`;
  }
  if (interview.embedProvider === "Vimeo") {
    return `https://player.vimeo.com/video/${extractVimeoId(interview.embedUrlOrKey)}`;
  }
  return null;
}

type Props = { params: Promise<{ id: string }> };

async function loadInterview(id: string): Promise<InterviewDto> {
  try {
    return await interviewsApi.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const interview = await loadInterview(id);
    return buildPageMetadata({
      title: interview.title ? `${interview.personName} — ${interview.title}` : interview.personName,
      description: interview.description ?? `${interview.personName} ilə müsahibə — Musaküçənin şifahi tarixi.`,
      path: `/kendimizin-sesi/${interview.id}`,
      imageUrl: interview.thumbnailImageUrl,
    });
  } catch {
    return buildPageMetadata({ title: "Kəndimizin səsi", description: "Musaküçə şifahi tarix arxivi.", path: `/kendimizin-sesi/${id}` });
  }
}

export default async function InterviewDetailPage({ params }: Props) {
  const { id } = await params;
  const interview = await loadInterview(id);

  const [relatedPerson, related] = await Promise.all([
    interview.relatedPersonId
      ? peopleApi.getById(interview.relatedPersonId).catch((): PersonDto | null => null)
      : Promise.resolve<PersonDto | null>(null),
    interviewsApi
      .getPaged({ publicationStatus: "Published", pageSize: 4 })
      .then((r) => r.items.filter((i) => i.id !== interview.id).slice(0, 3))
      .catch(() => [] as InterviewDto[]),
  ]);

  const embedUrl = interviewEmbedUrl(interview);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbJsonLd([
              { name: "Ana səhifə", path: "/" },
              { name: "Kəndimizin səsi", path: "/kendimizin-sesi" },
              { name: interview.personName, path: `/kendimizin-sesi/${interview.id}` },
            ]),
            ...(embedUrl
              ? [
                  videoObjectJsonLd({
                    name: interview.title ? `${interview.personName} — ${interview.title}` : interview.personName,
                    description: interview.description ?? `${interview.personName} ilə müsahibə — Musaküçənin şifahi tarixi.`,
                    embedUrl,
                    thumbnailUrl: interview.thumbnailImageUrl,
                    uploadDate: interview.recordingDate,
                  }),
                ]
              : []),
          ]),
        }}
      />
      <Container className="py-16 sm:py-20">
        <Link href="/kendimizin-sesi" className="text-sm text-ink-soft hover:text-forest">
          ← Kəndimizin səsi arxivinə qayıt
        </Link>

        <div className="mx-auto mt-6 max-w-3xl">
          <Badge tone="gold">Müsahibə</Badge>
          <h1 className="mt-3 font-display text-[length:var(--text-h1)] leading-[var(--text-h1--line-height)] text-ink">
            {interview.personName}
          </h1>
          {interview.title ? <p className="mt-2 text-lg text-ink-soft">{interview.title}</p> : null}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-faint">
            {interview.recordingDate ? (
              <span>
                {new Date(interview.recordingDate).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            ) : null}
            {relatedPerson ? (
              <span>
                İnsanlarımız: <span className="font-medium text-ink">{relatedPerson.firstName} {relatedPerson.lastName}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-6">
            <InterviewEmbed provider={interview.embedProvider} urlOrKey={interview.embedUrlOrKey} />
          </div>

          {interview.description ? (
            <p className="mt-6 text-base leading-relaxed text-ink-soft">{interview.description}</p>
          ) : null}

          {interview.transcript ? (
            <div className="mt-8 rounded-xl border border-stone-light bg-paper-soft p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">Söhbətin mətni</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{interview.transcript}</p>
            </div>
          ) : null}

          <p className="mt-6 border-t border-stone-light pt-4 text-xs text-ink-faint">{sourceStatusLabels[interview.sourceStatus]}</p>
        </div>

        {related.length > 0 ? (
          <div className="mx-auto mt-16 max-w-3xl">
            <h2 className="mb-5 font-display text-[length:var(--text-h4)] text-ink">Digər hekayələr</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/kendimizin-sesi/${r.id}`} className="group relative overflow-hidden rounded-lg">
                  <div className="aspect-square">
                    <VillagePhoto src={r.thumbnailImageUrl ?? undefined} alt={r.personName} tone="forest" placeholderLabel={r.personName} sizes="20vw" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                  <p className="absolute inset-x-0 bottom-0 p-3 font-display text-sm text-cream">{r.personName}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </PageShell>
  );
}
