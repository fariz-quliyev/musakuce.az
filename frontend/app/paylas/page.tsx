import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CommunitySubmissionForm } from "@/components/forms/CommunitySubmissionForm";
import type { SubmissionKind } from "@/lib/api/types";

const VALID_KINDS: SubmissionKind[] = ["Photo", "Video", "Memory", "HistoricalInfo"];

const KIND_COPY: Record<SubmissionKind, { eyebrow: string; title: string; description: string }> = {
  Photo: {
    eyebrow: "Töhfə",
    title: "Foto göndər",
    description: "Köhnə və ya yeni fotolarınızı kənd arxivi ilə paylaşın.",
  },
  Video: {
    eyebrow: "Töhfə",
    title: "Video göndər",
    description: "Kənd həyatından görüntülərinizi bizimlə paylaşın.",
  },
  Memory: {
    eyebrow: "Töhfə",
    title: "Xatirə paylaş",
    description: "Kəndlə bağlı xatirələrinizi, hekayələrinizi bölüşün.",
  },
  HistoricalInfo: {
    eyebrow: "Töhfə",
    title: "Tarixi məlumat göndər",
    description: "Kəndin tarixinə dair bildiyiniz məlumatları bizimlə paylaşın.",
  },
};

type Props = { searchParams: Promise<{ kind?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { kind } = await searchParams;
  const resolved = VALID_KINDS.includes(kind as SubmissionKind) ? (kind as SubmissionKind) : "Memory";
  return { title: `${KIND_COPY[resolved].title} — Musaküçə` };
}

export default async function PaylasPage({ searchParams }: Props) {
  const { kind } = await searchParams;
  const resolved = VALID_KINDS.includes(kind as SubmissionKind) ? (kind as SubmissionKind) : "Memory";
  const copy = KIND_COPY[resolved];

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading as="h1" eyebrow={copy.eyebrow} title={copy.title} description={copy.description} className="mb-10" />
        <div className="mx-auto max-w-2xl rounded-xl border border-stone-light bg-paper-soft p-6 sm:p-10">
          <CommunitySubmissionForm kind={resolved} />
        </div>
      </Container>
    </PageShell>
  );
}
