import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { VillagePhoto } from "@/components/ui/VillagePhoto";
import { EmptyState } from "@/components/ui/EmptyState";
import { interviewsApi } from "@/lib/api/interviews";
import { withFallback } from "@/lib/api/withFallback";
import { buildPageMetadata } from "@/lib/seo";
import type { InterviewDto, PagedResult } from "@/lib/api/types";

export const metadata: Metadata = buildPageMetadata({
  title: "Kəndimizin səsi",
  description: "Kənd sakinləri ilə söhbətlər və şifahi tarix qeydləri — Musaküçənin yaddaşı danışır.",
  path: "/kendimizin-sesi",
});

const FALLBACK: PagedResult<InterviewDto> = {
  items: [],
  page: 1,
  pageSize: 60,
  totalCount: 0,
  totalPages: 0,
};

export default async function KendimizinSesiPage() {
  const { data } = await withFallback(
    () => interviewsApi.getPaged({ publicationStatus: "Published", pageSize: 60 }),
    FALLBACK,
  );

  return (
    <PageShell>
      <Container className="py-16 sm:py-20">
        <SectionHeading
          as="h1"
          eyebrow="Şifahi tarix"
          title="Kəndimizin səsi"
          description="Kəndimizin yaddaşı danışır — sakinlərimizin öz sözləri ilə xatirələr, hekayələr və ənənələr."
          className="mb-10"
        />

        {data.items.length === 0 ? (
          <EmptyState title="Kəndimizin səsi arxivinə hələ müsahibə əlavə edilməyib." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {data.items.map((interview) => (
              <Link key={interview.id} href={`/kendimizin-sesi/${interview.id}`} className="group relative overflow-hidden rounded-xl">
                <div className="aspect-[4/3]">
                  <VillagePhoto
                    src={interview.thumbnailImageUrl ?? undefined}
                    alt={interview.personName}
                    tone="forest"
                    placeholderLabel={interview.personName}
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div
                  aria-hidden
                  className="absolute top-1/2 left-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow-md transition-transform group-hover:scale-105"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="ml-0.5 h-6 w-6 text-forest">
                    <path d="M6 4.5v11l9-5.5-9-5.5Z" />
                  </svg>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <Badge tone="gold" className="mb-2">
                    Müsahibə
                  </Badge>
                  <p className="font-display text-lg text-cream">{interview.personName}</p>
                  {interview.title ? <p className="text-sm text-cream/80">{interview.title}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </PageShell>
  );
}
