import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DataSourceNote } from "@/components/layout/DataSourceNote";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Card, CardMedia, CardBody, CardTitle, CardDescription } from "@/components/ui/Card";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { EmptyState } from "@/components/ui/EmptyState";
import { educationApi } from "@/lib/api/education";
import { photosApi } from "@/lib/api/photos";
import { videosApi } from "@/lib/api/videos";
import { withFallback } from "@/lib/api/withFallback";
import { educationEntryKindLabel, sourceStatusLabels } from "@/lib/api/labels";
import { buildPageMetadata } from "@/lib/seo";
import type { EducationEntryDto, EducationKind, PhotoDto, VideoDto } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Təhsil",
  description: "Musaküçədə təhsilin izi — məktəb tarixi, müəllimlər, məzunlar və nailiyyətlər.",
  path: "/tehsil",
});

const TIMELINE_KINDS: EducationKind[] = ["ImportantDate", "SchoolHistory"];
const STORY_KINDS: EducationKind[] = ["Story"];
const TEACHER_KINDS: EducationKind[] = ["FirstTeacher", "NotableTeacher"];
const GRADUATE_KINDS: EducationKind[] = ["NotableGraduate", "Achievement"];
const SCHOOL_KINDS: EducationKind[] = ["FirstSchool", "Institution"];

function EntryCard({ entry }: { entry: EducationEntryDto }) {
  return (
    <Card variant="default">
      <CardMedia aspect="video">
        <VillagePhoto
          src={entry.coverImageUrl ?? undefined}
          alt={entry.title}
          tone="warm"
          placeholderLabel={entry.title}
          sizes="(min-width: 640px) 33vw, 100vw"
        />
      </CardMedia>
      <CardBody>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="terracotta">{educationEntryKindLabel(entry)}</Badge>
          {entry.period ? <Badge tone="neutral">{entry.period}</Badge> : null}
        </div>
        <CardTitle className="mt-2 text-base">
          <Link href={`/tehsil/${entry.id}`} className="hover:underline">
            {entry.title}
          </Link>
        </CardTitle>
        {entry.summary ? <CardDescription>{entry.summary}</CardDescription> : null}
        <p className="mt-3 text-xs text-ink-faint">{sourceStatusLabels[entry.sourceStatus]}</p>
      </CardBody>
    </Card>
  );
}

function EntrySection({ title, entries }: { title: string; entries: EducationEntryDto[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="mb-14">
      <h2 className="mb-5 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-forest">
        {title}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

const EMPTY_ENTRIES: EducationEntryDto[] = [];
const EMPTY_PHOTOS: PhotoDto[] = [];
const EMPTY_VIDEOS: VideoDto[] = [];

export default async function TehsilPage() {
  const [
    { data: entries, isLive: entriesLive },
    { data: relatedPhotos, isLive: photosLive },
    { data: relatedVideos, isLive: videosLive },
  ] = await Promise.all([
    withFallback(() => educationApi.getPaged({ publicationStatus: "Published", pageSize: 100 }).then((r) => r.items), EMPTY_ENTRIES),
    withFallback(() => photosApi.getPaged({ category: "Mektab", publicationStatus: "Published", pageSize: 6 }).then((r) => r.items), EMPTY_PHOTOS),
    withFallback(() => videosApi.getPaged({ search: "məktəb", publicationStatus: "Published", pageSize: 4 }).then((r) => r.items), EMPTY_VIDEOS),
  ]);
  // Three independent sources feed this one page — if any is on fallback,
  // the combined page (e.g. "Əlaqəli fotolar" silently absent) can't be
  // told apart from a fully-live, genuinely-sparse page without this.
  const isLive = entriesLive && photosLive && videosLive;

  const byKind = (kinds: EducationKind[]) => entries.filter((e) => kinds.includes(e.kind));
  const timeline = byKind(TIMELINE_KINDS);
  const stories = byKind(STORY_KINDS);
  const teachers = byKind(TEACHER_KINDS);
  const graduates = byKind(GRADUATE_KINDS);
  const schools = byKind(SCHOOL_KINDS);
  const other = entries.filter((e) => !["ImportantDate", "SchoolHistory", "Story", "FirstTeacher", "NotableTeacher", "NotableGraduate", "Achievement", "FirstSchool", "Institution"].includes(e.kind));

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <DataSourceNote isLive={isLive} />
        <SectionHeading
          as="h1"
          eyebrow="Musaküçədə təhsilin izi"
          title="Təhsil"
          description="Kəndimizin məktəb tarixi, müəllimləri, məzunları və təhsil nailiyyətləri."
          className="mb-12"
        />

        {entries.length === 0 ? (
          <EmptyState title="Bu bölmədə hələ məlumat yoxdur." />
        ) : (
          <>
            <EntrySection title="Təhsil tarixçəsi" entries={timeline} />
            <EntrySection title="Mühüm hekayələr" entries={stories} />
            <EntrySection title="Müəllimlərimiz" entries={teachers} />
            <EntrySection title="Məzunlar və nailiyyətlər" entries={graduates} />
            <EntrySection title="Məktəb tarixi" entries={schools} />
            <EntrySection title="Digər" entries={other} />
          </>
        )}

        {relatedPhotos.length > 0 ? (
          <div className="mb-14">
            <h2 className="mb-5 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-forest">
              Əlaqəli fotolar
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {relatedPhotos.map((photo) => (
                <div key={photo.id} className="aspect-square overflow-hidden rounded-lg">
                  <VillagePhoto src={photo.imageUrl} alt={photo.altText ?? photo.title} tone="warm" placeholderLabel={photo.title} sizes="16vw" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {relatedVideos.length > 0 ? (
          <div>
            <h2 className="mb-5 font-display text-[length:var(--text-h3)] leading-[var(--text-h3--line-height)] text-forest">
              Əlaqəli videolar
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {relatedVideos.map((video) => (
                <li key={video.id} className="rounded-lg border border-stone-light bg-paper p-4">
                  <Link href="/videolar" className="font-medium text-ink hover:text-forest">
                    {video.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </PageShell>
  );
}
